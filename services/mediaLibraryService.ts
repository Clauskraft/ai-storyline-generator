// Media Library Service - Persistent storage for uploaded content
// Allows users to save and reuse illustrations, figures, structures, and templates

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'text' | 'structure' | 'template';
  mimeType: string;
  data: string; // Base64 for images, JSON string for structures/templates, plain text for text
  thumbnail?: string; // Base64 thumbnail for images
  tags: string[];
  uploadedAt: number;
  usageCount: number;
}

const STORAGE_KEY = 'ai_storyline_media_library';
const MAX_STORAGE_MB = 50; // Limit to avoid localStorage quota issues

/**
 * Get all media items from library
 */
export function getMediaLibrary(): MediaItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load media library:', error);
    return [];
  }
}

/**
 * Add item to media library
 */
export async function addToMediaLibrary(
  name: string,
  type: MediaItem['type'],
  mimeType: string,
  data: string | File,
  tags: string[] = []
): Promise<MediaItem> {
  const library = getMediaLibrary();

  // Convert File to base64 if needed
  let dataString: string;
  if (data instanceof File) {
    dataString = await fileToBase64(data);
  } else {
    dataString = data;
  }

  // Check storage size
  const estimatedSizeMB = (dataString.length * 0.75) / (1024 * 1024); // Rough estimate
  const currentSizeMB = getCurrentLibrarySizeMB();

  if (currentSizeMB + estimatedSizeMB > MAX_STORAGE_MB) {
    throw new Error(`Media library is full (${MAX_STORAGE_MB}MB limit). Please remove some items.`);
  }

  // Create thumbnail for images
  let thumbnail: string | undefined;
  if (type === 'image') {
    thumbnail = await createThumbnail(dataString, mimeType);
  }

  const newItem: MediaItem = {
    id: generateId(),
    name,
    type,
    mimeType,
    data: dataString,
    thumbnail,
    tags,
    uploadedAt: Date.now(),
    usageCount: 0,
  };

  library.push(newItem);
  saveMediaLibrary(library);

  return newItem;
}

/**
 * Remove item from library
 */
export function removeFromMediaLibrary(id: string): void {
  const library = getMediaLibrary();
  const filtered = library.filter(item => item.id !== id);
  saveMediaLibrary(filtered);
}

/**
 * Update usage count for item
 */
export function incrementUsage(id: string): void {
  const library = getMediaLibrary();
  const item = library.find(i => i.id === id);
  if (item) {
    item.usageCount++;
    saveMediaLibrary(library);
  }
}

/**
 * Search library by tags or name
 */
export function searchMediaLibrary(query: string): MediaItem[] {
  const library = getMediaLibrary();
  const lowerQuery = query.toLowerCase();

  return library.filter(item =>
    item.name.toLowerCase().includes(lowerQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get library size in MB
 */
export function getCurrentLibrarySizeMB(): number {
  const library = getMediaLibrary();
  const jsonString = JSON.stringify(library);
  return (jsonString.length * 0.75) / (1024 * 1024);
}

/**
 * Clear entire library (with confirmation)
 */
export function clearMediaLibrary(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ===== Helper Functions =====

function saveMediaLibrary(library: MediaItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
}

function generateId(): string {
  return `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function createThumbnail(base64: string, mimeType: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 150;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(base64); // Fallback to original
    img.src = base64;
  });
}

/**
 * Export library for backup
 */
export function exportMediaLibrary(): string {
  const library = getMediaLibrary();
  return JSON.stringify(library, null, 2);
}

/**
 * Import library from backup
 */
export function importMediaLibrary(jsonString: string): void {
  try {
    const library = JSON.parse(jsonString);
    if (Array.isArray(library)) {
      saveMediaLibrary(library);
    } else {
      throw new Error('Invalid library format');
    }
  } catch (error) {
    throw new Error(`Failed to import library: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
