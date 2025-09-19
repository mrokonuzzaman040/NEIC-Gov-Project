import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// File storage configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads/submissions';
const MAX_FILE_SIZE = 512 * 1024 * 1024; // 512MB

// Allowed file types
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
  // Documents
  'application/pdf', 'text/plain', 'text/csv',
  // Microsoft Office
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Archives
  'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed',
  // Audio/Video
  'audio/mpeg', 'audio/wav', 'audio/mp3',
  'video/mp4', 'video/avi', 'video/quicktime'
];

const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.vbs', '.js', '.jar'];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface StoredFileInfo {
  url: string;
  key: string;
  originalName: string;
  size: number;
  mimeType: string;
}

/**
 * Validate file before storage
 */
export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 512MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    };
  }
  
  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type '${file.type}' is not allowed`
    };
  }
  
  // Check for dangerous extensions
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (DANGEROUS_EXTENSIONS.includes(fileExtension)) {
    return {
      valid: false,
      error: 'Executable files are not allowed for security reasons'
    };
  }
  
  return { valid: true };
}

/**
 * Generate a safe filename with UUID
 */
function generateSafeFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const uuid = randomUUID();
  const timestamp = Date.now();
  return `${timestamp}-${uuid}${ext}`;
}

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Store file locally (for development/small deployments)
 */
export async function storeFileLocally(file: File): Promise<StoredFileInfo> {
  // Validate file first
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Ensure upload directory exists
  await ensureUploadDir();
  
  // Generate safe filename
  const safeFilename = generateSafeFilename(file.name);
  const filePath = path.join(UPLOAD_DIR, safeFilename);
  
  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Write file to disk
  await writeFile(filePath, buffer);
  
  // Return file info
  return {
    url: `/uploads/submissions/${safeFilename}`,
    key: safeFilename,
    originalName: file.name,
    size: file.size,
    mimeType: file.type
  };
}

/**
 * Store file in S3
 */
export async function storeFileInS3(file: File): Promise<StoredFileInfo> {
  // Validate file first
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
    
    // Generate safe filename
    const safeFilename = generateSafeFilename(file.name);
    const s3Key = `submissions/${safeFilename}`;
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
      // Set appropriate ACL for security
      ACL: 'private'
    });
    
    await s3Client.send(uploadCommand);
    
    // Generate S3 URL
    const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-southeast-1'}.amazonaws.com/${s3Key}`;
    
    console.log(`File uploaded to S3: ${file.name} -> ${s3Url}`);
    
    return {
      url: s3Url,
      key: s3Key,
      originalName: file.name,
      size: file.size,
      mimeType: file.type
    };
  } catch (error) {
    console.error('S3 upload failed:', error);
    throw new Error(`Failed to upload file to S3: ${error}`);
  }
}

/**
 * Main file storage function
 * Chooses storage method based on configuration
 */
export async function storeFile(file: File): Promise<StoredFileInfo> {
  // Use S3 if AWS credentials and bucket are configured
  if (process.env.AWS_S3_BUCKET_NAME && 
      process.env.AWS_ACCESS_KEY_ID && 
      process.env.AWS_SECRET_ACCESS_KEY) {
    return storeFileInS3(file);
  } else {
    console.warn('S3 not fully configured, using local storage. Configure AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY to use S3.');
    return storeFileLocally(file);
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
