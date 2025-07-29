# Resume Tailoring Assistant

## Overview

This is an AI-powered resume tailoring assistant that helps job seekers optimize their resumes for specific job descriptions. The application analyzes uploaded resumes against job descriptions, provides match scores, identifies missing skills, and generates optimized resume content using Google's Gemini AI.

**Status**: Fully functional and Netlify-ready (January 2025)
- ✓ File upload system working (PDF and Word documents)
- ✓ Gemini AI integration providing detailed analysis
- ✓ Match scoring system (overall, skills, experience)  
- ✓ Missing skills identification with priority levels
- ✓ Resume optimization with authentic content enhancement
- ✓ Actionable improvement suggestions
- ✓ Support for PDF and Word document processing (.pdf, .doc, .docx)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend, backend, and shared components:

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **File Processing**: Multer for file uploads, Tesseract.js for OCR, pdf-parse for PDF text extraction
- **AI Integration**: Google Gemini API for resume analysis
- **Storage**: Stateless architecture - no database required

### Shared Components
- **Schema Validation**: Zod for runtime type validation
- **Database Schema**: Shared Drizzle schema definitions
- **Type Safety**: Full TypeScript coverage across frontend and backend

## Key Components

### File Processing Service
- Handles PDF and Word document uploads (.pdf, .doc, .docx)
- Extracts text content using pdf-parse and mammoth libraries
- Robust file validation and cleanup utilities
- Support for both traditional and modern document formats

### AI Analysis Service
- Integrates with Google Gemini API for intelligent resume analysis
- Calculates match scores between resumes and job descriptions
- Identifies missing skills with priority levels
- Generates optimized resume sections
- Provides actionable improvement suggestions

### Frontend Components
- **FileUpload**: Drag-and-drop interface with file validation
- **JobDescriptionInput**: Text area with clipboard integration
- **AnalysisResults**: Comprehensive display of analysis results with copy/download functionality

### API Layer
- Stateless resume analysis endpoints
- File upload and processing endpoints
- Health check and monitoring endpoints

## Data Flow

1. **File Upload**: User uploads resume file → Server processes and extracts text
2. **Job Input**: User provides job description text
3. **Analysis Request**: Frontend sends resume text + job description to backend
4. **AI Processing**: Backend calls Gemini API with structured prompts
5. **Results Display**: Frontend renders analysis results with interactive features

## External Dependencies

### AI Services
- **Google Gemini API**: Primary AI service for resume analysis and optimization
- **Environment Variables**: `GEMINI_API_KEY` or `GOOGLE_API_KEY` required

### Deployment
- **Stateless Architecture**: No database dependencies for easy deployment
- **Netlify Functions**: Serverless backend deployment ready

### File Processing
- **Tesseract.js**: OCR processing for image files
- **pdf-parse**: PDF text extraction library

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## Deployment Strategy

### Development
- **Vite Dev Server**: Hot module replacement for frontend development
- **tsx**: TypeScript execution for backend development
- **File Uploads**: Local filesystem storage in `uploads/` directory

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations in `migrations/` directory
- **Environment**: Production environment variables required

### Key Configuration
- **Build Command**: `npm run build` - Builds both frontend and backend
- **Start Command**: `npm start` - Runs production server
- **Database**: `npm run db:push` - Applies schema changes

The application is designed to be deployable on platforms like Replit, Vercel, or similar Node.js hosting services with minimal configuration changes.