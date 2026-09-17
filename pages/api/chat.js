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
- Jika tool gagal atau data tidak ditemukan, katakan bahwa data belum tersedia dan arahkan ke admin. Jangan menebak.
- Jangan mengubah data database secara langsung melalui chat.
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

function getProviders() {
  const providers = []
  // OpenRouter is intentionally first: the default route is zero-cost free inference.
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({
      name: 'openrouter',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      token: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'openrouter/free',
    })
  }
  // Anthropic is opt-in only so the site cannot silently fall back to a paid provider.
  if (process.env.ANTHROPIC_API_KEY && process.env.R2_AI_ALLOW_PAID_PROVIDER === 'true') {
    providers.push({
      name: 'anthropic',
      endpoint: 'https://api.anthropic.com/v1/messages',
      token: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
    })
  }
  return providers
}

async function fetchUpstream(provider, body, requestId) {
  const headers = provider.name === 'anthropic'
    ? { 'content-type': 'application/json', 'x-api-key': provider.token, 'anthropic-version': '2023-06-01' }
    : {
        'content-type': 'application/json',
        authorization: `Bearer ${provider.token}`,
        'http-referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://r2nusantara-shop.vercel.app',
        'x-title': 'R2 NUSANTARA AI Customer Service',
      }
  const response = await fetch(provider.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  })
  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => '')
    console.error(`[R2 AI] ${provider.name} upstream failed`, requestId, response.status, detail.slice(0, 700))
    throw new Error(`PROVIDER_${response.status}`)
  }
  return response
}

async function readSse(response, provider, res) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  const blocks = []
  let currentTool = null
  let stopReason = null
  let text = ''
  let emitted = false

  const handle = (raw) => {
    const dataLine = raw.split(/\r?\n/).find((line) => line.startsWith('data: '))
    if (!dataLine) return
    const value = dataLine.slice(6)
    if (value === '[DONE]') return
    let event
    try { event = JSON.parse(value) } catch { return }

    if (provider.name === 'anthropic') {
      if (event.type === 'error') throw new Error(event.error?.message || 'Provider AI mengembalikan error.')
      if (event.type === 'content_block_start') {
        const block = event.content_block
        if (block?.type === 'text') blocks.push({ type: 'text', text: '' })
        if (block?.type === 'tool_use') {
          currentTool = { type: 'tool_use', id: block.id, name: block.name, inputText: '' }
          blocks.push(currentTool)
        }
      }
      if (event.type === 'content_block_delta') {
        if (event.delta?.type === 'text_delta') {
          const part = event.delta.text || ''
          text += part
          if (part) {
            emitted = true
            send(res, 'delta', { text: part })
          }
          const last = blocks[blocks.length - 1]
          if (last?.type === 'text') last.text += part
        }
        if (event.delta?.type === 'input_json_delta' && currentTool) currentTool.inputText += event.delta.partial_json || ''
      }
      if (event.type === 'content_block_stop' && currentTool) {
        try { currentTool.input = currentTool.inputText ? JSON.parse(currentTool.inputText) : {} } catch { currentTool.input = {} }
        currentTool = null
      }
      if (event.type === 'message_delta') stopReason = event.delta?.stop_reason || null
    } else {
      const choice = event.choices?.[0]
      const delta = choice?.delta
      const part = delta?.content || ''
      if (part) {
        emitted = true
        text += part
        send(res, 'delta', { text: part })
      }
      if (delta?.tool_calls?.length) {
        for (const call of delta.tool_calls) {
          if (!currentTool || call.index !== currentTool.index) {
            currentTool = { type: 'tool_use', id: call.id || '', name: call.function?.name || '', inputText: '', index: call.index }
            blocks.push(currentTool)
          }
          currentTool.inputText += call.function?.arguments || ''
        }
      }
      if (choice?.finish_reason) stopReason = choice.finish_reason
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split(/\r?\n\r?\n/)
    buffer = chunks.pop() || ''
    for (const chunk of chunks) handle(chunk)
  }
  if (buffer.trim()) handle(buffer)
  if (currentTool) {
    try { currentTool.input = currentTool.inputText ? JSON.parse(currentTool.inputText) : {} } catch { currentTool.input = {} }
  }
  return { blocks, stopReason, text, emitted }
}

function anthropicMessages(messages) {
  return messages.map((message) => ({ role: message.role, content: message.content }))
}

function openRouterMessages(messages) {
  return messages.map((message) => message)
}

