// Backend proxy server for secure API key management
// This keeps the Gemini API key server-side only

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// For ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load presentation models (since we can't directly import .ts in .js)
function getModelPromptInstructions(modelId) {
  const PRESENTATION_MODEL_PROMPTS = {
    'standard': `Create a presentation following standard practices:
- Use clear, concise slide titles
- Balance text and visuals
- Include speaker notes where helpful
- Maintain consistent flow and logic`,

    'mcclaus-kinski': `Create a presentation following the McKinsey presentation methodology:

CORE PRINCIPLES:
1. PYRAMID PRINCIPLE: Start with your conclusion/recommendation first, then provide supporting arguments, then detailed evidence
2. MECE FRAMEWORK: Structure arguments to be Mutually Exclusive (no overlaps) and Collectively Exhaustive (covers everything)
3. SCR STORYTELLING: Frame the narrative as Situation → Complication → Resolution

SLIDE STRUCTURE REQUIREMENTS:
1. ACTION TITLES: Every slide title MUST be a complete declarative sentence that states the key insight
   - GOOD: "Revenue Growth Outpaced Market Trends by 15% in Q4"
   - BAD: "Revenue Analysis" or "Q4 Results"

2. HORIZONTAL FLOW: When reading all slide titles in sequence (without seeing slide content), they should tell the complete story
   - Titles alone should form a logical narrative arc
   - Each title should build on the previous one

3. VERTICAL LOGIC: Every element on a slide must directly support and prove the slide title
   - Charts, bullets, images must all serve the title's claim
   - Remove any element that doesn't prove the title

4. ONE SLIDE ONE INSIGHT: Never combine multiple messages on a single slide
   - Each slide proves exactly one point
   - If you have two insights, create two slides

PRESENTATION ANATOMY:
1. Title Slide: Clear, compelling title
2. Executive Summary: One comprehensive slide containing all key insights and recommendations
3. Body Slides: Each proving one point in the argument (following action title rules)
4. Conclusion & Next Steps: Clear call to action
5. Appendix: Supporting details (optional)

DESIGN PRINCIPLES:
- Minimalism: Remove all non-essential elements
- Consistency: Use consistent fonts, colors, layouts
- White Space: Ample breathing room around elements
- Strategic Color: Use color to highlight key insights, not decoration
- No Chart Junk: Clean, simple data visualizations

CONTENT STRATEGY:
- Create a "ghost deck" first: Write all slide titles before creating any content
- Ensure each title is hypothesis-driven
- Use the SCR framework to structure the overall narrative
- Design for the executive summary to stand alone as the complete story`,

    'custom': `Create a presentation with flexible structure based on user requirements.`
  };

  return PRESENTATION_MODEL_PROMPTS[modelId] || PRESENTATION_MODEL_PROMPTS['standard'];
}

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // For image data

// Security: Input validation middleware
function validateStringInput(input, maxLength = 100000) {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove null bytes and limit length
  return input.replace(/\0/g, '').substring(0, maxLength).trim();
}

// Rate limiting helper (simple in-memory implementation)
const requestCounts = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 60; // 60 requests per minute

  const requests = requestCounts.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Please slow down your requests'
    });
  }

  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, times] of requestCounts.entries()) {
      const recent = times.filter(time => now - time < windowMs);
      if (recent.length === 0) {
        requestCounts.delete(key);
      } else {
        requestCounts.set(key, recent);
      }
    }
  }

  next();
}

// Apply rate limiting to all API routes
app.use('/api/', rateLimit);

// Initialize Gemini AI (server-side only)
let ai;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }
  ai = new GoogleGenAI({ apiKey });
  console.log('✅ Gemini AI initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI:', error.message);
  process.exit(1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API proxy server running' });
});

