import { z } from 'zod';

// Phone validation regex for international phone numbers
// Supports international formats: +1234567890, +1234567890123, etc.
// Follows ITU-T E.164 standard: 7-15 digits, optional + prefix
const phoneRegex = /^\+?[1-9]\d{6,14}$/;

// Email validation - more comprehensive
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Name validation - allow Bengali and English characters
const nameRegex = /^[\u0980-\u09FF\u0900-\u097F\u0600-\u06FF\u0750-\u077Fa-zA-Z\s.,'-]+$/;

// Message content validation - prevent obvious spam patterns
const spamPatterns = [
  /viagra|cialis|pharmacy/i,
  /\b(www\.|http|https)\b.*\b(\.|com|net|org|info)/i,
  /\$\d+|USD|bitcoin|crypto/i,
  /click here|visit now|buy now/i
];

function validateMessage(message: string): boolean {
  // Check for spam patterns
  for (const pattern of spamPatterns) {
    if (pattern.test(message)) {
      return false;
    }
  }
  return true;
}

export const submissionSchema = z.object({
  name: z
    .string()
    .trim()
    .max(120, 'Name must be less than 120 characters')
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val || val === '') return true;
      return nameRegex.test(val);
    }, 'Name contains invalid characters. Only letters, spaces, and basic punctuation are allowed'),
    
  phone: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      return phoneRegex.test(val);
    }, 'Please enter a valid international phone number (e.g., +1234567890 or 1234567890)'),
    
  email: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      return emailRegex.test(val);
    }, 'Please enter a valid email address'),
    
  district: z
    .string({ required_error: 'District is required' })
    .trim()
    .min(1, 'District is required')
    .refine((val) => val && val.trim().length > 0, 'District is required'),
    
  seatName: z
    .string({ required_error: 'Seat name is required' })
    .trim()
    .min(1, 'Seat name is required')
    .refine((val) => val && val.trim().length > 0, 'Seat name is required'),
    
  shareName: z.boolean().optional().default(false),
  
  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(10, 'Message must be at least 10 characters long')
    .max(2500, 'Message must be less than 2500 characters')
    .refine(validateMessage, 'Message contains inappropriate content or spam patterns')
});

// File validation schema for client-side
const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE_MB ?? '512');
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const fileValidationSchema = z.object({
  size: z.number().max(MAX_FILE_SIZE_BYTES, `File size must be less than ${MAX_FILE_SIZE_MB}MB`),
  type: z.string().refine(
    (type) => {
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
        'application/pdf', 'text/plain', 'text/csv',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed',
        'audio/mpeg', 'audio/wav', 'audio/mp3',
        'video/mp4', 'video/avi', 'video/quicktime'
      ];
      return allowedTypes.includes(type);
    },
    'File type not supported'
  ),
  name: z.string().refine(
    (name) => {
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.vbs', '.js', '.jar'];
      const extension = name.toLowerCase().substring(name.lastIndexOf('.'));
      return !dangerousExtensions.includes(extension);
    },
    'Executable files are not allowed for security reasons'
  )
});

export type FileValidation = z.infer<typeof fileValidationSchema>;
