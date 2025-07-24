import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Sparkles } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { AnalysisResults } from "@/components/AnalysisResults";
import type { AnalysisResult } from "@shared/schema";

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeResumeMutation = useMutation({
    mutationFn: async (data: { resumeText: string; jobDescription: string }) => {
      const response = await apiRequest("POST", "/api/analyze-resume", data);
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Your resume has been successfully analyzed!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!resumeText.trim()) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume first.",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please enter the job description.",
        variant: "destructive",
      });
      return;
    }

    analyzeResumeMutation.mutate({
      resumeText: resumeText.trim(),
      jobDescription: jobDescription.trim(),
    });
  };

  const isAnalyzeDisabled = !resumeText.trim() || !jobDescription.trim() || analyzeResumeMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">AI Resume Tailor</h1>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <span className="text-sm text-gray-500">Powered by Gemini AI</span>
              <Button variant="ghost" size="sm">Help</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Optimize Your Resume with AI</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your resume and job description to get an instant match score, identify missing skills, 
            and receive tailored suggestions to improve your application.
          </p>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <FileUpload onTextExtracted={setResumeText} />
          <JobDescriptionInput 
            value={jobDescription}
            onChange={setJobDescription}
          />
        </div>

        {/* Analyze Button */}
        <div className="text-center mb-8">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzeDisabled}
            size="lg"
            className="px-8 py-3 text-lg font-semibold"
          >
            {analyzeResumeMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Analyze Resume
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {analysisResult && (
          <AnalysisResults result={analysisResult} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2024 AI Resume Tailor. Powered by Google Gemini AI.</p>
            <p className="mt-2">Your data is processed securely and not stored permanently.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
