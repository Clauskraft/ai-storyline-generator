// AI Provider configurations
import { AIProvider, AIProviderConfig } from "../types";

export const aiProviders: Record<AIProvider, AIProviderConfig> = {
  'gemini': {
    id: 'gemini',
    name: 'Google Gemini',
    models: ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    defaultModel: 'gemini-2.5-flash',
    supportsImages: true,
    maxTokens: 8192
  },
  'openai': {
    id: 'openai',
    name: 'OpenAI GPT',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o',
    supportsImages: true,
    maxTokens: 16384
  },
  'claude': {
    id: 'claude',
    name: 'Anthropic Claude',
    models: ['claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    defaultModel: 'claude-3-7-sonnet-20250219',
    supportsImages: true,
    maxTokens: 8192
  },
  'deepseek': {
    id: 'deepseek',
    name: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat',
    supportsImages: false,
    maxTokens: 64000
  },
  'mistral': {
    id: 'mistral',
    name: 'Mistral AI',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
    defaultModel: 'mistral-large-latest',
    supportsImages: false,
    maxTokens: 32000
  }
};

export function getAIProvider(providerId: AIProvider): AIProviderConfig {
  return aiProviders[providerId];
}

export function getAvailableProviders(): AIProviderConfig[] {
  return Object.values(aiProviders);
}
