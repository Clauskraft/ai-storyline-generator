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
  // Business Templates (10)
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
  {
    id: 'board-presentation',
    name: 'Board of Directors Update',
    description: 'Professional board meeting presentation',
    category: 'business',
    difficulty: 'advanced',
    estimatedSlides: 12,
    audience: ['board', 'ceo', 'executives'],
    useCase: 'Quarterly board updates and strategic decisions',
    tags: ['board', 'governance', 'strategy'],
  },
  {
    id: 'business-plan',
    name: 'Business Plan',
    description: 'Complete business plan presentation',
    category: 'business',
    difficulty: 'advanced',
    estimatedSlides: 20,
    audience: ['investors', 'partners', 'stakeholders'],
    useCase: 'Comprehensive business planning',
    tags: ['plan', 'strategy', 'financial'],
  },
  {
    id: 'monthly-review',
    name: 'Monthly Business Review',
    description: 'Monthly performance and updates',
    category: 'business',
    difficulty: 'beginner',
    estimatedSlides: 8,
    audience: ['management', 'team'],
    useCase: 'Monthly business updates',
    tags: ['monthly', 'performance', 'update'],
  },
  {
    id: 'competitive-analysis',
    name: 'Competitive Analysis',
    description: 'Market and competitor analysis',
    category: 'business',
    difficulty: 'intermediate',
    estimatedSlides: 12,
    audience: ['executives', 'strategy', 'product'],
    useCase: 'Competitive intelligence presentation',
    tags: ['competitive', 'analysis', 'strategy'],
  },
  {
    id: 'merger-acquisition',
    name: 'M&A Presentation',
    description: 'Merger and acquisition proposal',
    category: 'business',
    difficulty: 'advanced',
    estimatedSlides: 18,
    audience: ['board', 'investors', 'c-suite'],
    useCase: 'M&A proposals and analysis',
    tags: ['m&a', 'corporate', 'strategy'],
  },
  {
    id: 'restructuring-plan',
    name: 'Organizational Restructuring',
    description: 'Company restructuring proposal',
    category: 'business',
    difficulty: 'advanced',
    estimatedSlides: 14,
    audience: ['executives', 'hr', 'board'],
    useCase: 'Organizational changes and restructuring',
    tags: ['restructuring', 'hr', 'leadership'],
  },
  {
    id: 'business-continuity',
    name: 'Business Continuity Plan',
    description: 'Disaster recovery and continuity planning',
    category: 'business',
    difficulty: 'intermediate',
    estimatedSlides: 10,
    audience: ['management', 'operations', 'risk'],
    useCase: 'Business continuity and risk management',
    tags: ['risk', 'continuity', 'operations'],
  },

  // Sales Templates (10)
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
    id: 'demo-presentation',
    name: 'Product Demo',
    description: 'Live product demonstration',
    category: 'sales',
    difficulty: 'beginner',
    estimatedSlides: 12,
    audience: ['prospects', 'customers'],
    useCase: 'Showcase product features and benefits',
    tags: ['demo', 'product', 'features'],
  },
  {
    id: 'sales-kickoff',
    name: 'Sales Kickoff',
    description: 'Annual sales team kickoff meeting',
    category: 'sales',
    difficulty: 'intermediate',
    estimatedSlides: 15,
    audience: ['sales team', 'management'],
    useCase: 'Launch sales initiatives and targets',
    tags: ['sales', 'kickoff', 'team'],
  },
  {
    id: 'case-study',
    name: 'Customer Success Story',
    description: 'Customer success case study',
    category: 'sales',
    difficulty: 'beginner',
    estimatedSlides: 9,
    audience: ['prospects', 'customers'],
    useCase: 'Showcase customer success and ROI',
    tags: ['case study', 'success', 'roi'],
  },
  {
    id: 'sales-forecast',
    name: 'Sales Forecast',
    description: 'Sales pipeline and forecast',
    category: 'sales',
    difficulty: 'intermediate',
    estimatedSlides: 10,
    audience: ['management', 'sales leaders'],
    useCase: 'Sales projections and pipeline review',
    tags: ['forecast', 'pipeline', 'projections'],
  },
  {
    id: 'pricing-strategy',
    name: 'Pricing Strategy',
    description: 'Pricing model presentation',
    category: 'sales',
    difficulty: 'advanced',
    estimatedSlides: 11,
    audience: ['executives', 'product', 'finance'],
    useCase: 'Present new pricing structure',
    tags: ['pricing', 'strategy', 'revenue'],
  },
  {
    id: 'enterprise-sales',
    name: 'Enterprise Sales',
    description: 'Large enterprise sales proposal',
    category: 'sales',
    difficulty: 'advanced',
    estimatedSlides: 16,
    audience: ['enterprise clients', 'c-suite'],
    useCase: 'Enterprise-level sales proposals',
    tags: ['enterprise', 'b2b', 'complex'],
  },
  {
    id: 'renewal-presentation',
    name: 'Contract Renewal',
    description: 'Customer renewal presentation',
    category: 'sales',
    difficulty: 'intermediate',
    estimatedSlides: 8,
    audience: ['existing customers', 'account managers'],
    useCase: 'Renew contracts and upsell services',
    tags: ['renewal', 'retention', 'upsell'],
  },
  {
    id: 'sales-training',
    name: 'Sales Training',
    description: 'Sales methodology training',
    category: 'sales',
    difficulty: 'beginner',
    estimatedSlides: 14,
    audience: ['sales team', 'new hires'],
    useCase: 'Train sales team on processes',
    tags: ['training', 'sales', 'education'],
  },
  {
    id: 'objection-handling',
    name: 'Objection Handling Guide',
    description: 'Sales objection handling framework',
    category: 'sales',
    difficulty: 'beginner',
    estimatedSlides: 10,
    audience: ['sales team', 'reps'],
    useCase: 'Address common sales objections',
    tags: ['objections', 'sales', 'framework'],
  },

  // Executive Templates (10)
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
    id: 'all-hands',
    name: 'All-Hands Meeting',
    description: 'Company-wide all-hands presentation',
    category: 'executive',
    difficulty: 'intermediate',
    estimatedSlides: 12,
    audience: ['all employees'],
    useCase: 'Company updates and announcements',
    tags: ['all-hands', 'company', 'updates'],
  },
  {
    id: 'strategic-planning',
    name: 'Strategic Planning',
    description: 'Annual strategic planning session',
    category: 'executive',
    difficulty: 'advanced',
    estimatedSlides: 20,
    audience: ['executives', 'leadership', 'board'],
    useCase: 'Strategic planning and vision setting',
    tags: ['strategy', 'planning', 'vision'],
  },
  {
    id: 'town-hall',
    name: 'Town Hall Meeting',
    description: 'Q&A town hall format',
    category: 'executive',
    difficulty: 'intermediate',
    estimatedSlides: 8,
    audience: ['employees', 'leadership'],
    useCase: 'Leadership Q&A and transparency',
    tags: ['town hall', 'transparency', 'qa'],
  },
  {
    id: 'change-management',
    name: 'Change Management',
    description: 'Organizational change announcement',
    category: 'executive',
    difficulty: 'advanced',
    estimatedSlides: 13,
    audience: ['employees', 'stakeholders'],
    useCase: 'Communicate major organizational changes',
    tags: ['change', 'organizational', 'transformation'],
  },
  {
    id: 'executive-briefing',
    name: 'Executive Briefing',
    description: 'C-suite briefing on key topics',
    category: 'executive',
    difficulty: 'advanced',
    estimatedSlides: 10,
    audience: ['c-suite', 'executives'],
    useCase: 'High-level executive briefings',
    tags: ['briefing', 'executive', 'summary'],
  },
  {
    id: 'investor-update',
    name: 'Investor Update',
    description: 'Quarterly investor presentation',
    category: 'executive',
    difficulty: 'advanced',
    estimatedSlides: 14,
    audience: ['investors', 'board'],
    useCase: 'Quarterly investor communications',
    tags: ['investor', 'quarterly', 'financial'],
  },
  {
    id: 'leadership-summit',
    name: 'Leadership Summit',
    description: 'Senior leadership meeting',
    category: 'executive',
    difficulty: 'advanced',
    estimatedSlides: 16,
    audience: ['senior leaders', 'directors'],
    useCase: 'Leadership alignment and decisions',
    tags: ['leadership', 'alignment', 'strategy'],
  },
  {
    id: 'vision-announcement',
    name: 'Vision Announcement',
    description: 'New company vision and mission',
    category: 'executive',
    difficulty: 'intermediate',
    estimatedSlides: 11,
    audience: ['all employees', 'stakeholders'],
    useCase: 'Launch new company vision',
    tags: ['vision', 'mission', 'culture'],
  },
  {
    id: 'crisis-communication',
    name: 'Crisis Communication',
    description: 'Crisis response and communication',
    category: 'executive',
    difficulty: 'advanced',
    estimatedSlides: 9,
    audience: ['stakeholders', 'public', 'media'],
    useCase: 'Crisis management and communication',
    tags: ['crisis', 'communication', 'management'],
  },

  // Product Templates (10)
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
    id: 'product-roadmap',
    name: 'Product Roadmap',
    description: 'Product development roadmap',
    category: 'product',
    difficulty: 'intermediate',
    estimatedSlides: 12,
    audience: ['executives', 'product team', 'engineering'],
    useCase: 'Present product roadmap and priorities',
    tags: ['roadmap', 'product', 'features'],
  },
  {
    id: 'feature-pitch',
    name: 'Feature Pitch',
    description: 'New feature proposal',
    category: 'product',
    difficulty: 'beginner',
    estimatedSlides: 8,
    audience: ['product', 'engineering', 'stakeholders'],
    useCase: 'Propose new feature development',
    tags: ['feature', 'product', 'proposal'],
  },
  {
    id: 'user-research',
    name: 'User Research Findings',
    description: 'User research and insights',
    category: 'product',
    difficulty: 'intermediate',
    estimatedSlides: 13,
    audience: ['product', 'design', 'stakeholders'],
    useCase: 'Share user research insights',
    tags: ['research', 'user', 'insights'],
  },
  {
    id: 'a-b-test-results',
    name: 'A/B Test Results',
    description: 'A/B testing results presentation',
    category: 'product',
    difficulty: 'intermediate',
    estimatedSlides: 9,
    audience: ['product', 'analytics', 'stakeholders'],
    useCase: 'Present experiment results and learnings',
    tags: ['testing', 'analytics', 'data'],
  },
  {
    id: 'product-metrics',
    name: 'Product Metrics Dashboard',
    description: 'Key product performance metrics',
    category: 'product',
    difficulty: 'intermediate',
    estimatedSlides: 11,
    audience: ['product', 'executives', 'analytics'],
    useCase: 'Review product KPIs and metrics',
    tags: ['metrics', 'analytics', 'kpis'],
  },
  {
    id: 'competitive-analysis-product',
    name: 'Product Competitive Analysis',
    description: 'Competitive product comparison',
    category: 'product',
    difficulty: 'intermediate',
    estimatedSlides: 10,
    audience: ['product', 'executives', 'strategy'],
    useCase: 'Compare products in the market',
    tags: ['competitive', 'product', 'analysis'],
  },
  {
    id: 'mvp-definition',
    name: 'MVP Definition',
    description: 'Minimum viable product scope',
    category: 'product',
    difficulty: 'beginner',
    estimatedSlides: 7,
    audience: ['product', 'engineering', 'stakeholders'],
    useCase: 'Define MVP scope and requirements',
    tags: ['mvp', 'product', 'scope'],
  },
  {
    id: 'go-to-market',
    name: 'Product Go-to-Market',
    description: 'GTM strategy for new product',
    category: 'product',
    difficulty: 'advanced',
    estimatedSlides: 14,
    audience: ['product', 'marketing', 'executives'],
    useCase: 'Launch product to market',
    tags: ['gtm', 'launch', 'marketing'],
  },
  {
    id: 'product-retrospective',
    name: 'Product Retrospective',
    description: 'Product development review',
    category: 'product',
    difficulty: 'beginner',
    estimatedSlides: 9,
    audience: ['product', 'engineering', 'design'],
    useCase: 'Review product development cycle',
    tags: ['retro', 'review', 'product'],
  },

  // Marketing Templates (10)
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
    id: 'brand-guidelines',
    name: 'Brand Guidelines',
    description: 'Brand identity and guidelines',
    category: 'marketing',
    difficulty: 'beginner',
    estimatedSlides: 10,
    audience: ['marketing', 'design', 'stakeholders'],
    useCase: 'Communicate brand standards',
    tags: ['brand', 'identity', 'guidelines'],
  },
  {
    id: 'social-media',
    name: 'Social Media Strategy',
    description: 'Social media campaign plan',
    category: 'marketing',
    difficulty: 'intermediate',
    estimatedSlides: 12,
    audience: ['marketing', 'social media team'],
    useCase: 'Launch social media campaigns',
    tags: ['social media', 'campaign', 'marketing'],
  },
  {
    id: 'event-marketing',
    name: 'Event Marketing Plan',
    description: 'Conference and event marketing',
    category: 'marketing',
    difficulty: 'intermediate',
    estimatedSlides: 11,
    audience: ['marketing', 'events', 'stakeholders'],
    useCase: 'Plan event marketing campaigns',
    tags: ['events', 'conferences', 'marketing'],
  },
  {
    id: 'content-strategy',
    name: 'Content Marketing Strategy',
    description: 'Content marketing roadmap',
    category: 'marketing',
    difficulty: 'intermediate',
    estimatedSlides: 13,
    audience: ['content', 'marketing', 'seo'],
    useCase: 'Develop content marketing plan',
    tags: ['content', 'seo', 'marketing'],
  },
  {
    id: 'campaign-results',
    name: 'Campaign Results',
    description: 'Marketing campaign performance',
    category: 'marketing',
    difficulty: 'intermediate',
    estimatedSlides: 9,
    audience: ['marketing', 'cmo', 'analytics'],
    useCase: 'Review campaign performance',
    tags: ['campaign', 'analytics', 'roi'],
  },
  {
    id: 'influencer-partnership',
    name: 'Influencer Partnership',
    description: 'Influencer collaboration proposal',
    category: 'marketing',
    difficulty: 'beginner',
    estimatedSlides: 8,
    audience: ['marketing', 'partnerships'],
    useCase: 'Propose influencer partnerships',
    tags: ['influencer', 'partnership', 'marketing'],
  },
  {
    id: 'market-research',
    name: 'Market Research',
    description: 'Market insights and trends',
    category: 'marketing',
    difficulty: 'intermediate',
    estimatedSlides: 12,
    audience: ['marketing', 'strategy', 'research'],
    useCase: 'Present market research findings',
    tags: ['research', 'market', 'trends'],
  },
  {
    id: 'partnership-deck',
    name: 'Partnership Proposal',
    description: 'Business partnership pitch',
    category: 'marketing',
    difficulty: 'intermediate',
    estimatedSlides: 10,
    audience: ['partners', 'business development'],
    useCase: 'Propose business partnerships',
    tags: ['partnership', 'b2b', 'collaboration'],
  },
  {
    id: 'rebrand-launch',
    name: 'Rebrand Launch',
    description: 'Company rebrand announcement',
    category: 'marketing',
    difficulty: 'advanced',
    estimatedSlides: 15,
    audience: ['stakeholders', 'public', 'employees'],
    useCase: 'Announce major rebrand',
    tags: ['rebrand', 'identity', 'launch'],
  },

  // Additional speciality templates
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
