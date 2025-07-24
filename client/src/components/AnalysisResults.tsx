import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  AlertTriangle, 
  FileEdit, 
  Lightbulb, 
  Copy, 
  Download,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AnalysisResult } from "@shared/schema";

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Resume content has been copied to your clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard. Please select and copy manually.",
        variant: "destructive",
      });
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return "Excellent match";
    if (score >= 60) return "Good alignment";
    return "Needs improvement";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertTriangle className="h-4 w-4" />;
      case "medium": return <Clock className="h-4 w-4" />;
      case "low": return <Target className="h-4 w-4" />;
      default: return null;
    }
  };

  const technicalSkills = result.missingSkills.filter(skill => skill.category === "technical");
  const softSkills = result.missingSkills.filter(skill => skill.category === "soft");

  const optimizedResumeText = `
PROFESSIONAL SUMMARY
${result.optimizedResume.summary}

TECHNICAL SKILLS
${result.optimizedResume.skills}

PROFESSIONAL EXPERIENCE
${result.optimizedResume.experience}

${result.optimizedResume.education ? `EDUCATION\n${result.optimizedResume.education}\n` : ''}
${result.optimizedResume.certifications ? `CERTIFICATIONS\n${result.optimizedResume.certifications}` : ''}
  `.trim();

  return (
    <div className="space-y-8" id="resultsSection">
      {/* Match Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 text-primary mr-2" />
            Match Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <div className="w-24 h-24 rounded-full border-8 border-gray-200 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${getScoreColor(result.matchScore)}`}>
                    {result.matchScore}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">Overall Match</p>
              <p className="text-xs text-gray-500">{getScoreDescription(result.matchScore)}</p>
            </div>

            {/* Skills Match */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <div className="w-24 h-24 rounded-full border-8 border-gray-200 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${getScoreColor(result.skillsMatch)}`}>
                    {result.skillsMatch}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">Skills Match</p>
              <p className="text-xs text-gray-500">{getScoreDescription(result.skillsMatch)}</p>
            </div>

            {/* Experience Match */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <div className="w-24 h-24 rounded-full border-8 border-gray-200 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${getScoreColor(result.experienceMatch)}`}>
                    {result.experienceMatch}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">Experience Match</p>
              <p className="text-xs text-gray-500">{getScoreDescription(result.experienceMatch)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Skills Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            Missing Skills & Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Skills */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Technical Skills
              </h4>
              <div className="space-y-2">
                {technicalSkills.length > 0 ? (
                  technicalSkills.map((skill, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${getPriorityColor(skill.priority)}`}
                    >
                      <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(skill.priority)}`}>
                        {getPriorityIcon(skill.priority)}
                        <span className="ml-1 capitalize">{skill.priority} Priority</span>
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">All technical skills covered!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Soft Skills */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Soft Skills & Keywords
              </h4>
              <div className="space-y-2">
                {softSkills.length > 0 ? (
                  softSkills.map((skill, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${getPriorityColor(skill.priority)}`}
                    >
                      <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(skill.priority)}`}>
                        {getPriorityIcon(skill.priority)}
                        <span className="ml-1 capitalize">{skill.priority} Priority</span>
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">All soft skills covered!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimized Resume Card */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileEdit className="h-5 w-5 text-primary mr-2" />
              Optimized Resume
            </CardTitle>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(optimizedResumeText)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy Text
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="optimized" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="optimized">Optimized Version</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="optimized" className="space-y-6 text-sm">
              {/* Professional Summary */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                  Professional Summary
                </h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {result.optimizedResume.summary}
                </p>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                  Technical Skills
                </h4>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {result.optimizedResume.skills}
                </div>
              </div>

              {/* Experience */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                  Professional Experience
                </h4>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {result.optimizedResume.experience}
                </div>
              </div>

              {/* Education */}
              {result.optimizedResume.education && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                    Education
                  </h4>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {result.optimizedResume.education}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {result.optimizedResume.certifications && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                    Certifications
                  </h4>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {result.optimizedResume.certifications}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="suggestions">
              <div className="space-y-4">
                {result.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 p-4 rounded-lg border ${getPriorityColor(suggestion.priority)}`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      suggestion.priority === 'high' ? 'bg-red-500' :
                      suggestion.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}>
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{suggestion.title}</h4>
                      <p className="text-sm text-gray-700">{suggestion.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
