import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload file to local storage
 */
export async function uploadFile(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'gallery'
): Promise<UploadResult> {
  // Generate unique file name with timestamp
  const timestamp = Date.now();
  const extension = fileName.split('.').pop();
  const uniqueFileName = `${folder}/${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;

  try {
    const uploadsDir = path.join(process.cwd(), 'uploads', folder);
    await mkdir(uploadsDir, { recursive: true });
    
    const localFileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;
    const filePath = path.join(uploadsDir, localFileName);
    await writeFile(filePath, new Uint8Array(file));
    
    // Return local URL
    const localUrl = `/uploads/${folder}/${localFileName}`;
    
    return {
      url: localUrl,
      key: uniqueFileName, // Keep consistent key format
    };
  } catch (error) {
    console.error('Error saving file locally:', error);
    throw new Error('Failed to save file locally');
  }
}

/**
 * Delete file from local storage
 */
export async function deleteFile(key: string): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), 'uploads', key);
    await unlink(filePath);
  } catch (error) {
    console.warn('Could not delete local file:', error);
    // Don't throw error for local file deletion failures
  }
}


/**
 * Validate file type for uploads
 */
export function validateImageFile(contentType: string, fileSize: number): { isValid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(contentType)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF files are allowed.',
    };
  }

  if (fileSize > maxSize) {
    return {
      isValid: false,
      error: 'File size too large. Maximum size is 10MB.',
    };
  }

  return { isValid: true };
}

/**
 * Validate PDF file for uploads
 */
export function validatePdfFile(contentType: string, fileSize: number): { isValid: boolean; error?: string } {
  const allowedTypes = ['application/pdf'];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(contentType)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only PDF files are allowed.',
    };
  }

  if (fileSize > maxSize) {
    return {
      isValid: false,
      error: 'File size too large. Maximum size is 10MB.',
    };
  }

  return { isValid: true };
}

/**
 * Validate file based on category
 */
export function validateFile(contentType: string, fileSize: number, category: string): { isValid: boolean; error?: string } {
  switch (category) {
    case 'notices':
      return validatePdfFile(contentType, fileSize);
    case 'gallery':
    case 'slider':
    case 'blog':
      return validateImageFile(contentType, fileSize);
    default:
      return validateImageFile(contentType, fileSize);
  }
}