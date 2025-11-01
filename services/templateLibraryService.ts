/**
 * Template Library Service
 * Manages professional presentation templates
 */

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSlides: number;
  audience: string[];
  useCase: string;
  previewImage?: string;
  tags: string[];
}

export type TemplateCategory = 
  | 'business' 
  | 'sales' 
  | 'executive' 
  | 'training' 
  | 'product' 
  | 'marketing' 
  | 'consulting'
  | 'academic'
  | 'general';

const TEMPLATE_LIBRARY: Template[] = [
  {
    id: 'q4-business-review',
    name: 'Q4 Business Review',
    description: 'Comprehensive quarterly business review template',
    category: 'business',
    difficulty: 'intermediate',
    estimatedSlides: 8,
    audience: ['executives', 'investors', 'board'],
    useCase: 'Present quarterly performance and strategic outlook',
    tags: ['financial', 'strategy', 'quarterly'],
  },
  {
    id: 'product-launch',
    name: 'Product Launch Plan',
    description: 'Structured product launch presentation',
    category: 'product',
    difficulty: 'intermediate',
    estimatedSlides: 10,
    audience: ['product teams', 'marketing', 'stakeholders'],
    useCase: 'Launch new product or feature',
    tags: ['product', 'launch', 'marketing'],
  },
  {
    id: 'sales-proposal',
    name: 'Sales Proposal',
    description: 'Professional sales proposal template',
    category: 'sales',
    difficulty: 'beginner',
    estimatedSlides: 7,
    audience: ['prospects', 'clients'],
    useCase: 'Pitch products or services to potential customers',
    tags: ['sales', 'proposal', 'pitch'],
  },
  {
    id: 'annual-report',
    name: 'Annual Report',
    description: 'Comprehensive annual business report',
    category: 'business',
    difficulty: 'advanced',
    estimatedSlides: 15,
    audience: ['investors', 'stakeholders', 'public'],
    useCase: 'Annual company performance overview',
    tags: ['annual', 'financial', 'comprehensive'],
  },
  {
    id: 'training-module',
    name: 'Training Module',
    description: 'Educational training presentation',
    category: 'training',
    difficulty: 'beginner',
    estimatedSlides: 12,
    audience: ['employees', 'students', 'trainees'],
    useCase: 'Employee or student training',
    tags: ['training', 'education', 'learning'],
  },
  {
    id: 'consulting-proposal',
    name: 'Consulting Proposal',
    description: 'Professional consulting engagement proposal',
    category: 'consulting',
    difficulty: 'advanced',
    estimatedSlides: 9,
    audience: ['clients', 'executives'],
    useCase: 'Propose consulting services and approach',
    tags: ['consulting', 'proposal', 'strategy'],
  },
  {
    id: 'marketing-plan',
    name: 'Marketing Strategy',
    description: 'Annual or quarterly marketing plan',
    category: 'marketing',
    difficulty: 'intermediate',
    estimatedSlides: 11,
    audience: ['cmo', 'marketing team', 'executives'],
    useCase: 'Present marketing strategy and initiatives',
    tags: ['marketing', 'strategy', 'campaign'],
  },
  {
    id: 'executive-dashboard',
    name: 'Executive Dashboard',
    description: 'High-level executive reporting template',
    category: 'executive',
    difficulty: 'advanced',
    estimatedSlides: 6,
    audience: ['ceo', 'board', 'c-suite'],
    useCase: 'Executive KPIs and business metrics',
    tags: ['executive', 'dashboard', 'kpis'],
  },
  {
    id: 'research-findings',
    name: 'Research Findings',
    description: 'Academic or market research presentation',
    category: 'academic',
    difficulty: 'intermediate',
    estimatedSlides: 14,
    audience: ['academics', 'researchers', 'analysts'],
    useCase: 'Present research methodology and findings',
    tags: ['research', 'data', 'analysis'],
  },
  {
    id: 'startup-pitch',
    name: 'Startup Pitch Deck',
    description: 'Investor pitch deck template',
    category: 'business',
    difficulty: 'intermediate',
    estimatedSlides: 10,
    audience: ['investors', 'vc', 'accelerators'],
    useCase: 'Raise funding or pitch to investors',
    tags: ['startup', 'pitch', 'funding'],
  },
];

class TemplateLibraryService {
  /**
   * Get all templates
   */
  public getAllTemplates(): Template[] {
    return TEMPLATE_LIBRARY;
  }

  /**
   * Get templates by category
   */
  public getTemplatesByCategory(category: TemplateCategory): Template[] {
    return TEMPLATE_LIBRARY.filter(t => t.category === category);
  }

  /**
   * Get template by ID
   */
  public getTemplate(id: string): Template | undefined {
    return TEMPLATE_LIBRARY.find(t => t.id === id);
  }

  /**
   * Search templates
   */
  public searchTemplates(query: string): Template[] {
    const lowerQuery = query.toLowerCase();
    return TEMPLATE_LIBRARY.filter(t => 
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      t.category.includes(lowerQuery)
    );
  }

  /**
   * Get templates by difficulty
   */
  public getTemplatesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Template[] {
    return TEMPLATE_LIBRARY.filter(t => t.difficulty === difficulty);
  }

  /**
   * Get recommended templates
   */
  public getRecommendedTemplates(maxResults: number = 5): Template[] {
    return TEMPLATE_LIBRARY.slice(0, maxResults);
  }

  /**
   * Get category statistics
   */
  public getCategoryStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    TEMPLATE_LIBRARY.forEach(t => {
      stats[t.category] = (stats[t.category] || 0) + 1;
    });
    return stats;
  }
}

// Export singleton instance
export const templateLibraryService = new TemplateLibraryService();

