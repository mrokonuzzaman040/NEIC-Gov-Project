# AWS S3 Setup for Gallery

This document outlines the AWS S3 configuration needed for the Gallery feature.

## Required Environment Variables

Add the following environment variables to your `.env` file:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_S3_BUCKET_NAME=your_bucket_name_here
```

## AWS S3 Bucket Setup

1. **Create an S3 Bucket:**
   - Go to AWS S3 Console
   - Create a new bucket with a unique name
   - Choose your preferred region

2. **Configure Bucket Permissions:**
   - Enable public read access for uploaded files
   - Set up CORS policy if needed:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **Create IAM User:**
   - Create a new IAM user for programmatic access
   - Attach the following policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:PutObjectAcl"
         ],
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

4. **Get Access Keys:**
   - Generate access keys for the IAM user
   - Add them to your environment variables

## File Upload Features

- **Supported Formats:** JPEG, PNG, WebP, GIF
- **Max File Size:** 10MB
- **Upload Location:** Files are stored in `gallery/` folder
- **Public Access:** Files are automatically made publicly accessible
- **File Naming:** Automatic unique naming with timestamp and random string

## Security Notes

- Files are uploaded with `public-read` ACL for public access
- File type validation is performed before upload
- File size limits are enforced
- Unique file names prevent conflicts
- Old files are automatically deleted when updated

## Usage in Admin Panel

1. Navigate to Admin Panel → Gallery
2. Click "Add Image" to upload new images
3. Fill in English and Bengali titles (required)
4. Add descriptions and tags (optional)
5. Select category and set display order
6. Mark as featured if needed
7. Submit to upload to S3 and save to database

## Public Gallery Access

Users can view the gallery at `/gallery` route in both English and Bengali languages.
