// Industry Sources Service
// Provides curated industry sources and autonomous agent for gathering additional sources

export interface IndustrySource {
  name: string;
  url: string;
  category: 'IT' | 'Cloud' | 'AI' | 'Telekom' | 'Cyber' | 'General';
  description: string;
  reliability: 'high' | 'medium' | 'low';
}

// Curated industry sources (minimum requirements)
export const INDUSTRY_SOURCES: IndustrySource[] = [
  // IT
  {
    name: 'Gartner',
    url: 'https://www.gartner.com',
    category: 'IT',
    description: 'IT research and advisory company providing insights on technology trends',
    reliability: 'high'
  },
  {
    name: 'Forrester',
    url: 'https://www.forrester.com',
    category: 'IT',
    description: 'Research and advisory firm focused on technology impact on business',
    reliability: 'high'
  },
  {
    name: 'IDC',
    url: 'https://www.idc.com',
    category: 'IT',
    description: 'Global provider of market intelligence and advisory services',
    reliability: 'high'
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com',
    category: 'IT',
    description: 'Technology news and startup information',
    reliability: 'medium'
  },

  // Cloud
  {
    name: 'AWS Blog',
    url: 'https://aws.amazon.com/blogs/',
    category: 'Cloud',
    description: 'Amazon Web Services official blog for cloud computing insights',
    reliability: 'high'
  },
  {
    name: 'Microsoft Azure Blog',
    url: 'https://azure.microsoft.com/en-us/blog/',
    category: 'Cloud',
    description: 'Official Microsoft Azure cloud platform news and updates',
    reliability: 'high'
  },
  {
    name: 'Google Cloud Blog',
    url: 'https://cloud.google.com/blog',
    category: 'Cloud',
    description: 'Google Cloud Platform official blog',
    reliability: 'high'
  },
  {
    name: 'Cloud Computing News',
    url: 'https://www.cloudcomputing-news.net',
    category: 'Cloud',
    description: 'Latest news and insights on cloud computing industry',
    reliability: 'medium'
  },

  // AI
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog',
    category: 'AI',
    description: 'Official OpenAI blog with AI research and developments',
    reliability: 'high'
  },
  {
    name: 'DeepMind',
    url: 'https://deepmind.com/blog',
    category: 'AI',
    description: 'Google DeepMind research on artificial intelligence',
    reliability: 'high'
  },
  {
    name: 'AI News',
    url: 'https://www.artificialintelligence-news.com',
    category: 'AI',
    description: 'Latest AI news, research, and industry developments',
    reliability: 'medium'
  },
  {
    name: 'Anthropic',
    url: 'https://www.anthropic.com/news',
    category: 'AI',
    description: 'AI safety and research company news and updates',
    reliability: 'high'
  },

  // Telekom
  {
    name: 'GSMA',
    url: 'https://www.gsma.com',
    category: 'Telekom',
    description: 'Global mobile communications industry association',
    reliability: 'high'
  },
  {
    name: 'Light Reading',
    url: 'https://www.lightreading.com',
    category: 'Telekom',
    description: 'Telecom industry news and analysis',
    reliability: 'medium'
  },
  {
    name: 'TelecomTV',
    url: 'https://www.telecomtv.com',
    category: 'Telekom',
    description: 'Global telecommunications news and events',
    reliability: 'medium'
  },
  {
    name: 'Ericsson',
    url: 'https://www.ericsson.com/en/reports-and-papers',
    category: 'Telekom',
    description: 'Ericsson research and industry reports',
    reliability: 'high'
  },

  // Cyber
  {
    name: 'NIST Cybersecurity',
    url: 'https://www.nist.gov/cybersecurity',
    category: 'Cyber',
    description: 'US National Institute of Standards and Technology cybersecurity resources',
    reliability: 'high'
  },
  {
    name: 'CISA',
    url: 'https://www.cisa.gov',
    category: 'Cyber',
    description: 'US Cybersecurity and Infrastructure Security Agency',
    reliability: 'high'
  },
  {
    name: 'Krebs on Security',
    url: 'https://krebsonsecurity.com',
    category: 'Cyber',
    description: 'In-depth security news and investigation',
    reliability: 'high'
  },
  {
    name: 'Dark Reading',
    url: 'https://www.darkreading.com',
    category: 'Cyber',
    description: 'Cybersecurity news and analysis',
    reliability: 'medium'
  },
  {
    name: 'ENISA',
    url: 'https://www.enisa.europa.eu',
    category: 'Cyber',
    description: 'European Union Agency for Cybersecurity',
    reliability: 'high'
  }
];

