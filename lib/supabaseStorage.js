import { supabase } from './supabaseClient'

const safeSegment = (value) => String(value || '').replace(/^\/+|\/+$/g, '').replace(/\.\./g, '')

export async function uploadFile(bucket, path, file) {
  const safeBucket = safeSegment(bucket)
  const safePath = safeSegment(path)
  if (!safeBucket || !safePath || !file) throw new Error('Bucket, path, and file are required')

  const { data, error } = await supabase.storage.from(safeBucket).upload(safePath, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data: publicUrlData } = supabase.storage.from(safeBucket).getPublicUrl(safePath)
  return { path: data.path, url: publicUrlData.publicUrl }
}

export async function uploadFileWithAutoName(bucket, file) {
  const originalName = String(file?.name || 'file').replace(/[^a-zA-Z0-9._-]/g, '-')
  return uploadFile(bucket, `${Date.now()}-${originalName}`, file)
}

export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage.from(safeSegment(bucket)).remove([safeSegment(path)])
  if (error) throw new Error(`Delete failed: ${error.message}`)
}

export async function listFiles(bucket, path = '') {
  const { data, error } = await supabase.storage.from(safeSegment(bucket)).list(safeSegment(path), {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
  })
  if (error) throw new Error(`List failed: ${error.message}`)
  return data || []
}

export function getPublicUrl(bucket, path) {
  return supabase.storage.from(safeSegment(bucket)).getPublicUrl(safeSegment(path)).data.publicUrl
}

export async function downloadFile(bucket, path) {
  const { data, error } = await supabase.storage.from(safeSegment(bucket)).download(safeSegment(path))
  if (error) throw new Error(`Download failed: ${error.message}`)
  return data
}