// Generate storyline from text
app.post('/api/generate-storyline', async (req, res) => {
  try {
    const { baseText, contextText, contextSource, useThinkingMode, audience, goal, brandKit, presentationModel = 'standard' } = req.body;

    // SECURITY: Validate and sanitize all inputs
    if (!baseText || typeof baseText !== 'string') {
      return res.status(400).json({ error: 'Invalid baseText parameter' });
    }

    const sanitizedBaseText = validateStringInput(baseText, 50000);
    const sanitizedContextText = contextText ? validateStringInput(contextText, 100000) : null;
    const sanitizedContextSource = validateStringInput(contextSource, 500);
    const sanitizedAudience = validateStringInput(audience, 500);
    const sanitizedGoal = validateStringInput(goal, 500);

    const modelName = useThinkingMode ? "gemini-2.5-pro" : "gemini-2.5-flash";

    const storylineSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'A unique identifier for the slide.' },
          title: { type: Type.STRING, description: 'A short, engaging title for the slide.' },
          content: { type: Type.STRING, description: 'The main bullet points or paragraph for the slide.' },
          imagePrompt: { type: Type.STRING, description: 'A detailed prompt for an AI image generator.' }
        },
        required: ['id', 'title', 'content', 'imagePrompt']
      }
    };

    const modelInstructions = getModelPromptInstructions(presentationModel);

    const prompt = `
You are an expert presentation and storyline creator. Your task is to transform a text into a clear and compelling slide-based storyline, tailored for a specific audience and goal.

**Audience for this presentation:** ${sanitizedAudience || 'A general professional audience.'}
**Primary goal of this presentation:** ${sanitizedGoal || 'To inform and engage.'}
**Tone of Voice to use:** ${brandKit?.toneOfVoice || 'Professional and engaging'}

**Base Text to Analyze:**
---
${sanitizedBaseText}
---

**Additional Context (Source: ${sanitizedContextSource || 'None'}):**
---
${sanitizedContextText || 'No additional context provided.'}
---

**PRESENTATION MODEL METHODOLOGY:**
${modelInstructions}

Based on the goal, audience, tone, base text, context, and the specified presentation methodology above, please perform the following actions:
1. Identify the core messages that will resonate with the specified audience and achieve the presentation's goal.
2. Structure these messages into a logical narrative flow following the presentation model methodology.
3. Create a series of slides that tell this story according to the model's rules.
4. For each slide, provide:
   a. A title that follows the presentation model's title requirements (e.g., for McKinsey: action titles that are complete declarative sentences stating insights).
   b. The main content (as bullet points or a short paragraph) that supports the title.
   c. A detailed prompt for an AI image generator. The prompt should specify an image style that aligns with a professional brand using primary colors like ${brandKit?.primaryColor || '#14b8a6'} and ${brandKit?.secondaryColor || '#6366f1'}.
   d. A unique ID for each slide object.

Output the result as a JSON array of slide objects, adhering to the provided schema. The presentation should have between 4 and 8 slides.
`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: storylineSchema,
        ...(useThinkingMode && { thinkingConfig: { thinkingBudget: 32768 } })
      },
    });

    const storyline = JSON.parse(response.text);

    // Ensure unique IDs
    const storylineWithIds = storyline.map(slide => ({
      ...slide,
      id: slide.id || crypto.randomUUID()
    }));

    res.json({ storyline: storylineWithIds });
  } catch (error) {
    console.error('Error generating storyline:', error);
    res.status(500).json({
      error: 'Failed to generate storyline',
      message: error.message
    });
  }
});

// Generate text from headlines
app.post('/api/generate-text', async (req, res) => {
  try {
    const { headlines, brandKit } = req.body;

    if (!headlines || typeof headlines !== 'string') {
      return res.status(400).json({ error: 'Invalid headlines parameter' });
    }

    const prompt = `
You are a content writer with a specific tone of voice: "${brandKit?.toneOfVoice || 'Professional and engaging'}".
Based on the following headlines, write a cohesive text of a few paragraphs that connects these ideas.

Headlines:
---
${headlines}
---

Generated Text:
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({
      error: 'Failed to generate text',
      message: error.message
    });
  }
});

// Generate storyline from template
app.post('/api/generate-template', async (req, res) => {
  try {
    const { templateType } = req.body;

    if (!templateType || typeof templateType !== 'string') {
      return res.status(400).json({ error: 'Invalid templateType parameter' });
    }

    const storylineSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          imagePrompt: { type: Type.STRING }
        },
        required: ['id', 'title', 'content', 'imagePrompt']
      }
    };

    const prompt = `Create a ${templateType} presentation storyline with 5-7 slides. Return as JSON array.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: storylineSchema
      }
    });

    const storyline = JSON.parse(response.text).map(slide => ({
      ...slide,
      id: slide.id || crypto.randomUUID()
    }));

    res.json({ storyline });
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({
      error: 'Failed to generate template',
      message: error.message
    });
  }
});

// Extract storyline from uploaded content
app.post('/api/extract-storyline', async (req, res) => {
  try {
    const { textContent } = req.body;

    if (!textContent || typeof textContent !== 'string') {
      return res.status(400).json({ error: 'Invalid textContent parameter' });
    }

    const storylineSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          imagePrompt: { type: Type.STRING }
        },
        required: ['id', 'title', 'content', 'imagePrompt']
      }
    };

    const prompt = `Extract key points from this content and create a presentation storyline:\n\n${textContent}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: storylineSchema
      }
    });

    const storyline = JSON.parse(response.text).map(slide => ({
      ...slide,
      id: slide.id || crypto.randomUUID()
    }));

    res.json({ storyline });
  } catch (error) {
    console.error('Error extracting storyline:', error);
    res.status(500).json({
      error: 'Failed to extract storyline',
      message: error.message
    });
  }
});

// Regenerate slide content
app.post('/api/regenerate-slide', async (req, res) => {
  try {
    const { slideTitle } = req.body;

    if (!slideTitle || typeof slideTitle !== 'string') {
      return res.status(400).json({ error: 'Invalid slideTitle parameter' });
    }

    const contentSchema = {
      type: Type.OBJECT,
      properties: {
        content: { type: Type.STRING },
        imagePrompt: { type: Type.STRING }
      },
      required: ['content', 'imagePrompt']
    };

    const prompt = `Based on the slide title "${slideTitle}", generate concise content and an image prompt.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: contentSchema
      }
    });

    const result = JSON.parse(response.text);
    res.json(result);
  } catch (error) {
    console.error('Error regenerating slide:', error);
    res.status(500).json({
      error: 'Failed to regenerate slide',
      message: error.message
    });
  }
});

