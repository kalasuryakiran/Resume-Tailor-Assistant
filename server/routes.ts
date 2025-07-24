import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { FileProcessor } from "./services/fileProcessor";
import { analyzeResumeWithGemini } from "./services/gemini";
import { resumeAnalysisSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG, and WEBP files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // File upload endpoint
  app.post("/api/upload-resume", upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filePath = req.file.path;
      const mimeType = req.file.mimetype;

      // Extract text from the uploaded file
      const extractedText = await FileProcessor.extractTextFromFile(filePath, mimeType);
      
      // Clean up the uploaded file
      FileProcessor.cleanup(filePath);

      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ 
          message: "No text could be extracted from the file. Please ensure the file contains readable text." 
        });
      }

      res.json({
        success: true,
        extractedText: extractedText.trim(),
        filename: req.file.originalname,
        size: req.file.size
      });

    } catch (error) {
      // Clean up file on error
      if (req.file?.path) {
        FileProcessor.cleanup(req.file.path);
      }
      
      console.error("Upload error:", error);
      
      let errorMessage = "Failed to process uploaded file";
      if (error instanceof Error) {
        if (error.message.includes('image-based') || error.message.includes('scanned text')) {
          errorMessage = error.message;
        } else if (error.message.includes('Unable to process this PDF')) {
          errorMessage = error.message;
        } else {
          errorMessage = `Upload failed: ${error.message}`;
        }
      }
      
      res.status(500).json({ message: errorMessage });
    }
  });

  // Resume analysis endpoint
  app.post("/api/analyze-resume", async (req, res) => {
    try {
      // Validate request body
      const validatedData = resumeAnalysisSchema.parse(req.body);
      
      // Analyze with Gemini
      const analysisResult = await analyzeResumeWithGemini(
        validatedData.resumeText,
        validatedData.jobDescription
      );

      res.json({
        success: true,
        analysis: analysisResult
      });

    } catch (error) {
      console.error("Analysis error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: error.errors
        });
      }

      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to analyze resume"
      });
    }
  });

  // Error handling middleware for multer
  app.use((error: any, req: any, res: any, next: any) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: "File too large. Maximum size is 10MB." 
        });
      }
      return res.status(400).json({ 
        message: `Upload error: ${error.message}` 
      });
    }
    next(error);
  });

  const httpServer = createServer(app);
  return httpServer;
}
