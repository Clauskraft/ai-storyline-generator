import PptxGenJS from 'pptxgenjs';
import { Slide, BrandKit, SlideLayout } from '../types';

async function getBase64FromImageUrl(url: string): Promise<string> {
    if (url.startsWith('data:image')) {
        return url;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error converting image URL to base64:", error);
        throw new Error("Could not load an image for the presentation.");
    }
}

function hexToRgb(hex: string) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}


export async function exportToPptx(slides: Slide[], brandKit: BrandKit): Promise<void> {
    const pptx = new PptxGenJS();
    
    pptx.layout = 'LAYOUT_WIDE';
    const primaryColor = brandKit.primaryColor.replace('#', '');
    const secondaryColor = brandKit.secondaryColor.replace('#', '');

    for (const slideData of slides) {
        const slide = pptx.addSlide();
        slide.background = { color: '1F2937' }; // bg-gray-800
        
        if (slideData.speakerNotes) {
            slide.addNotes(slideData.speakerNotes);
        }

        // Fix: Use TextPropsOptions for the options type, as it includes properties like align, x, y etc.
        const addTitle = (options: Partial<PptxGenJS.TextPropsOptions> = {}) => {
             slide.addText(slideData.title, {
                x: 0.5, y: 0.25, w: '90%', h: 0.75,
                fontSize: 32,
                bold: true,
                color: primaryColor,
                fontFace: brandKit.font,
                ...options
            });
        };

        const addContent = (options: Partial<PptxGenJS.TextPropsOptions> = {}) => {
            const contentLines = slideData.content.split('\n').filter(line => line.trim() !== '');
            // Fix: Map string array to an array of TextProps objects, as required by addText for bullet points.
            slide.addText(contentLines.map(text => ({ text })), {
                fontSize: 16,
                color: 'E5E7EB',
                fontFace: brandKit.font,
                bullet: { code: '25CF' }, // diamond shape
                ...options
            });
        };

        const addImage = async (options: Partial<PptxGenJS.ImageProps> = {}) => {
             if (slideData.imageUrl) {
                try {
                    const imageBase64 = await getBase64FromImageUrl(slideData.imageUrl);
                    slide.addImage({ data: imageBase64, ...options });
                } catch (error) {
                     console.error(`Skipping image for slide "${slideData.title}" due to an error.`, error);
                }
            }
        }

        // Apply layout
        switch (slideData.layout) {
            case 'TITLE_ONLY':
                addTitle({ align: 'center', valign: 'middle', y: 0.5, h: '90%' });
                break;
            
            case 'FULL_IMAGE':
                await addImage({ x:0, y:0, w:'100%', h:'100%' });
                // Add title with a semi-transparent background for readability
                slide.addText(slideData.title, { 
                    x: '5%', y: '80%', w: '90%', h: '15%', 
                    fontSize: 40, bold: true, color: 'FFFFFF', fontFace: brandKit.font, 
                    align: 'center', valign: 'middle',
                    fill: { color: secondaryColor, transparency: 30 }
                });
                break;
            
            case 'CONTENT_RIGHT':
                addTitle();
                addContent({ x: '52%', y: 1.2, w: '45%', h: 4 });
                await addImage({ x: 0.5, y: 1.2, w: '45%', h: 4, sizing: { type: 'contain', w: '45%', h: 4 } });
                break;
            
            case 'TWO_COLUMNS':
                 addTitle();
                 const contentLines = slideData.content.split('\n').filter(line => line.trim() !== '');
                 const midPoint = Math.ceil(contentLines.length / 2);
                 const col1 = contentLines.slice(0, midPoint);
                 const col2 = contentLines.slice(midPoint);
                 if (col1.length > 0) {
                    slide.addText(col1.map(text => ({text})), { x: 0.5, y: 1.2, w: '45%', h: 4, fontSize: 16, color: 'E5E7EB', fontFace: brandKit.font, bullet: { code: '25CF' } });
                 }
                 if (col2.length > 0) {
                    slide.addText(col2.map(text => ({text})), { x: 5.2, y: 1.2, w: '45%', h: 4, fontSize: 16, color: 'E5E7EB', fontFace: brandKit.font, bullet: { code: '25CF' } });
                 }
                break;

            case 'TITLE_CONTENT':
            default:
                addTitle();
                addContent({ x: 0.5, y: 1.2, w: '45%', h: 4 });
                await addImage({ x: '52%', y: 1.2, w: '45%', h: 4, sizing: { type: 'contain', w: '45%', h: 4 } });
                break;
        }
    }
    
    await pptx.writeFile({ fileName: 'presentation.pptx' });
}
