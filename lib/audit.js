import { supabase } from './supabaseClient'

export async function logAuditEvent(eventType, metadata = {}, userId = null) {
  if (!supabase || !eventType) return { data: null, error: null }

  try {
    const safeMetadata = metadata && typeof metadata === 'object' ? metadata : {}
    const { data, error } = await supabase.from('audit_log').insert({
      user_id: userId || null,
      event_type: String(eventType),
      metadata: safeMetadata,
    }).select('id').maybeSingle()

    if (error) {
      if (process.env.NODE_ENV !== 'production') console.warn('[activity] audit insert failed', error.message)
      return { data: null, error }
    }
    return { data, error: null }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.warn('[activity] audit exception', error)
    return { data: null, error }
  }
}

export async function logFormSubmission(formName, payload = {}, userId = null, status = 'submitted') {
  if (!supabase || !formName) return { data: null, error: null }

  try {
    const safePayload = payload && typeof payload === 'object' ? payload : {}
    const { data, error } = await supabase.from('form_submissions').insert({
      user_id: userId || null,
      form_name: String(formName),
      payload: safePayload,
      status: String(status || 'submitted'),
    }).select('id').maybeSingle()

    if (error) {
      if (process.env.NODE_ENV !== 'production') console.warn('[activity] form insert failed', error.message)
      return { data: null, error }
    }
    return { data, error: null }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.warn('[activity] form exception', error)
    return { data: null, error }
  }
}