async function runProvider(provider, messages, res, requestId, toolRound = 0) {
  if (toolRound > MAX_TOOL_ROUNDS) throw new Error('Batas eksekusi tool AI tercapai.')

  const body = provider.name === 'anthropic'
    ? {
        model: provider.model,
        max_tokens: 900,
        system: SYSTEM_PROMPT,
        messages: anthropicMessages(messages),
        tools: AI_TOOLS,
        stream: true,
      }
    : {
        model: provider.model,
        max_tokens: 900,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...openRouterMessages(messages)],
        tools: AI_TOOLS.map((tool) => ({ type: 'function', function: { name: tool.name, description: tool.description, parameters: tool.input_schema } })),
        stream: true,
      }

  const response = await fetchUpstream(provider, body, requestId)
  const result = await readSse(response, provider, res)
  const toolUses = result.blocks.filter((block) => block.type === 'tool_use' && block.name)
  const wantsTools = provider.name === 'anthropic' ? result.stopReason === 'tool_use' : result.stopReason === 'tool_calls'
  if (!wantsTools || !toolUses.length) return { emitted: result.emitted }

  const toolResults = []
  for (const toolUse of toolUses) {
    let output
    try {
      output = await executeAiTool(toolUse.name, toolUse.input || {})
    } catch (error) {
      console.error('[R2 AI] tool failed', requestId, toolUse.name, error)
      output = { error: 'Tool tidak dapat dijalankan. Jangan menebak hasilnya.' }
    }
    toolResults.push({ toolUse, output })
  }

  const nextMessages = provider.name === 'anthropic'
    ? [
        ...messages,
        { role: 'assistant', content: result.blocks.map((block) => block.type === 'text' ? { type: 'text', text: block.text } : { type: 'tool_use', id: block.id, name: block.name, input: block.input || {} }) },
        { role: 'user', content: toolResults.map(({ toolUse, output }) => ({ type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(output).slice(0, 8000) })) },
      ]
    : [
        ...messages,
        { role: 'assistant', content: result.text || null, tool_calls: toolUses.map((toolUse) => ({ id: toolUse.id, type: 'function', function: { name: toolUse.name, arguments: JSON.stringify(toolUse.input || {}) } })) },
        ...toolResults.map(({ toolUse, output }) => ({ role: 'tool', tool_call_id: toolUse.id, content: JSON.stringify(output).slice(0, 8000) })),
      ]

  const next = await runProvider(provider, nextMessages, res, requestId, toolRound + 1)
  return { emitted: result.emitted || next.emitted }
}

async function runWithFallback(messages, res, requestId) {
  const providers = getProviders()
  if (!providers.length) throw new Error('FREE_AI_PROVIDER_NOT_CONFIGURED')
  let lastError
  let emitted = false
  for (const provider of providers) {
    try {
      console.info('[R2 AI] provider:start', requestId, provider.name, provider.model)
      const result = await runProvider(provider, messages, res, requestId)
      emitted = emitted || Boolean(result?.emitted)
      console.info('[R2 AI] provider:done', requestId, provider.name)
      return result
    } catch (error) {
      lastError = error
      console.error('[R2 AI] provider:error', requestId, provider.name, error?.message || error)
      // Never append another provider response after any visible text has streamed.
      if (emitted || error?.r2AiEmitted) throw error
    }
  }
  throw lastError || new Error('Layanan AI sedang tidak tersedia.')
}

async function handleRequest(req, res) {
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
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.setHeader('X-R2-AI-Request-ID', requestId)
  res.flushHeaders?.()

  if (isUnderageSignal(latest)) {
    send(res, 'delta', { text: 'Maaf Mas, saya tidak dapat melanjutkan bantuan transaksi apabila Anda menyatakan masih di bawah umur atau belum memenuhi verifikasi yang berlaku.' })
    send(res, 'done', {})
    return res.end()
  }

  try {
    await runWithFallback(messages, res, requestId)
    console.info('[R2 AI] request:done', requestId)
    send(res, 'done', {})
  } catch (error) {
    console.error('[R2 AI] request:error', requestId, error)
    send(res, 'error', { message: error?.message === 'FREE_AI_PROVIDER_NOT_CONFIGURED' ? 'AI gratis belum dikonfigurasi di server. Tambahkan OPENROUTER_API_KEY pada Vercel Production Environment Variables.' : 'Layanan AI sedang tidak tersedia. Silakan coba lagi atau hubungi admin R2 NUSANTARA.' })
  } finally {
    res.end()
  }
}

export default handleRequest
