import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// File storage configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads/submissions';
const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE_MB ?? '25');
const MAX_FILE_SIZE = Math.max(1, MAX_FILE_SIZE_MB) * 1024 * 1024; // fall back to at least 1MB

// Allow-list of extensions mapped to allowed mime-types (all values must be lowercase)
const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.txt': ['text/plain'],
  '.csv': ['text/csv', 'application/vnd.ms-excel'],
  '.jpeg': ['image/jpeg'],
  '.jpg': ['image/jpeg'],
  '.png': ['image/png'],
  '.gif': ['image/gif'],
  '.webp': ['image/webp'],
  '.bmp': ['image/bmp'],
  '.doc': ['application/msword'],
  '.docx': [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed'
  ],
  '.xls': ['application/vnd.ms-excel'],
  '.xlsx': [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed'
  ],
  '.ppt': ['application/vnd.ms-powerpoint'],
  '.pptx': [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed'
  ],
  '.zip': ['application/zip', 'application/x-zip-compressed'],
  '.rar': ['application/x-rar-compressed'],
  '.mp3': ['audio/mpeg', 'audio/mp3'],
  '.wav': ['audio/wav'],
  '.mp4': ['video/mp4'],
  '.avi': ['video/x-msvideo', 'video/avi'],
  '.mov': ['video/quicktime'],
  '.webm': ['video/webm']
};

const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.vbs', '.js', '.jar', '.msi', '.ps1', '.psm1', '.sh'
]);

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

export interface StoredFileInfo {
  url: string;
  key: string;
  originalName: string;
  size: number;
  mimeType: string;
}

interface ValidatedFile {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  size: number;
}

function getExtension(fileName: string): string {
  return path.extname(fileName || '').toLowerCase();
}

function ensureUploadLimit(size: number) {
  if (size === 0) {
    throw new FileValidationError('File is empty');
  }
  if (size > MAX_FILE_SIZE) {
    const limitMb = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    const currentMb = (size / (1024 * 1024)).toFixed(2);
    throw new FileValidationError(`File size exceeds ${limitMb}MB limit. Current size: ${currentMb}MB`);
  }
}

type DetectedFileType = { ext?: string; mime?: string } | undefined | null;
let fileTypeFromBufferFn: ((buffer: Uint8Array) => Promise<DetectedFileType>) | null = null;

async function detectFileType(buffer: Buffer) {
  try {
    if (!fileTypeFromBufferFn) {
      const mod = await import('file-type');
      fileTypeFromBufferFn = mod.fileTypeFromBuffer;
    }
  if (!fileTypeFromBufferFn) return null;
  // Convert Buffer to Uint8Array for compatibility
  const uint8Buffer = new Uint8Array(buffer);
  return await fileTypeFromBufferFn(uint8Buffer);
  } catch (error) {
    return null;
  }
}

export async function validateFile(file: File): Promise<ValidatedFile> {
  if (!file) {
    throw new FileValidationError('No file received');
  }

  ensureUploadLimit(file.size);

  const extension = getExtension(file.name);
  if (!extension) {
    throw new FileValidationError('File must include an extension');
  }
  if (DANGEROUS_EXTENSIONS.has(extension)) {
    throw new FileValidationError('Executable files are not allowed for security reasons');
  }

  const allowedMimes = ALLOWED_FILE_TYPES[extension];
  if (!allowedMimes) {
    throw new FileValidationError(`Files with the '${extension}' extension are not permitted`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const detected = await detectFileType(buffer);
  const detectedMime = detected?.mime?.toLowerCase();
  const reportedMime = file.type?.toLowerCase();

  const detectionMatches = detectedMime ? allowedMimes.includes(detectedMime) : false;
  const reportedMatches = reportedMime ? allowedMimes.includes(reportedMime) : false;
  const fallbackMatches = !detectedMime && !reportedMime && allowedMimes.includes('text/plain');

  if (!detectionMatches && !reportedMatches && !fallbackMatches) {
    const typeName = detectedMime || reportedMime || 'unknown';
    throw new FileValidationError(`File type '${typeName}' is not allowed for extension '${extension}'`);
  }

  const mimeType = (detectedMime && allowedMimes.includes(detectedMime))
    ? detectedMime
    : (reportedMime && allowedMimes.includes(reportedMime))
      ? reportedMime
      : allowedMimes[0];

  return {
    buffer,
    mimeType,
    extension,
    size: buffer.length
  };
}

/**
 * Generate a safe filename with UUID
 */
function generateSafeFilename(originalName: string): string {
  const ext = getExtension(originalName);
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
export async function storeFileLocally(file: File, validated?: ValidatedFile): Promise<StoredFileInfo> {
  const validatedFile = validated ?? await validateFile(file);

  await ensureUploadDir();

  const safeFilename = generateSafeFilename(file.name);
  const filePath = path.join(UPLOAD_DIR, safeFilename);

  // Convert Buffer to Uint8Array for writeFile compatibility
  const uint8Buffer = new Uint8Array(validatedFile.buffer);
  await writeFile(filePath, uint8Buffer);

  return {
    url: `/uploads/submissions/${safeFilename}`,
    key: safeFilename,
    originalName: file.name,
    size: validatedFile.size,
    mimeType: validatedFile.mimeType
  };
}


/**
 * Main file storage function - uses local storage
 */
export async function storeFile(file: File): Promise<StoredFileInfo> {
  const validated = await validateFile(file);
  return storeFileLocally(file, validated);
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
