import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, MissingSkill } from "@shared/schema";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "" 
});

export async function analyzeResumeWithGemini(
  resumeText: string, 
  jobDescription: string
): Promise<AnalysisResult> {
  try {
    const systemPrompt = `You are an expert resume tailoring and career insights AI. Your goal is to help a job seeker optimize their resume for a specific job description without fabricating any experience. You will analyze both documents, provide a match score, identify gaps, and rewrite sections of the resume to better align with the job's requirements.

IMPORTANT RULES:
- DO NOT HALLUCINATE OR FABRICATE ANY EXPERIENCES
- Every piece of information in the updated resume must be derivable from the original resume content
- Integrate missing skills only if they are truly present, implied, or a natural extension of existing experiences
- Maintain professional tone and format
- Use strong action verbs and quantifiable results where possible

ANALYSIS STEPS:
1. Extract key elements from job description (skills, tools, technologies, responsibilities, keywords)
2. Compare and contrast with resume content
3. Calculate match scores based on overlap and relevance
4. Identify missing/underrepresented skills
5. Strategize resume rewrite without inventing new experiences

Respond with valid JSON in the exact format specified in the schema.`;

    const userPrompt = `
RESUME CONTENT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Analyze the resume against the job description and provide:
1. Match scores (0-100%) for overall match, skills match, and experience match
2. Missing skills categorized as technical or soft skills with priority levels
3. Optimized resume sections (summary, skills, experience, education, certifications)
4. Improvement suggestions with priority levels

Focus on authentic improvements that highlight existing relevant experience and skills without fabrication.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            matchScore: { type: "number", minimum: 0, maximum: 100 },
            skillsMatch: { type: "number", minimum: 0, maximum: 100 },
            experienceMatch: { type: "number", minimum: 0, maximum: 100 },
            missingSkills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  category: { type: "string", enum: ["technical", "soft"] }
                },
                required: ["skill", "priority", "category"]
              }
            },
            optimizedResume: {
              type: "object",
              properties: {
                summary: { type: "string" },
                skills: { type: "string" },
                experience: { type: "string" },
                education: { type: "string" },
                certifications: { type: "string" }
              },
              required: ["summary", "skills", "experience"]
            },
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] }
                },
                required: ["title", "description", "priority"]
              }
            }
          },
          required: ["matchScore", "skillsMatch", "experienceMatch", "missingSkills", "optimizedResume", "suggestions"]
        },
        temperature: 0.3, // Lower temperature for more consistent results
      },
      contents: userPrompt,
    });

    const rawJson = response.text;
    
    if (!rawJson) {
      throw new Error("Empty response from Gemini API");
    }

    console.log("Gemini response received, parsing JSON...");
    
    try {
      const analysisData = JSON.parse(rawJson);
      
      // Validate and sanitize the response
      const result: AnalysisResult = {
        matchScore: Math.round(Math.max(0, Math.min(100, analysisData.matchScore || 0))),
        skillsMatch: Math.round(Math.max(0, Math.min(100, analysisData.skillsMatch || 0))),
        experienceMatch: Math.round(Math.max(0, Math.min(100, analysisData.experienceMatch || 0))),
        missingSkills: (analysisData.missingSkills || []).map((skill: any) => ({
          skill: skill.skill || "Unknown Skill",
          priority: ["high", "medium", "low"].includes(skill.priority) ? skill.priority : "medium",
          category: ["technical", "soft"].includes(skill.category) ? skill.category : "technical"
        })),
        optimizedResume: {
          summary: analysisData.optimizedResume?.summary || "Professional summary not available",
          skills: analysisData.optimizedResume?.skills || "Skills section not available", 
          experience: analysisData.optimizedResume?.experience || "Experience section not available",
          education: analysisData.optimizedResume?.education || "",
          certifications: analysisData.optimizedResume?.certifications || ""
        },
        suggestions: (analysisData.suggestions || []).map((suggestion: any) => ({
          title: suggestion.title || "Improvement Suggestion",
          description: suggestion.description || "No description available",
          priority: ["high", "medium", "low"].includes(suggestion.priority) ? suggestion.priority : "medium"
        }))
      };

      return result;
      
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON response:", parseError);
      console.error("Raw response:", rawJson);
      throw new Error("Invalid JSON response from Gemini API");
    }

  } catch (error) {
    console.error("Gemini API error:", error);
    
    if (error instanceof Error) {
      // Check for specific API errors
      if (error.message.includes("API key")) {
        throw new Error("Invalid or missing Gemini API key. Please check your configuration.");
      }
      if (error.message.includes("quota")) {
        throw new Error("Gemini API quota exceeded. Please try again later.");
      }
      if (error.message.includes("rate limit")) {
        throw new Error("Gemini API rate limit exceeded. Please try again in a moment.");
      }
      throw new Error(`Gemini API analysis failed: ${error.message}`);
    }
    
    throw new Error("Unknown error occurred during resume analysis");
  }
}
