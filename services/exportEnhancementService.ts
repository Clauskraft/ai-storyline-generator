/**
 * Enhanced Export Service
 * Adds PDF, HTML, and other export formats beyond PPTX
 */

import PptxGenJS from 'pptxgenjs';
import { Slide } from '../types';

export type ExportFormat = 'pptx' | 'pdf' | 'html' | 'json';

interface ExportOptions {
  includeSpeakerNotes?: boolean;
  includeMetadata?: boolean;
  watermark?: string;
  quality?: 'high' | 'medium' | 'low';
}

class EnhancedExportService {
  /**
   * Export to PowerPoint (enhanced)
   */
  public async exportToPPTX(
    slides: Slide[],
    brandKit: any,
    options: ExportOptions = {}
  ): Promise<void> {
    const pptx = new PptxGenJS();
    
    // Set brand colors
    pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 7.5 });
    pptx.layout = 'CUSTOM';
    
    if (brandKit?.primaryColor) {
      pptx.defineSlideMaster({
        title: 'MASTER_TITLE',
        background: { color: brandKit.primaryColor },
      });
    }

    slides.forEach((slide, index) => {
      const pptxSlide = pptx.addSlide();
      
      // Add title
      pptxSlide.addText(slide.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: brandKit?.primaryColor || '363636',
      });

      // Add content
      pptxSlide.addText(slide.content, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 3,
        fontSize: 14,
        color: '363636',
      });

      // Add speaker notes if enabled
      if (options.includeSpeakerNotes && slide.speakerNotes) {
        pptxSlide.addNotes(slide.speakerNotes);
      }

      // Add watermark if provided
      if (options.watermark) {
        pptxSlide.addText(options.watermark, {
          x: 8,
          y: 6.5,
          w: 1.5,
          h: 0.3,
          fontSize: 10,
          color: 'A0A0A0',
          align: 'right',
        });
      }
    });

    // Add metadata
    if (options.includeMetadata) {
      pptx.author = 'AI Storyline Generator';
      pptx.company = 'AI Storyline Generator';
      pptx.revision = '1.0';
    }

    await pptx.writeFile({ fileName: 'presentation.pptx' });
  }

  /**
   * Export to PDF (via HTML to PDF conversion)
   */
  public async exportToPDF(
    slides: Slide[],
    brandKit: any,
    options: ExportOptions = {}
  ): Promise<void> {
    // First export to HTML
    const htmlContent = this.exportToHTML(slides, brandKit, options);

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window for printing to PDF
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }

    // For direct PDF generation, you would use a library like jsPDF
    // For now, we use the browser's print-to-PDF functionality
  }

  /**
   * Export to HTML (interactive presentation)
   */
  public exportToHTML(
    slides: Slide[],
    brandKit: any,
    options: ExportOptions = {}
  ): string {
    const primaryColor = brandKit?.primaryColor || '#14b8a6';
    const secondaryColor = brandKit?.secondaryColor || '#6366f1';
    const fontFamily = brandKit?.font || 'Arial';

    const slidesHTML = slides.map((slide, index) => `
      <div class="slide" data-slide="${index + 1}">
        <h2 class="slide-title">${this.escapeHtml(slide.title)}</h2>
        <div class="slide-content">${this.formatContent(slide.content)}</div>
        ${slide.speakerNotes && options.includeSpeakerNotes ? `
          <div class="speaker-notes">
            <strong>Speaker Notes:</strong> ${this.escapeHtml(slide.speakerNotes)}
          </div>
        ` : ''}
      </div>
    `).join('');

    const navigationDots = slides.map((_, index) => 
      `<span class="nav-dot" data-slide="${index + 1}"></span>`
    ).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Storyline Presentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: '${fontFamily}', sans-serif;
      background: linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15);
      overflow-x: hidden;
    }
    .presentation-container {
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      padding: 20px;
    }
    .slide {
      min-height: 80vh;
      background: white;
      border-radius: 12px;
      padding: 60px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      margin-bottom: 40px;
      display: none;
      animation: fadeIn 0.5s ease-in;
    }
    .slide.active { display: block; }
    .slide-title {
      color: ${primaryColor};
      font-size: 36px;
      margin-bottom: 30px;
      font-weight: bold;
      border-bottom: 3px solid ${secondaryColor};
      padding-bottom: 15px;
    }
    .slide-content {
      font-size: 18px;
      line-height: 1.8;
      color: #333;
    }
    .slide-content ul, .slide-content ol {
      margin-left: 30px;
      margin-top: 15px;
    }
    .speaker-notes {
      margin-top: 40px;
      padding: 20px;
      background: #f5f5f5;
      border-left: 4px solid ${secondaryColor};
      font-style: italic;
    }
    .navigation {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      z-index: 1000;
    }
    .nav-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ccc;
      cursor: pointer;
      transition: all 0.3s;
    }
    .nav-dot:hover { transform: scale(1.2); }
    .nav-dot.active { background: ${primaryColor}; }
    .nav-buttons {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1000;
    }
    .nav-btn {
      padding: 15px 25px;
      background: ${primaryColor};
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      font-size: 24px;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .nav-btn:hover {
      background: ${secondaryColor};
      transform: scale(1.1);
    }
    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .prev-btn { left: 20px; }
    .next-btn { right: 20px; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @media print {
      body { background: white; }
      .slide { display: block !important; page-break-after: always; }
      .navigation, .nav-buttons { display: none; }
    }
  </style>
</head>
<body>
  <div class="presentation-container">
    ${slidesHTML}
  </div>
  
  <div class="nav-buttons">
    <button class="nav-btn prev-btn" onclick="changeSlide(-1)">‹</button>
    <button class="nav-btn next-btn" onclick="changeSlide(1)">›</button>
  </div>
  
  <div class="navigation">
    ${navigationDots}
  </div>

  <script>
    let currentSlide = 1;
    const totalSlides = ${slides.length};

    function showSlide(n) {
      if (n > totalSlides) n = 1;
      if (n < 1) n = totalSlides;
      currentSlide = n;
      
      document.querySelectorAll('.slide').forEach((s, i) => {
        s.classList.toggle('active', i + 1 === n);
      });
      
      document.querySelectorAll('.nav-dot').forEach((d, i) => {
        d.classList.toggle('active', i + 1 === n);
      });

      document.querySelector('.prev-btn').disabled = n === 1;
      document.querySelector('.next-btn').disabled = n === totalSlides;
    }

    function changeSlide(direction) {
      showSlide(currentSlide + direction);
    }

    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
      dot.addEventListener('click', () => showSlide(i + 1));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') changeSlide(1);
      if (e.key === 'ArrowLeft') changeSlide(-1);
    });

    showSlide(1);
  </script>
