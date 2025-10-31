/**
 * Input Sanitization Utilities
 * Protects against XSS (Cross-Site Scripting) attacks
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify to remove malicious code while preserving safe HTML
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
    SAFE_FOR_TEMPLATES: true
  });
}

/**
 * Sanitize plain text by removing all HTML tags
 * Use this for user input that should never contain HTML
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove all HTML tags
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
}

/**
 * Sanitize URL to prevent javascript: and data: protocol attacks
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove whitespace
  url = url.trim();

  // Check for dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      console.warn(`Blocked dangerous URL protocol: ${protocol}`);
      return '';
    }
  }

  // Only allow http, https, mailto, and relative URLs
  if (!url.startsWith('http://') &&
      !url.startsWith('https://') &&
      !url.startsWith('mailto:') &&
      !url.startsWith('/') &&
      !url.startsWith('#')) {
    return '';
  }

  return url;
}

/**
 * Validate and sanitize file names
 * Prevents path traversal attacks
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return 'untitled';
  }

  // Remove path separators and other dangerous characters
  let sanitized = fileName.replace(/[/\\?%*:|"<>]/g, '_');

  // Remove leading dots (hidden files)
  sanitized = sanitized.replace(/^\.+/, '');

  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }

  return sanitized || 'untitled';
}

/**
 * Sanitize JSON string input
 * Validates and sanitizes JSON data
 */
export function sanitizeJson<T>(jsonString: string, fallback: T): T {
  if (!jsonString || typeof jsonString !== 'string') {
    return fallback;
  }

  try {
    const parsed = JSON.parse(jsonString);
    // Recursively sanitize string values
    return sanitizeObjectStrings(parsed) as T;
  } catch {
    console.warn('Invalid JSON string, returning fallback');
    return fallback;
  }
}

/**
 * Recursively sanitize all string values in an object
 */
function sanitizeObjectStrings(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObjectStrings(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObjectStrings(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitize and validate user input with size limit
 */
export function sanitizeUserInput(input: string, maxLength: number = 10000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Sanitize HTML
  sanitized = sanitizeText(sanitized);

  return sanitized.trim();
}

/**
 * Escape special characters for safe display
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Content Security Policy helper
 * Generate CSP nonce for inline scripts
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}
