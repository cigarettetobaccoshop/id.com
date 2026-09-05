# Supabase Storage Setup Guide

## Overview

Supabase Storage memungkinkan Anda menyimpan file (gambar, video, dokumen) dengan keamanan berbasis Role Level Security (RLS).

## Features

✅ File upload/download dengan authentication
✅ Public dan private buckets
✅ Automatic CDN caching
✅ File size limits dan validation
✅ RLS policies untuk access control

## Setup

### 1. Create Storage Bucket

Di Supabase Dashboard:
1. Storage > Buckets > New bucket
2. Name: `avatars`
3. Privacy: Public (untuk demo) atau Private (untuk production)
4. Save

### 2. Enable RLS Policies

```sql
-- Public access for reading
CREATE POLICY "Public access for select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- Users can delete own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND owner_id = auth.uid()
  );
```

### 3. Configure CORS

Di Supabase Dashboard:
1. Storage > Settings > CORS Configuration
2. Add allowed origins:
   - Development: `http://localhost:3000`
   - Production: `https://id.com`

## Usage

### Upload File
```javascript
import { uploadFileWithAutoName } from '@/lib/supabaseStorage'

const file = document.querySelector('input[type="file"]').files[0]
const { path, url } = await uploadFileWithAutoName('avatars', file)
console.log('Uploaded to:', url)
```

### List Files
```javascript
import { listFiles } from '@/lib/supabaseStorage'

const files = await listFiles('avatars')
console.log(files)
```

### Delete File
```javascript
import { deleteFile } from '@/lib/supabaseStorage'

await deleteFile('avatars', 'filename.jpg')
```

### Get Public URL
```javascript
import { getPublicUrl } from '@/lib/supabaseStorage'

const url = getPublicUrl('avatars', 'filename.jpg')
```

## File Validation

### Allowed File Types
- Images: jpg, jpeg, png, gif, webp
- Videos: mp4, webm, mov
- Documents: pdf, doc, docx, txt

### Size Limits
- Images: 5MB max
- Videos: 50MB max
- Documents: 10MB max

## Testing

Development:
```bash
npm run dev
# Go to http://localhost:3000/storage-demo
# Upload image file
# See real-time list updates
```

Production:
```bash
# Already deployed with storage support
# Vercel auto-deploys
```

## Security Checklist

✅ Do's:
- Validate file types on client and server
- Limit file sizes
- Use RLS policies for access control
- Enable CORS for your domain only
- Use signed URLs for private files

❌ Don'ts:
- Don't allow arbitrary file uploads
- Don't expose storage credentials
- Don't disable RLS
- Don't allow unlimited file sizes

## Bucket Types

### Public Bucket
- Files are accessible without authentication
- Good for: avatars, profiles, public media
- Risk: anyone can download files

```javascript
// Public access
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('file.jpg')
```

### Private Bucket
- Files require authentication
- Good for: user documents, private files
- Requires signed URLs

```javascript
// Private access - need signed URL
const { data } = supabase.storage
  .from('private-docs')
  .createSignedUrl('file.pdf', 60) // 60 seconds expiry
```

## Troubleshooting

### CORS Error
```
Solution: 
1. Check CORS settings in Supabase Dashboard
2. Ensure your domain is added
3. Check browser console for exact error
```

### Upload Fails
```
Solution:
1. Check file size limits
2. Verify RLS policies
3. Check authentication status
```

### File Not Found
```
Solution:
1. Verify bucket name is correct
2. Check file path is correct
3. Ensure bucket exists
```

## API Endpoints

### POST /api/upload
Upload file

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@path/to/file.jpg" \
  -F "bucket=avatars"
```

### GET /api/files
List files in bucket

```bash
curl "http://localhost:3000/api/files?bucket=avatars"
```

### DELETE /api/files
Delete file

```bash
curl -X DELETE http://localhost:3000/api/files \
  -H "Content-Type: application/json" \
  -d '{"bucket":"avatars","path":"filename.jpg"}'
```

## Next Steps
- ✅ Step 2: Real-time Integration
- ✅ Step 3: OAuth Integration
- ✅ Step 4: Storage Setup
- 📊 Step 5: Analytics & Optimization
