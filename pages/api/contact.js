import { supabaseServer } from '../../lib/supabaseServer'

export const config = {
  api: { bodyParser: { sizeLimit: '16kb' } },
}

const cleanText = (value, maxLength) => String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
const cleanMessage = (value, maxLength) => String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLength)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {}
    const name = cleanText(body.name, 120)
    const email = cleanText(body.email, 254).toLowerCase()
    const subject = cleanText(body.subject, 180)
    const message = cleanMessage(body.message, 5000)
    if (!name || name.length < 2) return res.status(400).json({ error: 'Nama wajib diisi.' })
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Format email tidak valid.' })
    if (!message || message.length < 10) return res.status(400).json({ error: 'Pesan minimal 10 karakter.' })
    const { error } = await supabaseServer.rpc('submit_contact_message', { p_name: name, p_email: email, p_subject: subject, p_message: message })
    if (error) {
      console.error('Supabase contact RPC failed:', error.message)
      return res.status(error.message === 'Duplicate submission' ? 429 : 500).json({ error: error.message === 'Duplicate submission' ? 'Pesan yang sama baru saja dikirim. Silakan tunggu sebentar.' : 'Pesan gagal dikirim. Silakan coba lagi.' })
    }
    return res.status(201).json({ success: true, message: 'Pesan berhasil dikirim.' })
  } catch (error) {
    console.error('Contact API failed:', error)
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' })
  }
}
