import { executeAiTool, AI_TOOLS } from '../../lib/aiAgentTools'

const MAX_MESSAGES = 16
const MAX_MESSAGE_CHARS = 1800
const WINDOW_MS = 60_000
const MAX_REQUESTS = 12
const buckets = new Map()

const SYSTEM_PROMPT = `Kamu adalah R2 NUSANTARA Assistant, customer service resmi untuk website R2 NUSANTARA.

Aturan utama:
- Jawab dalam Bahasa Indonesia yang formal, ramah, singkat lalu detail bila diperlukan.
- Boleh menggunakan sapaan "Mas" secara natural.
- Informasi produk, harga, stok, dan status pesanan harus berasal dari tool. Jangan mengarang.
- Gunakan cari_produk sebelum memberikan informasi katalog. Gunakan cek_stok jika stok/availability ditanyakan.
- Jangan pernah meminta, menampilkan, atau menebak secret/API key.
- Jangan memproses pembayaran di chat. Untuk checkout Shopify, hanya gunakan URL checkout resmi yang dikembalikan tool.
- Jangan membuat URL checkout manual.
- Untuk status pesanan, wajib melakukan verifikasi dengan data order yang tersedia. Jangan membocorkan detail order jika verifikasi gagal.
- Jika pelanggan menyatakan dirinya masih di bawah umur, hentikan bantuan transaksi dan jangan mencoba melewati verifikasi usia atau kebijakan keselamatan yang berlaku.
- Jangan memberikan cara untuk menghindari verifikasi usia atau pembatasan penjualan.
- Jika tool gagal atau data tidak ditemukan, katakan bahwa data belum tersedia dan arahkan ke admin. Jangan menebak.
- Jangan mengubah data database secara langsung melalui chat. Tool transaksi hanya boleh membuat cart resmi jika konfigurasi dan identifier Shopify valid.
- Konteks operasional: R2 NUSANTARA adalah gudang/distributor di Malang. Jam layanan yang diketahui dari website: Senin-Sabtu 08.00-17.00 WIB.
`

function getClientKey(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  return forwarded || String(req.socket?.remoteAddress || 'unknown')
}

function allowed(req) {
  const now = Date.now()
  const key = getClientKey(req)
  const current = buckets.get(key) || { started: now, count: 0 }
  if (now - current.started >= WINDOW_MS) {
    buckets.set(key, { started: now, count: 1 })
    return true
  }
  current.count += 1
  buckets.set(key, current)
  return current.count <= MAX_REQUESTS
}

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages.slice(-MAX_MESSAGES).map((message) => ({
    role: message?.role === 'assistant' ? 'assistant' : 'user',
    content: String(message?.content || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, MAX_MESSAGE_CHARS),
  })).filter((message) => message.content.trim())
}

function isUnderageSignal(text) {
  const value = String(text || '').toLowerCase()
  return /\b(umur\s*(?:0?1[0-7])|(?:1[0-7])\s*tahun|di\s*bawah\s*umur|belum\s*(?:cukup\s*)?umur|masih\s*(?:anak|pelajar\s*di\s*bawah)|underage|minor)\b/i.test(value)
}

function send(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

async function anthropicStream({ messages, res, toolContext }) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY belum dikonfigurasi di server.')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 900,
      system: SYSTEM_PROMPT,
      messages,
      tools: AI_TOOLS,
      stream: true,
    }),
  })

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => '')
    console.error('Anthropic request failed:', response.status, detail.slice(0, 500))
    throw new Error('Layanan AI sedang tidak tersedia.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let assistantBlocks = []
  let currentTool = null
  let stopReason = null

  const handleEvent = async (raw) => {
    const dataLine = raw.split('\n').find((line) => line.startsWith('data: '))
    if (!dataLine) return
    let event
    try { event = JSON.parse(dataLine.slice(6)) } catch { return }

    if (event.type === 'message_start') assistantBlocks = []
    if (event.type === 'content_block_start') {
      const block = event.content_block
      if (block?.type === 'text') assistantBlocks.push({ type: 'text', text: block.text || '' })
      if (block?.type === 'tool_use') {
        currentTool = { type: 'tool_use', id: block.id, name: block.name, inputText: '' }
        assistantBlocks.push(currentTool)
      }
    }
    if (event.type === 'content_block_delta') {
      if (event.delta?.type === 'text_delta') {
        const text = event.delta.text || ''
        if (text) {
          send(res, 'delta', { text })
          const last = assistantBlocks[assistantBlocks.length - 1]
          if (last?.type === 'text') last.text += text
        }
      }
      if (event.delta?.type === 'input_json_delta' && currentTool) currentTool.inputText += event.delta.partial_json || ''
    }
    if (event.type === 'content_block_stop' && currentTool) {
      try { currentTool.input = currentTool.inputText ? JSON.parse(currentTool.inputText) : {} } catch { currentTool.input = {} }
      currentTool = null
    }
    if (event.type === 'message_delta') stopReason = event.delta?.stop_reason || null
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() || ''
    for (const chunk of chunks) await handleEvent(chunk)
  }
  if (buffer.trim()) await handleEvent(buffer)

  const toolUses = assistantBlocks.filter((block) => block.type === 'tool_use')
  if (stopReason !== 'tool_use' || !toolUses.length) return { messages, usedTools: false }

  const toolResults = []
  for (const toolUse of toolUses) {
    let result
    try {
      result = await executeAiTool(toolUse.name, toolUse.input || {})
    } catch (error) {
      console.error(`AI tool ${toolUse.name} failed:`, error)
      result = { error: 'Tool tidak dapat dijalankan. Jangan menebak hasilnya.' }
    }
    toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(result).slice(0, 8000) })
  }

  const nextMessages = [
    ...messages,
    { role: 'assistant', content: assistantBlocks.map((block) => block.type === 'text' ? { type: 'text', text: block.text } : { type: 'tool_use', id: block.id, name: block.name, input: block.input || {} }) },
    { role: 'user', content: toolResults },
  ]
  return anthropicStream({ messages: nextMessages, res, toolContext })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  if (!allowed(req)) return res.status(429).json({ error: 'Terlalu banyak permintaan. Silakan coba lagi sebentar.' })

  const messages = cleanMessages(req.body?.messages)
  if (!messages.length || messages[messages.length - 1].role !== 'user') return res.status(400).json({ error: 'Pesan pengguna tidak valid.' })

  const latest = messages[messages.length - 1].content
  if (isUnderageSignal(latest)) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    send(res, 'delta', { text: 'Maaf Mas, saya tidak dapat melanjutkan bantuan transaksi apabila Anda menyatakan masih di bawah umur atau belum memenuhi verifikasi yang berlaku.' })
    send(res, 'done', {})
    return res.end()
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  try {
    await anthropicStream({ messages, res })
    send(res, 'done', {})
  } catch (error) {
    console.error('AI chat error:', error)
    send(res, 'error', { message: error.message || 'Layanan AI sedang tidak tersedia.' })
  } finally {
    res.end()
  }
}