// Generate image for slide
app.post('/api/generate-image', async (req, res) => {
  try {
    const { imagePrompt, aspectRatio } = req.body;

    if (!imagePrompt || typeof imagePrompt !== 'string') {
      return res.status(400).json({ error: 'Invalid imagePrompt parameter' });
    }

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `${imagePrompt}. Style: professional, clean, modern, suitable for a business presentation.`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio || '16:9',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      const dataUrl = `data:image/png;base64,${base64ImageBytes}`;
      res.json({ imageUrl: dataUrl });
    } else {
      throw new Error('No image generated');
    }
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({
      error: 'Failed to generate image',
      message: error.message
    });
  }
});

// Edit image
app.post('/api/edit-image', async (req, res) => {
  try {
    const { base64ImageData, mimeType, prompt } = req.body;

    if (!base64ImageData || !mimeType || !prompt) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const imagePart = { inlineData: { data: base64ImageData, mimeType } };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [imagePart, textPart] },
      config: { responseModalities: [Modality.IMAGE] },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData?.data) {
      const dataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      res.json({ imageUrl: dataUrl });
    } else {
      throw new Error('Image editing failed');
    }
  } catch (error) {
    console.error('Error editing image:', error);
    res.status(500).json({
      error: 'Failed to edit image',
      message: error.message
    });
  }
});

// Extract keywords from image prompt
app.post('/api/extract-keywords', async (req, res) => {
  try {
    const { imagePrompt } = req.body;

    if (!imagePrompt || typeof imagePrompt !== 'string') {
      return res.status(400).json({ error: 'Invalid imagePrompt parameter' });
    }

    const keywordsSchema = {
      type: Type.OBJECT,
      properties: {
        keywords: { type: Type.STRING, description: 'A comma-separated string of 2-3 concise keywords.' }
      },
      required: ['keywords']
    };

    const prompt = `
You are an expert at distilling visual concepts into effective search terms. Based on the following detailed image prompt, extract 2-3 concise keywords suitable for a stock photo API search (like Unsplash).

Image Prompt: "${imagePrompt}"

Output ONLY a JSON object with a single key "keywords".
Example: { "keywords": "business, strategy, meeting" }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: keywordsSchema,
      }
    });

    const { keywords } = JSON.parse(response.text);
    res.json({ keywords });
  } catch (error) {
    console.error('Error extracting keywords:', error);
    // Fallback: return first 3 words
    const fallbackKeywords = req.body.imagePrompt?.split(' ').slice(0, 3).join(' ') || 'business';
    res.json({ keywords: fallbackKeywords });
  }
});

// Generate speaker notes
app.post('/api/generate-speaker-notes', async (req, res) => {
  try {
    const { slide } = req.body;

    if (!slide || !slide.title || !slide.content) {
      return res.status(400).json({ error: 'Invalid slide data' });
    }

    const prompt = `Generate detailed speaker notes for this slide:
Title: ${slide.title}
Content: ${slide.content}

Provide comprehensive notes that a presenter could use, including:
- Key talking points
- Examples or anecdotes
- Transition to next slide`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ speakerNotes: response.text });
  } catch (error) {
    console.error('Error generating speaker notes:', error);
    res.status(500).json({
      error: 'Failed to generate speaker notes',
      message: error.message
    });
  }
});

// Chat with bot endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, chatHistory, storylineContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build context from storyline
    let context = '';
    if (storylineContext && storylineContext.length > 0) {
      context = 'Current storyline:\n';
      storylineContext.forEach((slide, idx) => {
        context += `Slide ${idx + 1}: ${slide.title}\n${slide.content}\n\n`;
      });
    }

    // Build chat history
    let history = '';
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach(msg => {
        history += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }

    const prompt = `You are a helpful AI assistant helping with presentation creation.

${context}

Previous conversation:
${history}

User: ${message}

Provide a helpful, concise response. If the user asks about the storyline, reference the slides above.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({
      error: 'Failed to process chat',
      message: error.message
    });
  }
});

// Serve static files in production (Docker/deployed environment)
if (process.env.NODE_ENV === 'production') {
  // Serve the built frontend
  app.use(express.static(join(__dirname, 'dist')));

  // Serve index.html for all non-API routes (SPA fallback)
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Proxy Server running on http://localhost:${PORT}`);
  console.log(`🔒 Gemini API key is secure (server-side only)`);
  console.log(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
