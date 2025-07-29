
import mammoth from "mammoth";

// Workaround for pdf-parse initialization issue
let pdfParse: any = null;
async function getPdfParse() {
  if (!pdfParse) {
    // Create the test directory and file that pdf-parse expects during initialization
    // Now import pdf-parse
    pdfParse = (await import("pdf-parse")).default;
  }
  return pdfParse;
}

export class FileProcessor {

  static async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      console.log('Extracting text from PDF...');
      const pdf = await getPdfParse();
      const data = await pdf(buffer);
      
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

  static async extractTextFromWord(buffer: Buffer): Promise<string> {
    try {
      console.log('Extracting text from Word document...');
      const result = await mammoth.extractRawText({ buffer });
      
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

  static async extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      return this.extractTextFromPDF(buffer);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               mimeType === 'application/msword') {
      return this.extractTextFromWord(buffer);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}. Please upload a PDF or Word document.`);
    }
  }
}
