// Secure Gemini Service - All API calls go through backend proxy
// This file NO LONGER contains API keys or direct AI client initialization

import { Slide, BrandKit, PresentationModel } from "../types";

// Backend API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// A version of the Slide type used for storyline generation (before images are created)
export type StorylineSlide = Omit<Slide, 'imageUrl' | 'originalImageUrl' | 'layout'>;

/**
 * Helper function for making secure API calls to backend
 */
async function apiCall<T>(endpoint: string, data: any): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * Generate text from headlines using AI
 */
export async function generateTextFromHeadlines(headlines: string, brandKit: BrandKit): Promise<string> {
  const result = await apiCall<{ text: string }>('/api/generate-text', {
    headlines,
    brandKit
  });
  return result.text;
}

/**
 * Generate complete storyline from text input
 */
export async function generateStoryline(
  baseText: string,
  contextText: string | null,
  contextSource: string,
  useThinkingMode: boolean,
  audience: string,
  goal: string,
  brandKit: BrandKit,
  presentationModel: PresentationModel = 'standard'
): Promise<StorylineSlide[]> {
  const result = await apiCall<{ storyline: StorylineSlide[] }>('/api/generate-storyline', {
    baseText,
    contextText,
    contextSource,
    useThinkingMode,
    audience,
    goal,
    brandKit,
    presentationModel
  });
  return result.storyline;
}

/**
 * Generate storyline from a template type
 */
export async function generateStorylineFromTemplate(templateType: string): Promise<StorylineSlide[]> {
  const result = await apiCall<{ storyline: StorylineSlide[] }>('/api/generate-template', {
    templateType
  });
  return result.storyline;
}

/**
 * Extract storyline from uploaded file content
 */
export async function extractStorylineFromUpload(textContent: string): Promise<StorylineSlide[]> {
  const result = await apiCall<{ storyline: StorylineSlide[] }>('/api/extract-storyline', {
    textContent
  });
  return result.storyline;
}

/**
 * Regenerate content for a single slide
 */
export async function regenerateStorylineSlideContent(
  slideTitle: string
): Promise<{ content: string, imagePrompt: string }> {
  return await apiCall('/api/regenerate-slide', { slideTitle });
}

/**
 * Generate AI image for slide
 */
export async function generateImageForSlide(imagePrompt: string, aspectRatio: string): Promise<string> {
  let retries = 2;
  while (retries > 0) {
    try {
      const result = await apiCall<{ imageUrl: string }>('/api/generate-image', {
        imagePrompt,
        aspectRatio
      });
      return result.imageUrl;
    } catch (error) {
      retries--;
      if (retries === 0) {
        throw new Error(`Image generation failed after retries: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Image generation failed');
}

/**
 * Edit an existing image using AI
 */
export async function editImage(base64ImageData: string, mimeType: string, prompt: string): Promise<string> {
  const result = await apiCall<{ imageUrl: string }>('/api/edit-image', {
    base64ImageData,
    mimeType,
    prompt
  });
  return result.imageUrl;
}

/**
 * Find stock images from Unsplash
 */
export async function findStockImages(
  imagePrompt: string,
  unsplashApiKey: string | null
): Promise<{ url: string; author: string; profileUrl: string }[]> {
  if (!unsplashApiKey) {
    console.warn("Unsplash API key is not configured.");
    throw new Error("Unsplash API key is missing. Please add it in the settings.");
  }

  // Get keywords from backend AI
  const keywordsResponse = await apiCall<{ keywords: string }>('/api/extract-keywords', {
    imagePrompt
  });
  const keywords = keywordsResponse.keywords;

  // Call Unsplash API directly (this is safe - Unsplash key is user-provided and low-risk)
  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&per_page=5&orientation=landscape`,
    {
      headers: { 'Authorization': `Client-ID ${unsplashApiKey}` }
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Unsplash API Error:", errorData);
    throw new Error(`Unsplash API error: ${errorData.errors ? errorData.errors.join(', ') : response.statusText}`);
  }

  const data = await response.json();

  return data.results
    .filter((img: any) => img.user?.name && img.user?.links?.html)
    .map((img: any) => ({
      url: img.urls.regular,
      author: img.user.name,
      profileUrl: `${img.user.links.html}?utm_source=ai_storyline_generator&utm_medium=referral`,
    }));
}

/**
 * Generate speaker notes for a slide
 */
export async function generateSpeakerNotes(slide: Slide): Promise<string> {
  const result = await apiCall<{ speakerNotes: string }>('/api/generate-speaker-notes', {
    slide: {
      title: slide.title,
      content: slide.content,
      imagePrompt: slide.imagePrompt
    }
  });
  return result.speakerNotes;
}

/**
 * Health check for backend API
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    if (response.ok) {
      const data = await response.json();
      return data.status === 'ok';
    }
    return false;
  } catch {
    return false;
  }
}
