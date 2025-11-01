import { PresentationModel, PresentationModelConfig } from '../types';

/**
 * Presentation Models Service
 * Handles different presentation methodologies and their rules
 */

// ===========================
// MODEL CONFIGURATIONS
// ===========================

export const PRESENTATION_MODELS: Record<PresentationModel, PresentationModelConfig> = {
  'standard': {
    id: 'standard',
    name: 'Standard Presentation',
    description: 'Traditional presentation format with flexible structure',
    rules: [
      'No strict slide count requirements',
      'Flexible content structure',
      'Standard title and content slides',
      'Optional speaker notes'
    ],
    slideTypes: ['TITLE_CONTENT', 'TITLE_ONLY', 'FULL_IMAGE', 'CONTENT_RIGHT', 'TWO_COLUMNS']
  },

  'mcclaus-kinski': {
    id: 'mcclaus-kinski',
    name: 'McKinsey Presentation Method',
    description: 'Structured presentation methodology based on McKinsey communication principles',
    rules: [
      'PYRAMID PRINCIPLE: Start with conclusion first, then supporting arguments, then evidence',
      'MECE FRAMEWORK: Arguments must be Mutually Exclusive and Collectively Exhaustive',
      'SCR STORYTELLING: Structure as Situation → Complication → Resolution',
      'ACTION TITLES: Every slide title must be a declarative sentence stating the insight (not descriptive labels)',
      'HORIZONTAL FLOW: Reading all slide titles in sequence must tell the complete story',
      'VERTICAL LOGIC: Every element on the slide must prove the title claim',
      'ONE SLIDE ONE INSIGHT: Never combine multiple messages on a single slide',
      'GHOST DECK: Map entire argument using only slide titles before creating content',
      'EXECUTIVE SUMMARY: Include comprehensive one-page summary with all key insights',
      'HYPOTHESIS-DRIVEN: Build presentation to prove a specific hypothesis',
      'DESIGN PRINCIPLES: Minimalism, consistency, strategic color use, ample white space',
      'PRE-WIRING: Socialize findings before formal presentation'
    ],
    slideTypes: ['TITLE_CONTENT', 'TITLE_ONLY', 'CONTENT_RIGHT', 'TWO_COLUMNS']
  },

  'advanced-business': {
    id: 'advanced-business',
    name: 'Advanced Business with Industry Sources',
    description: 'Executive-level presentations with curated industry sources from IT, Cloud, AI, Telecom, and Cybersecurity',
    rules: [
      'INDUSTRY CONTEXT: Reference authoritative sources (Gartner, Forrester, IDC, NIST, CISA, etc.)',
      'DATA-DRIVEN: Support claims with industry statistics and trends',
      'SOURCE CITATIONS: Include source references where relevant',
      'EXECUTIVE SUMMARY: Clear overview with key insights and recommendations',
      'TREND ANALYSIS: Current industry trends and best practices',
      'STRATEGIC RECOMMENDATIONS: Actionable insights based on industry data',
      'AUTHORITATIVE TONE: Professional, evidence-based communication',
      'MULTI-DOMAIN COVERAGE: Address relevant aspects across IT, Cloud, AI, Telecom, Cyber',
      'FORWARD-LOOKING: Include future outlook and predictions',
      'STAKEHOLDER ALIGNMENT: Address concerns of technical and business stakeholders'
    ],
    slideTypes: ['TITLE_CONTENT', 'TITLE_ONLY', 'CONTENT_RIGHT', 'TWO_COLUMNS']
  },

  'custom': {
    id: 'custom',
    name: 'Custom Model',
    description: 'User-defined presentation structure',
    rules: [
      'User-defined rules',
      'Flexible customization'
    ],
    slideTypes: ['TITLE_CONTENT', 'TITLE_ONLY', 'FULL_IMAGE', 'CONTENT_RIGHT', 'TWO_COLUMNS']
  }
};

// ===========================
// MODEL HELPER FUNCTIONS
// ===========================

/**
 * Get all available presentation models
 */
export function getAvailableModels(): PresentationModelConfig[] {
  return Object.values(PRESENTATION_MODELS);
}

/**
 * Get a specific presentation model configuration
 */
