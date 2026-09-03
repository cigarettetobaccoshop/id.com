import { useEffect, useState } from 'react'
import {
  uploadFileWithAutoName,
  listFiles,
  deleteFile,
  getPublicUrl,
} from '../lib/supabaseStorage'

const BUCKET_NAME = 'avatars'

export default function StorageDemo() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    loadFiles()
  }, [])

  async function loadFiles() {
    setLoading(true)
    try {
      const fileList = await listFiles(BUCKET_NAME)
      setFiles(fileList)
      setMessage(`Loaded ${fileList.length} files`)
    } catch (err) {
      setMessage(`Error loading files: ${err.message}`)
    }
    setLoading(false)
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setMessage('Only image files are allowed')
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const result = await uploadFileWithAutoName(BUCKET_NAME, file)

      clearInterval(progressInterval)
      setUploadProgress(100)

      setMessage(`File uploaded: ${result.path}`)

      // Reload file list
      setTimeout(() => {
        loadFiles()
        setUploadProgress(0)
      }, 500)
    } catch (err) {
      setMessage(`Upload failed: ${err.message}`)
      setUploadProgress(0)
    }
    setLoading(false)
  }

  async function handleDelete(path) {
    if (!confirm('Are you sure you want to delete this file?')) return

    setLoading(true)
    try {
      await deleteFile(BUCKET_NAME, path)
      setMessage(`File deleted: ${path}`)
      loadFiles()
    } catch (err) {
      setMessage(`Delete failed: ${err.message}`)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>📁 Supabase Storage Demo</h1>

      {message && (
        <p
          style={{
            color: '#666',
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
          }}
        >
          {message}
        </p>
      )}

      <div
        style={{
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
        }}
      >
        <h2>Upload Image</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={loading}
          style={{ marginBottom: '10px' }}
        />

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div style={{ marginTop: '10px' }}>
            <div
              style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#eee',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  backgroundColor: '#3ECF8E',
                  transition: 'width 0.3s',
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              {uploadProgress}%
            </p>
          </div>
        )}
      </div>

      <div>
        <h2>Files ({files.length})</h2>
        {files.length === 0 ? (
          <p style={{ color: '#999' }}>No files yet. Upload one to get started!</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '15px',
            }}
          >
            {files.map((file) => (
              <div
                key={file.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                }}
              >
                <img
                  src={getPublicUrl(BUCKET_NAME, file.name)}
                  alt={file.name}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                  }}
                />
                <div style={{ padding: '10px' }}>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#333',
                      margin: '0 0 8px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </p>
                  <button
                    onClick={() => handleDelete(file.name)}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '6px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr style={{ marginTop: '30px' }} />
      <p style={{ fontSize: '12px', color: '#999' }}>
        💡 Tip: Max file size is 5MB. Only image files are allowed.
      </p>
    </div>
  )
}
