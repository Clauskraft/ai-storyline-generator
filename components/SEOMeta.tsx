import React from 'react';

interface SEOMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SEOMeta: React.FC<SEOMetaProps> = ({ 
  title = 'AI Storyline Generator - Create Professional Presentations Instantly',
  description = 'Transform text into world-class presentations with AI-powered intelligence. McKinsey methodologies, multi-provider AI, and professional templates.',
  image = '/og-image.png',
  url = 'https://ai-storyline.com'
}) => {
  return (
    <>
      {/* Primary Meta Tags */}
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content="ai presentations, presentation generator, mckinsey presentation, pitch deck, slide creation" />
      <meta name="author" content="AI Storyline Generator" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Additional SEO */}
      <link rel="canonical" href={url} />
    </>
  );
};

export default SEOMeta;