export function getModelConfig(modelId: PresentationModel): PresentationModelConfig {
  return PRESENTATION_MODELS[modelId];
}

/**
 * Get model-specific prompt instructions for AI generation
 */
export function getModelPromptInstructions(modelId: PresentationModel): string {
  const config = PRESENTATION_MODELS[modelId];

  switch (modelId) {
    case 'standard':
      return `Create a presentation following standard practices:
- Use clear, concise slide titles
- Balance text and visuals
- Include speaker notes where helpful
- Maintain consistent flow and logic`;

    case 'mcclaus-kinski':
      return `Create a presentation following the McKinsey presentation methodology:

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
- Design for the executive summary to stand alone as the complete story`;

    case 'advanced-business':
      return `Create an executive-level business presentation with industry sources and strategic insights:

CORE PRINCIPLES:
1. INDUSTRY AUTHORITY: Reference and cite authoritative industry sources (Gartner, Forrester, IDC, AWS, NIST, CISA, etc.)
2. DATA-DRIVEN INSIGHTS: Support all claims with industry statistics, trends, and research
3. EXECUTIVE SUMMARY: Begin with a clear, comprehensive overview of key insights and recommendations
4. MULTI-DOMAIN PERSPECTIVE: Address relevant aspects across IT, Cloud, AI, Telecommunications, and Cybersecurity

CONTENT REQUIREMENTS:
1. SOURCE CITATIONS: Where relevant, include references to industry sources
   - Example: "According to Gartner, cloud adoption increased 35% in 2024"
   - Example: "NIST Cybersecurity Framework recommends..."

2. TREND ANALYSIS: Include current industry trends and best practices
   - Market trends and growth projections
   - Emerging technologies and innovations
   - Industry standards and compliance requirements

3. STRATEGIC RECOMMENDATIONS: Provide actionable, evidence-based insights
   - Grounded in industry research and data
   - Address both technical and business stakeholders
   - Include forward-looking perspectives

4. AUTHORITATIVE TONE: Professional, evidence-based communication
   - Clear, confident language
   - Avoid speculation without evidence
   - Acknowledge uncertainties where appropriate

SLIDE STRUCTURE:
1. Title Slide: Clear, professional title
2. Executive Summary: Comprehensive overview with key insights
3. Body Slides: Each addressing one strategic point with industry context
4. Recommendations: Actionable next steps with supporting evidence
5. Conclusion: Summary and forward-looking perspective

DESIGN PRINCIPLES:
- Professional, clean layout
- Strategic use of data visualizations
- Consistent formatting and color scheme
- Emphasis on key insights and recommendations`;

    case 'custom':
      return `Create a presentation with flexible structure based on user requirements.`;

    default:
      return '';
  }
}

/**
 * Validate if a storyline follows the rules of a specific model
 */
export function validateStorylineAgainstModel(
  storyline: any[],
  modelId: PresentationModel
): { isValid: boolean; errors: string[] } {
  const config = PRESENTATION_MODELS[modelId];
  const errors: string[] = [];

  // Model-specific validation
  switch (modelId) {
    case 'mcclaus-kinski':
      // TODO: Add McClaus Kinski specific validation when documentation is provided
      break;

    case 'standard':
    case 'custom':
      // No strict validation for these models
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ===========================
// MCCLAUS KINSKI SPECIFICS
// ===========================

/**
 * McClaus Kinski Method Implementation
 * TODO: Complete this section when documentation is provided
 */
export const McClausKinskiMethod = {
  /**
   * Get the expected slide structure for McClaus Kinski method
   */
  getSlideStructure(): string[] {
    // TODO: Return array of required slide types in order
    return [
      // 'Opening Slide',
      // 'Problem Statement',
      // etc.
    ];
  },

  /**
   * Get content requirements for a specific slide type
   */
  getSlideRequirements(slideType: string): string[] {
    // TODO: Return requirements for this slide type
    return [];
  },

  /**
   * Generate a storyline following McClaus Kinski method
   */
  generateStoryline(input: {
    topic: string;
    audience: string;
    goal: string;
  }): any[] {
    // TODO: Implement McClaus Kinski storyline generation
    return [];
  }
};
