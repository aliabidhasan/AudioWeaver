export enum ProcessingStep {
  Upload = 1,
  Analyze = 2,
  Listen = 3,
  Reflect = 4
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file: File;
}

export interface UserContext {
  question: string;
  knowledge: string;
  interest: string;
  conversation: string;
}

export interface ProcessingStatus {
  status: 'idle' | 'extracting' | 'summarizing' | 'converting' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
}

export interface Summary {
  id: string;
  title: string;
  description: string;
  text: string;
  audioUrl: string;
  createdAt: string;
}

export interface UserReflection {
  pride: string;
  surprise: string;
  question: string;
  role: string;
}

export interface ApiKeys {
  gemini: string;
  elevenlabs: string;
}
