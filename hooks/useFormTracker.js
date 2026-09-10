import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { logAuditEvent, logFormSubmission } from '../lib/audit'

function sanitizeForm(form) {
  const payload = {}
  const elements = Array.from(form.elements || [])
  for (const field of elements) {
    const name = field?.name || field?.id
    if (!name || field.disabled) continue
    const type = String(field.type || '').toLowerCase()
    if (['password', 'file', 'hidden'].includes(type)) continue
    if (['checkbox', 'radio'].includes(type) && !field.checked) continue
    const value = typeof field.value === 'string' ? field.value.trim() : field.value
    if (value === '' || value == null) continue
    payload[String(name).slice(0, 80)] = String(value).slice(0, 500)
  }
  return payload
}

export function useFormTracker({ enabled = true } = {}) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined

    const started = new WeakSet()
    const submitted = new WeakSet()
    const timers = new WeakMap()

    const getUserId = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        return data?.user?.id || null
      } catch {
        return null
      }
    }

    const markStarted = form => {
      if (!form || started.has(form)) return
      started.add(form)
      const formName = form.getAttribute('name') || form.id || form.dataset?.formName || 'unnamed_form'
      window.clearTimeout(timers.get(form))
      const timer = window.setTimeout(async () => {
        const userId = await getUserId()
        await logAuditEvent('form_start', {
          form_name: formName,
          path: window.location.pathname,
        }, userId)
      }, 350)
      timers.set(form, timer)
    }

    const onFocusIn = event => {
      const form = event.target?.closest?.('form')
      if (form) markStarted(form)
    }

    const onSubmit = async event => {
      const form = event.target?.closest?.('form')
      if (!form || submitted.has(form)) return
      submitted.add(form)
      const formName = form.getAttribute('name') || form.id || form.dataset?.formName || 'unnamed_form'
      const payload = sanitizeForm(form)
      const userId = await getUserId()
      await logFormSubmission(formName, {
        ...payload,
        path: window.location.pathname,
      }, userId, 'submitted')
    }

    const onPageHide = () => {
      for (const form of document.forms) {
        if (!started.has(form) || submitted.has(form)) continue
        const formName = form.getAttribute('name') || form.id || form.dataset?.formName || 'unnamed_form'
        void getUserId().then(userId => logAuditEvent('form_abandon', {
          form_name: formName,
          path: window.location.pathname,
        }, userId))
      }
    }

    document.addEventListener('focusin', onFocusIn, true)
    document.addEventListener('submit', onSubmit, true)
    window.addEventListener('pagehide', onPageHide)

    return () => {
      document.removeEventListener('focusin', onFocusIn, true)
      document.removeEventListener('submit', onSubmit, true)
      window.removeEventListener('pagehide', onPageHide)
      for (const timer of timers.values?.() || []) window.clearTimeout(timer)
    }
  }, [enabled])
}
