import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// API Keys table
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  gemini: text("gemini").notNull(),
  elevenlabs: text("elevenlabs").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  gemini: true,
  elevenlabs: true
});

// Uploads table
export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  filepath: text("filepath").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUploadSchema = createInsertSchema(uploads).pick({
  filename: true,
  filepath: true,
  size: true
});

// Processing Jobs table
export const processingJobs = pgTable("processing_jobs", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("pending"),
  progress: integer("progress").notNull().default(0),
  uploadIds: jsonb("upload_ids").notNull(), // Array of upload IDs
  context: jsonb("context"), // Optional user context
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at")
});

export const insertProcessingJobSchema = createInsertSchema(processingJobs).pick({
  uploadIds: true,
  context: true
});

// Summaries table
export const summaries = pgTable("summaries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  text: text("text").notNull(),
  audioUrl: text("audio_url").notNull(),
  processingJobId: integer("processing_job_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertSummarySchema = createInsertSchema(summaries).pick({
  title: true,
  description: true,
  text: true,
  audioUrl: true,
  processingJobId: true
});

// Reflections table
export const reflections = pgTable("reflections", {
  id: serial("id").primaryKey(),
  summaryId: integer("summary_id").notNull(),
  pride: text("pride"),
  surprise: text("surprise"),
  question: text("question"),
  role: text("role"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertReflectionSchema = createInsertSchema(reflections).pick({
  summaryId: true,
  pride: true,
  surprise: true,
  question: true,
  role: true
});

// Audio Notes table
export const audio_notes = pgTable("audio_notes", {
  id: serial("id").primaryKey(),
  summaryId: integer("summary_id").notNull().references(() => summaries.id),
  timestamp: integer("timestamp").notNull(), // Timestamp in seconds in the audio
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertAudioNoteSchema = createInsertSchema(audio_notes).pick({
  summaryId: true,
  timestamp: true,
  text: true
});

// Users table (already existing in template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Type exports
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = z.infer<typeof insertUploadSchema>;

export type ProcessingJob = typeof processingJobs.$inferSelect;
export type InsertProcessingJob = z.infer<typeof insertProcessingJobSchema>;

export type Summary = typeof summaries.$inferSelect;
export type InsertSummary = z.infer<typeof insertSummarySchema>;

export type Reflection = typeof reflections.$inferSelect;
export type InsertReflection = z.infer<typeof insertReflectionSchema>;

export type AudioNote = typeof audio_notes.$inferSelect;
export type InsertAudioNote = z.infer<typeof insertAudioNoteSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
