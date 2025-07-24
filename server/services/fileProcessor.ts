import * as fs from "fs";
import * as path from "path";
import { createWorker } from "tesseract.js";

// Initialize PDF parser - will be loaded dynamically
let pdfParser: any = null;

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
      // Dynamically import pdf-parse to avoid initialization issues
      if (!pdfParser) {
        try {
          const pdfParseModule = await import("pdf-parse");
          pdfParser = pdfParseModule.default;
        } catch (importError) {
          throw new Error("PDF processing is currently unavailable. Please try uploading the file as an image instead.");
        }
      }
      
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParser(dataBuffer);
      return data.text;
    } catch (error) {
      if (error instanceof Error && error.message.includes("PDF processing is currently unavailable")) {
        throw error;
      }
      throw new Error(`Failed to extract text from PDF: ${error}`);
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
