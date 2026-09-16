import { useEffect, useRef, useState } from 'react'

const initialMessage = {
  role: 'assistant',
  content: 'Halo Mas, saya R2 NUSANTARA Assistant. Saya bisa membantu mencari produk, mengecek stok, membantu alur pemesanan, dan mengecek status pesanan.'
}

function RobotIcon({ open = false }) {
  return <span className="r2-ai-robot" aria-hidden="true">
    <span className="r2-ai-robot-aura" />
    <span className="r2-ai-robot-antenna"><b /></span>
    <span className="r2-ai-robot-head">
      <span className="r2-ai-robot-ear left" />
      <span className="r2-ai-robot-ear right" />
      <span className="r2-ai-robot-eye left" />
      <span className="r2-ai-robot-eye right" />
      <span className="r2-ai-robot-mouth" />
      <span className="r2-ai-robot-cigarette"><i /></span>
      <span className="r2-ai-robot-smoke smoke-1" />
      <span className="r2-ai-robot-smoke smoke-2" />
    </span>
    <span className="r2-ai-robot-neck" />
    <span className="r2-ai-robot-chest"><b>R2</b><i /></span>
    <span className={`r2-ai-robot-status${open ? ' active' : ''}`} />
  </span>
}

export default function R2AiChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => {
    if (typeof window === 'undefined') return [initialMessage]
    try {
      const saved = JSON.parse(sessionStorage.getItem('r2-ai-chat') || 'null')
      return Array.isArray(saved) && saved.length ? saved : [initialMessage]
    } catch { return [initialMessage] }
  })
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    try { sessionStorage.setItem('r2-ai-chat', JSON.stringify(messages.slice(-16))) } catch {}
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, open])

  async function sendMessage(event) {
    event?.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    setInput(''); setError(''); setBusy(true)
    const next = [...messages, { role: 'user', content: text }, { role: 'assistant', content: '' }]
    setMessages(next)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ messages: next.slice(0, -1).slice(-16) }),
      })
      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || 'Layanan AI belum tersedia.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let answer = ''
      const consume = (chunk) => {
        buffer += chunk
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''
        for (const raw of events) {
          const line = raw.split('\n').find((item) => item.startsWith('data: '))
          if (!line) continue
          try {
            const payload = JSON.parse(line.slice(6))
            if (payload.text) {
              answer += payload.text
              setMessages((current) => {
                const copy = [...current]
                copy[copy.length - 1] = { role: 'assistant', content: answer }
                return copy
              })
            }
            if (payload.message && !payload.text) setError(payload.message)
          } catch {}
        }
      }
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        consume(decoder.decode(value, { stream: true }))
      }
      consume(decoder.decode())
    } catch (err) {
      setError(err.message || 'Terjadi kendala.')
      setMessages((current) => current.slice(0, -1))
    } finally { setBusy(false) }
  }

  return <>
    <button className={`r2-ai-launcher${open ? ' is-open' : ''}`} type="button" aria-label={open ? 'Tutup R2 AI Assistant' : 'Buka R2 AI Assistant'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      {open ? <span className="r2-ai-close">×</span> : <RobotIcon />}
      {!open && <span className="r2-ai-label">AI</span>}
    </button>
    {open && <section className="r2-ai-panel" aria-label="R2 NUSANTARA AI Assistant">
      <header className="r2-ai-head">
        <div className="r2-ai-head-brand"><span className="r2-ai-head-avatar"><RobotIcon open /></span><span><strong>R2 NUSANTARA</strong><small>AI Customer Service • Online</small></span></div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Tutup">×</button>
      </header>
      <div className="r2-ai-messages" aria-live="polite">
        {messages.map((message, index) => <div className={`r2-ai-message ${message.role}`} key={`${index}-${message.role}`}><span>{message.content || (busy ? 'Mengetik…' : '')}</span></div>)}
        {busy && <div className="r2-ai-typing" aria-label="AI sedang mengetik"><i></i><i></i><i></i></div>}
        <div ref={endRef} />
      </div>
      {error && <div className="r2-ai-error" role="alert">{error}</div>}
      <form className="r2-ai-form" onSubmit={sendMessage}>
        <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={1800} placeholder="Tulis pertanyaan Anda…" aria-label="Pesan untuk R2 AI" disabled={busy} />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Kirim">↑</button>
      </form>
      <small className="r2-ai-note">Jangan kirim data rahasia seperti password atau API key.</small>
    </section>}
  </>
}
