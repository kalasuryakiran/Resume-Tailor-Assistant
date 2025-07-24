import * as fs from "fs";
import * as path from "path";
import mammoth from "mammoth";

// Workaround for pdf-parse initialization issue
let pdfParse: any = null;
async function getPdfParse() {
  if (!pdfParse) {
    // Create the test directory and file that pdf-parse expects during initialization
    const testDir = path.join(process.cwd(), 'test', 'data');
    const testFile = path.join(testDir, '05-versions-space.pdf');
    
    try {
      // Create directory if it doesn't exist
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      
      // Create a minimal dummy PDF if it doesn't exist
      if (!fs.existsSync(testFile)) {
        // Create a minimal PDF structure (just enough to prevent the error)
        const minimalPdf = Buffer.from([
          0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, // %PDF-1.4
          0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A, // binary comment
          0x31, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, // 1 0 obj
          0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F, 0x43, 0x61, 0x74, 0x61, 0x6C, 0x6F, 0x67, 0x2F, 0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A, // <</Type/Catalog/Pages 2 0 R>>
          0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, // endobj
          0x78, 0x72, 0x65, 0x66, 0x0A, 0x30, 0x20, 0x33, 0x0A, // xref 0 3
          0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x36, 0x35, 0x35, 0x33, 0x35, 0x20, 0x66, 0x20, 0x0A, // 0000000000 65535 f
          0x74, 0x72, 0x61, 0x69, 0x6C, 0x65, 0x72, 0x0A, 0x3C, 0x3C, 0x2F, 0x53, 0x69, 0x7A, 0x65, 0x20, 0x33, 0x2F, 0x52, 0x6F, 0x6F, 0x74, 0x20, 0x31, 0x20, 0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A, // trailer <</Size 3/Root 1 0 R>>
          0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, 0x66, 0x0A, 0x31, 0x38, 0x34, 0x0A, 0x25, 0x25, 0x45, 0x4F, 0x46 // startxref 184 %%EOF
        ]);
        fs.writeFileSync(testFile, minimalPdf);
      }
    } catch (error) {
      console.warn('Could not create pdf-parse test file, continuing anyway:', error);
    }
    
    // Now import pdf-parse
    pdfParse = (await import("pdf-parse")).default;
  }
  return pdfParse;
}

export class FileProcessor {

  static async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      console.log('Extracting text from PDF...');
      const dataBuffer = fs.readFileSync(filePath);
      const pdf = await getPdfParse();
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
