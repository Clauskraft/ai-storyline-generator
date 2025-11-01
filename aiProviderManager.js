// Multi-provider AI Manager
// Supports: Gemini, OpenAI, Claude, DeepSeek, Mistral

import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Mistral } from '@mistralai/mistralai';

export class AIProviderManager {
  constructor() {
    // Initialize all providers
    this.providers = {};

    // Gemini
    if (process.env.GEMINI_API_KEY) {
      this.providers.gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      console.log('✅ Gemini AI initialized');
    } else {
      console.warn('⚠️ GEMINI_API_KEY not found');
    }

    // OpenAI (also works for DeepSeek with different baseURL)
    if (process.env.OPENAI_API_KEY) {
      this.providers.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      console.log('✅ OpenAI initialized');
    } else {
      console.warn('⚠️ OPENAI_API_KEY not found');
    }

    // Claude
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      console.log('✅ Claude initialized');
    } else {
      console.warn('⚠️ ANTHROPIC_API_KEY not found');
    }

    // DeepSeek (OpenAI-compatible)
    if (process.env.DEEPSEEK_API_KEY) {
      this.providers.deepseek = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com'
      });
      console.log('✅ DeepSeek initialized');
    } else {
      console.warn('⚠️ DEEPSEEK_API_KEY not found');
    }

    // Mistral
    if (process.env.MISTRAL_API_KEY) {
      this.providers.mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
      console.log('✅ Mistral AI initialized');
    } else {
      console.warn('⚠️ MISTRAL_API_KEY not found');
    }
  }

  /**
   * Generate text completion using specified provider
   * @param {string} provider - 'gemini', 'openai', 'claude', 'deepseek', or 'mistral'
   * @param {string} prompt - The prompt to send
   * @param {string} model - Optional model override
   * @returns {Promise<string>} - Generated text
   */
  async generateText(provider, prompt, model = null) {
    if (!this.providers[provider]) {
      throw new Error(`Provider ${provider} not initialized. Check API key.`);
    }

    try {
      switch (provider) {
        case 'gemini':
          return await this._generateGemini(prompt, model || 'gemini-2.5-flash');

        case 'openai':
          return await this._generateOpenAI(prompt, model || 'gpt-4o');

        case 'claude':
          return await this._generateClaude(prompt, model || 'claude-3-7-sonnet-20250219');

        case 'deepseek':
          return await this._generateDeepSeek(prompt, model || 'deepseek-chat');

        case 'mistral':
          return await this._generateMistral(prompt, model || 'mistral-large-latest');

        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error with ${provider}:`, error.message);
      throw new Error(`${provider} generation failed: ${error.message}`);
    }
  }

  // Provider-specific implementations
  async _generateGemini(prompt, model) {
    const response = await this.providers.gemini.models.generateContent({
      model: model,
      contents: prompt
    });
    return response.text;
  }

  async _generateOpenAI(prompt, model) {
    const completion = await this.providers.openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 16384
    });
    return completion.choices[0].message.content;
  }

  async _generateClaude(prompt, model) {
    const message = await this.providers.claude.messages.create({
      model: model,
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }]
    });
    return message.content[0].text;
  }

  async _generateDeepSeek(prompt, model) {
    const completion = await this.providers.deepseek.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 32000
    });
    return completion.choices[0].message.content;
  }

  async _generateMistral(prompt, model) {
    const chatResponse = await this.providers.mistral.chat.complete({
      model: model,
      messages: [{ role: 'user', content: prompt }]
    });
    return chatResponse.choices[0].message.content;
  }

  /**
   * Generate image using provider (only Gemini and OpenAI support this)
   * @param {string} provider - 'gemini' or 'openai'
   * @param {string} prompt - Image description
   * @param {string} aspectRatio - Aspect ratio for image
   * @returns {Promise<string>} - Image URL or base64
   */
  async generateImage(provider, prompt, aspectRatio = '16:9') {
    if (!this.providers[provider]) {
      throw new Error(`Provider ${provider} not initialized`);
    }

    try {
      switch (provider) {
        case 'gemini':
          return await this._generateImageGemini(prompt, aspectRatio);

        case 'openai':
          return await this._generateImageOpenAI(prompt);

        default:
          throw new Error(`Provider ${provider} does not support image generation`);
      }
    } catch (error) {
      console.error(`Image generation error with ${provider}:`, error.message);
      throw error;
    }
  }

  async _generateImageGemini(prompt, aspectRatio) {
    const cleanPrompt = this._sanitizeImagePrompt(prompt);
    const response = await this.providers.gemini.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: cleanPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio,
        safetyFilterLevel: 'block_some',
        personGeneration: 'allow_adult'
      }
    });

    if (!response.images || response.images.length === 0) {
      throw new Error('No images generated');
    }

    return `data:image/png;base64,${response.images[0].image.imageBytes}`;
  }

  async _generateImageOpenAI(prompt) {
    const response = await this.providers.openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    });
    return response.data[0].url;
  }

  _sanitizeImagePrompt(prompt) {
    const forbidden = [
      'violence', 'gore', 'nsfw', 'nude', 'naked', 'sex',
      'kill', 'murder', 'torture', 'weapon', 'gun', 'blood'
    ];
    let clean = prompt.toLowerCase();
    for (const word of forbidden) {
      if (clean.includes(word)) {
        throw new Error(`Image prompt contains forbidden content: ${word}`);
      }
    }
    return prompt;
  }

  /**
   * Get list of available providers
   * @returns {string[]} - Array of available provider names
   */
  getAvailableProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Check if a provider is available
   * @param {string} provider - Provider name
   * @returns {boolean}
   */
  isProviderAvailable(provider) {
    return !!this.providers[provider];
  }
}

// Export singleton instance
export const aiManager = new AIProviderManager();
