export type SlideLayout = 
  | 'TITLE_CONTENT' 
  | 'TITLE_ONLY'
  | 'FULL_IMAGE'
  | 'CONTENT_RIGHT'
  | 'TWO_COLUMNS';

export interface Slide {
  id: string; // Unique identifier for each slide
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl?: string; // Optional, as it's set after user selection/generation
  originalImageUrl?: string; // To allow reverting an image edit
  imageSuggestions?: {
    url: string;
    author: string;
    profileUrl: string;
  }[];
  imageUrlError?: string; // To handle errors for suggestions or generation
  layout: SlideLayout;
  speakerNotes?: string;
}

export interface LoadingState {
  isLoading: boolean;
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  sources?: { title: string; uri: string }[];
  functionCall?: any;
}

export interface BrandKit {
  primaryColor: string;
  secondaryColor: string;
  font: 'Arial' | 'Calibri' | 'Georgia' | 'Verdana';
  toneOfVoice: string;
}

// AI Providers
export type AIProvider =
  | 'gemini'      // Google Gemini
  | 'openai'      // OpenAI GPT-4
  | 'claude'      // Anthropic Claude
  | 'deepseek'    // DeepSeek
  | 'mistral';    // Mistral AI

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  models: string[];      // Available models for this provider
  defaultModel: string;  // Default model to use
  supportsImages: boolean;
  maxTokens: number;
}

// Presentation Models
export type PresentationModel =
  | 'standard'           // Default model
  | 'mcclaus-kinski'     // McClaus Kinski method
  | 'custom';            // For future custom models

export interface PresentationModelConfig {
  id: PresentationModel;
  name: string;
  description: string;
  rules: string[];       // Specific rules for this model
  slideTypes?: string[]; // Allowed slide types for this model
}