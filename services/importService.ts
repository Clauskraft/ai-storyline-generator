import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker';
import { parse } from 'pptx-js';

// Configure the PDF.js worker
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

async function extractTextFromTxt(file: File): Promise<string> {
    return file.text();
}

async function extractTextFromPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        textContent += content.items.map((item: any) => item.str).join(' ');
        textContent += '\n\n'; // Page break
    }
    return textContent;
}

async function extractTextFromPptx(file: File): Promise<string> {
     const arrayBuffer = await file.arrayBuffer();
     const pptxData = await parse(arrayBuffer);
     let textContent = '';
     if (pptxData && pptxData.slides) {
        for (const slide of pptxData.slides) {
            if (slide.text) {
                textContent += `Slide ${slide.slideNumber}: ${slide.text.title || ''}\n`;
                if(slide.text.body) {
                    textContent += slide.text.body.map(item => item.text).join('\n');
                }
                textContent += '\n\n';
            }
        }
     }
     return textContent;
}


export async function extractTextFromFile(file: File): Promise<string> {
    switch (file.type) {
        case 'text/plain':
        case 'text/markdown':
            return extractTextFromTxt(file);
        case 'application/pdf':
            return extractTextFromPdf(file);
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            return extractTextFromPptx(file);
        default:
            throw new Error(`Unsupported file type: ${file.type}. Please upload a .txt, .md, .pdf, or .pptx file.`);
    }
}