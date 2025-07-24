import * as fs from "fs";
import * as path from "path";
import { createWorker } from "tesseract.js";

export class FileProcessor {
  private static ocrWorker: any = null;

  private static async getOCRWorker() {
    if (!this.ocrWorker) {
      this.ocrWorker = await createWorker('eng');
    }
    return this.ocrWorker;
  }

  static async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      // Use pdf2pic with dynamic import to convert PDF to images, then OCR
      console.log('Converting PDF to images for OCR processing...');
      
      const pdf2pic = await import("pdf2pic");
      const convert = pdf2pic.default;
      
      const options = {
        density: 200,           // Output DPI
        saveFilename: "page",   // Output filename
        savePath: path.dirname(filePath), // Save to same directory
        format: "png",          // Output format
        width: 2000,           // Output width
        height: 2000,          // Output height
      };

      const convertPDF = convert(filePath, options);
      const results = await convertPDF.bulk(-1); // Convert all pages
      
      if (!results || results.length === 0) {
        throw new Error('Failed to convert PDF pages to images');
      }

      let fullText = '';
      
      // Process each page with OCR
      for (const result of results) {
        if (result.path) {
          try {
            const pageText = await this.extractTextFromImage(result.path);
            if (pageText.trim()) {
              fullText += pageText + '\n\n';
            }
            
            // Clean up temporary image file
            fs.unlinkSync(result.path);
          } catch (ocrError) {
            console.error(`OCR failed for page ${result.name}:`, ocrError);
          }
        }
      }

      const finalText = fullText.trim();
      if (!finalText) {
        throw new Error('No readable text found in the PDF. The document might be empty or contain only non-text content.');
      }

      return finalText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`PDF processing is currently unavailable. Please upload your resume as an image (PNG/JPG) instead for OCR processing.`);
    }
  }

  static async extractTextFromImage(filePath: string): Promise<string> {
    try {
      const worker = await this.getOCRWorker();
      const { data: { text } } = await worker.recognize(filePath);
      return text;
    } catch (error) {
      throw new Error(`Failed to extract text from image: ${error}`);
    }
  }

  static async extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      return this.extractTextFromPDF(filePath);
    } else if (mimeType.startsWith('image/')) {
      return this.extractTextFromImage(filePath);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }

  static cleanup(filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to cleanup file ${filePath}:`, error);
    }
  }
}