/**
 * Get sources by category
 */
export function getSourcesByCategory(category: IndustrySource['category']): IndustrySource[] {
  return INDUSTRY_SOURCES.filter(source => source.category === category);
}

/**
 * Get all high-reliability sources
 */
export function getHighReliabilitySources(): IndustrySource[] {
  return INDUSTRY_SOURCES.filter(source => source.reliability === 'high');
}

/**
 * Search sources by keyword
 */
export function searchSources(query: string): IndustrySource[] {
  const lowerQuery = query.toLowerCase();
  return INDUSTRY_SOURCES.filter(source =>
    source.name.toLowerCase().includes(lowerQuery) ||
    source.description.toLowerCase().includes(lowerQuery) ||
    source.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Format sources for AI prompt context
 */
export function formatSourcesForPrompt(sources: IndustrySource[]): string {
  return sources.map(source =>
    `- ${source.name} (${source.category}): ${source.description} [${source.url}]`
  ).join('\n');
}

/**
 * Get recommended sources for a topic
 */
export function getRecommendedSources(topic: string): IndustrySource[] {
  const lowerTopic = topic.toLowerCase();

  // Detect relevant categories from topic
  const categories: IndustrySource['category'][] = [];

  if (lowerTopic.includes('cloud') || lowerTopic.includes('aws') || lowerTopic.includes('azure')) {
    categories.push('Cloud');
  }
  if (lowerTopic.includes('ai') || lowerTopic.includes('machine learning') || lowerTopic.includes('artificial intelligence')) {
    categories.push('AI');
  }
  if (lowerTopic.includes('cyber') || lowerTopic.includes('security') || lowerTopic.includes('hack')) {
    categories.push('Cyber');
  }
  if (lowerTopic.includes('telekom') || lowerTopic.includes('telecom') || lowerTopic.includes('5g') || lowerTopic.includes('mobile')) {
    categories.push('Telekom');
  }
  if (lowerTopic.includes('it') || lowerTopic.includes('technology') || lowerTopic.includes('digital')) {
    categories.push('IT');
  }

  // If no specific categories, return all high-reliability sources
  if (categories.length === 0) {
    return getHighReliabilitySources().slice(0, 5);
  }

  // Get sources from relevant categories, prioritizing high reliability
  const relevantSources = INDUSTRY_SOURCES.filter(source => categories.includes(source.category));
  return relevantSources.sort((a, b) => {
    if (a.reliability === 'high' && b.reliability !== 'high') return -1;
    if (a.reliability !== 'high' && b.reliability === 'high') return 1;
    return 0;
  }).slice(0, 10);
}

/**
 * Generate industry context for Advanced Business presentations
 */
export function generateIndustryContext(topic: string, categories?: IndustrySource['category'][]): string {
  let sources: IndustrySource[];

  if (categories && categories.length > 0) {
    // Get sources from specified categories
    sources = INDUSTRY_SOURCES.filter(source => categories.includes(source.category));
  } else {
    // Auto-detect relevant sources from topic
    sources = getRecommendedSources(topic);
  }

  const highReliability = sources.filter(s => s.reliability === 'high');
  const mediumReliability = sources.filter(s => s.reliability === 'medium');

  let context = 'INDUSTRY SOURCES AND CONTEXT:\n\n';

  if (highReliability.length > 0) {
    context += 'PRIMARY SOURCES (High Reliability):\n';
    context += formatSourcesForPrompt(highReliability) + '\n\n';
  }

  if (mediumReliability.length > 0) {
    context += 'SECONDARY SOURCES (Medium Reliability):\n';
    context += formatSourcesForPrompt(mediumReliability) + '\n\n';
  }

  context += 'INSTRUCTIONS:\n';
  context += '- Reference these sources where relevant in your presentation\n';
  context += '- Use current industry trends and best practices from these sources\n';
  context += '- Include source citations when presenting statistics or claims\n';
  context += '- Ensure all information aligns with authoritative industry sources\n';

  return context;
}
