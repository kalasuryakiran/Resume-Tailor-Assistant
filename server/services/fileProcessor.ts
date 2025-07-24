import * as fs from "fs";
import * as path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export class FileProcessor {

  static async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      console.log('Extracting text from PDF...');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      
      const text = data.text.trim();
      if (!text) {
        throw new Error('No text found in PDF. The document might be empty or image-based.');
      }
      
      return text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async extractTextFromWord(filePath: string): Promise<string> {
    try {
      console.log('Extracting text from Word document...');
      const dataBuffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      
      const text = result.value.trim();
      if (!text) {
        throw new Error('No text found in Word document. The document might be empty.');
      }
      
      return text;
    } catch (error) {
      console.error('Word extraction error:', error);
      throw new Error(`Failed to extract text from Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      return this.extractTextFromPDF(filePath);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               mimeType === 'application/msword') {
      return this.extractTextFromWord(filePath);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}. Please upload a PDF or Word document.`);
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