</body>
</html>`;
  }

  /**
   * Export to JSON (data format)
   */
  public exportToJSON(
    slides: Slide[],
    brandKit: any,
    options: ExportOptions = {}
  ): string {
    const data = {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      brandKit,
      slides,
      metadata: {
        slideCount: slides.length,
        totalDuration: slides.length * 2, // estimated minutes
        includeSpeakerNotes: options.includeSpeakerNotes || false,
      },
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Download any format
   */
  public async downloadExport(
    format: ExportFormat,
    filename: string,
    slides: Slide[],
    brandKit: any,
    options: ExportOptions = {}
  ): Promise<void> {
    switch (format) {
      case 'pptx':
        await this.exportToPPTX(slides, brandKit, options);
        break;
      
      case 'pdf':
        await this.exportToPDF(slides, brandKit, options);
        break;
      
      case 'html':
        const htmlContent = this.exportToHTML(slides, brandKit, options);
        this.downloadBlob(htmlContent, 'text/html', `${filename}.html`);
        break;
      
      case 'json':
        const jsonContent = this.exportToJSON(slides, brandKit, options);
        this.downloadBlob(jsonContent, 'application/json', `${filename}.json`);
        break;
    }
  }

  private downloadBlob(content: string, mimeType: string, filename: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private formatContent(content: string): string {
    // Convert markdown-like formatting to HTML
    let formatted = this.escapeHtml(content);
    
    // Bullet points
    formatted = formatted.replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Bold
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }
}

// Export singleton instance
export const enhancedExportService = new EnhancedExportService();

