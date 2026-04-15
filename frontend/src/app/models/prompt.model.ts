// Shared TypeScript interfaces for the AI Prompt Library

export interface Prompt {
  id: number;
  title: string;
  content: string;
  complexity: number;
  created_at: string;
  view_count: number;
}

export interface PromptListItem {
  id: number;
  title: string;
  complexity: number;
  created_at: string;
  view_count: number;
}

export interface CreatePromptPayload {
  title: string;
  content: string;
  complexity: number;
}

export interface ApiError {
  errors?: Record<string, string>;
  error?: string;
}
