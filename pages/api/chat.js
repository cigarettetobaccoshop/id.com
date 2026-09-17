import { executeAiTool, AI_TOOLS } from '../../lib/aiAgentTools'

const MAX_MESSAGES = 16
const MAX_MESSAGE_CHARS = 1800
const WINDOW_MS = 60_000
const MAX_REQUESTS = 12
const MAX_TOOL_ROUNDS = 3
const UPSTREAM_TIMEOUT_MS = 40_000
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
  if (!res.writableEnded) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

async function readAnthropicStream(response, res) {
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

    if (event.type === 'error') throw new Error(event.error?.message || 'Model AI mengembalikan error.')
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

  return { assistantBlocks, stopReason }
}

function gatewayAuth() {
  const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN
  if (!token) return null
  return token
}

async function requestAnthropic({ messages, requestId }) {
  const gatewayToken = gatewayAuth()
  const usingGateway = Boolean(gatewayToken)
  const endpoint = usingGateway
    ? 'https://ai-gateway.vercel.sh/v1/messages'
    : 'https://api.anthropic.com/v1/messages'

  const configuredModel = process.env.ANTHROPIC_MODEL || 'anthropic/claude-sonnet-5'
  const model = usingGateway && !configuredModel.includes('/')
    ? `anthropic/${configuredModel}`
    : configuredModel

  const headers = {
    'content-type': 'application/json',
    ...(usingGateway
      ? { authorization: `Bearer ${gatewayToken}` }
      : { 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' }),
  }

  if (!usingGateway && !process.env.ANTHROPIC_API_KEY) throw new Error('Konfigurasi AI server belum tersedia.')

  console.info('[R2 AI] upstream:start', requestId, usingGateway ? 'gateway' : 'anthropic', model)
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        max_tokens: 900,
        system: SYSTEM_PROMPT,
        messages,
        tools: AI_TOOLS,
        stream: true,
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => '')
      console.error(`${usingGateway ? 'AI Gateway' : 'Anthropic'} request failed:`, requestId, response.status, detail.slice(0, 700))
      throw new Error('Layanan AI sedang tidak tersedia.')
    }
    console.info('[R2 AI] upstream:connected', requestId, response.status)
    return response
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') throw new Error('Model AI tidak merespons dalam batas waktu.')
    throw error
  }
}

async function anthropicStream({ messages, res, requestId, toolRound = 0 }) {
  const response = await requestAnthropic({ messages, requestId })
  const { assistantBlocks, stopReason } = await readAnthropicStream(response, res)

  const toolUses = assistantBlocks.filter((block) => block.type === 'tool_use')
  if (stopReason !== 'tool_use' || !toolUses.length) return { usedTools: toolRound > 0 }
  if (toolRound >= MAX_TOOL_ROUNDS) throw new Error('Batas eksekusi tool AI tercapai.')

  const toolResults = []
  for (const toolUse of toolUses) {
    let result
    try {
      result = await executeAiTool(toolUse.name, toolUse.input || {})
    } catch (error) {
      console.error(`AI tool ${toolUse.name} failed:`, requestId, error)
      result = { error: 'Tool tidak dapat dijalankan. Jangan menebak hasilnya.' }
    }
    toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(result).slice(0, 8000) })
  }

  const nextMessages = [
    ...messages,
    { role: 'assistant', content: assistantBlocks.map((block) => block.type === 'text' ? { type: 'text', text: block.text } : { type: 'tool_use', id: block.id, name: block.name, input: block.input || {} }) },
    { role: 'user', content: toolResults },
  ]
  return anthropicStream({ messages: nextMessages, res, requestId, toolRound: toolRound + 1 })
}

export default async function handler(req, res) {
  const requestId = String(req.headers['x-r2-ai-request-id'] || `server-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`).slice(0, 80)
  console.info('[R2 AI] request:received', requestId, req.method)

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
    res.setHeader('X-R2-AI-Request-ID', requestId)
    send(res, 'delta', { text: 'Maaf Mas, saya tidak dapat melanjutkan bantuan transaksi apabila Anda menyatakan masih di bawah umur atau belum memenuhi verifikasi yang berlaku.' })
    send(res, 'done', {})
    return res.end()
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.setHeader('X-R2-AI-Request-ID', requestId)
  res.flushHeaders?.()

  try {
    await anthropicStream({ messages, res, requestId })
    console.info('[R2 AI] request:done', requestId)
    send(res, 'done', {})
  } catch (error) {
    console.error('[R2 AI] request:error', requestId, error)
    send(res, 'error', { message: error.message || 'Layanan AI sedang tidak tersedia.' })
  } finally {
    res.end()
  }
}
