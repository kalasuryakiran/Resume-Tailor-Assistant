import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Resume Analysis Schemas
export const resumeAnalysisSchema = z.object({
  resumeText: z.string().min(1, "Resume text is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});

export const missingSkillSchema = z.object({
  skill: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  category: z.enum(["technical", "soft"]),
});

export const analysisResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  skillsMatch: z.number().min(0).max(100),
  experienceMatch: z.number().min(0).max(100),
  missingSkills: z.array(missingSkillSchema),
  optimizedResume: z.object({
    summary: z.string(),
    skills: z.string(),
    experience: z.string(),
    education: z.string().optional(),
    certifications: z.string().optional(),
  }),
  suggestions: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(["high", "medium", "low"]),
  })),
});

export type ResumeAnalysisRequest = z.infer<typeof resumeAnalysisSchema>;
export type MissingSkill = z.infer<typeof missingSkillSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
