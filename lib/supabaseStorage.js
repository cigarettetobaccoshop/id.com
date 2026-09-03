import { supabase, supabaseAdmin } from './supabaseRealtimeClient'

/**
 * Upload file to Supabase Storage
 * @param {string} bucket - Bucket name
 * @param {string} path - File path in bucket
 * @param {File} file - File to upload
 * @returns {Promise<{path, url}>}
 */
export async function uploadFile(bucket, path, file) {
  const client = supabaseAdmin || supabase

  const { data, error } = await client.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: publicUrlData } = client.storage
    .from(bucket)
    .getPublicUrl(path)

  return {
    path: data.path,
    url: publicUrlData.publicUrl,
  }
}

/**
 * Upload file with custom name
 * @param {string} bucket - Bucket name
 * @param {File} file - File to upload
 * @returns {Promise<{path, url}>}
 */
export async function uploadFileWithAutoName(bucket, file) {
  const timestamp = Date.now()
  const filename = `${timestamp}-${file.name}`
  const path = `${bucket}/${filename}`

  return uploadFile(bucket, path, file)
}

/**
 * Delete file from storage
 * @param {string} bucket - Bucket name
 * @param {string} path - File path to delete
 * @returns {Promise<void>}
 */
export async function deleteFile(bucket, path) {
  const client = supabaseAdmin || supabase

  const { error } = await client.storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * List files in bucket
 * @param {string} bucket - Bucket name
 * @param {string} path - Path to list (optional)
 * @returns {Promise<Array>}
 */
export async function listFiles(bucket, path = '') {
  const client = supabaseAdmin || supabase

  const { data, error } = await client.storage
    .from(bucket)
    .list(path, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    })

  if (error) {
    throw new Error(`List failed: ${error.message}`)
  }

  return data || []
}

/**
 * Get public URL for file
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @returns {string} Public URL
 */
export function getPublicUrl(bucket, path) {
  const client = supabaseAdmin || supabase

  const { data } = client.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}

/**
 * Download file
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @returns {Promise<Blob>}
 */
export async function downloadFile(bucket, path) {
  const client = supabaseAdmin || supabase

  const { data, error } = await client.storage
    .from(bucket)
    .download(path)

  if (error) {
    throw new Error(`Download failed: ${error.message}`)
  }

  return data
}
