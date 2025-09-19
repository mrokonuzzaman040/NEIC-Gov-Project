import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

// Check if S3 is properly configured
const isS3Configured = !!(
  process.env.AWS_REGION &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET_NAME
);

// S3 configuration (only if properly configured)
let s3Client: S3Client | null = null;
let BUCKET_NAME = '';

if (isS3Configured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
}

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload file to S3 bucket or local storage (development fallback)
 */
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'gallery'
): Promise<UploadResult> {
  // Generate unique file name with timestamp
  const timestamp = Date.now();
  const extension = fileName.split('.').pop();
  const uniqueFileName = `${folder}/${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;

  // Use S3 if configured, otherwise use local storage in development
  if (isS3Configured && s3Client) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read', // Make files publicly accessible
    });

    try {
      await s3Client.send(command);
      
      const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
      
      return {
        url,
        key: uniqueFileName,
      };
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw new Error('Failed to upload file to S3');
    }
  } else {
    // Development fallback: save to local uploads directory
    console.log('S3 not configured, using local file storage for development');
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
        key: uniqueFileName, // Keep S3-style key for consistency
      };
    } catch (error) {
      console.error('Error saving file locally:', error);
      throw new Error('Failed to save file locally');
    }
  }
}

/**
 * Delete file from S3 bucket or local storage
 */
export async function deleteFromS3(key: string): Promise<void> {
  if (isS3Configured && s3Client) {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    try {
      await s3Client.send(command);
    } catch (error) {
      console.error('Error deleting from S3:', error);
      throw new Error('Failed to delete file from S3');
    }
  } else {
    // Development fallback: delete from local uploads directory
    try {
      const filePath = path.join(process.cwd(), 'uploads', key);
      await unlink(filePath);
    } catch (error) {
      console.warn('Could not delete local file:', error);
      // Don't throw error for local file deletion failures
    }
  }
}

/**
 * Generate presigned URL for secure file upload (alternative method)
 */
export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  folder: string = 'gallery'
): Promise<{ uploadUrl: string; key: string }> {
  if (!isS3Configured || !s3Client) {
    throw new Error('S3 not configured. Presigned URLs not available in development mode.');
  }

  const timestamp = Date.now();
  const extension = fileName.split('.').pop();
  const uniqueFileName = `${folder}/${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: uniqueFileName,
    ContentType: contentType,
    ACL: 'public-read',
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    
    return {
      uploadUrl,
      key: uniqueFileName,
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
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