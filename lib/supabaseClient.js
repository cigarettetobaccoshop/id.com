import { createClient } from '@supabase/supabase-js'

// R2 NUSANTARA production catalog source of truth.
// This client intentionally uses only the public Supabase URL and publishable
// key. Never place a service-role key in this module or any NEXT_PUBLIC_* var.
const SUPABASE_URL = 'https://zgsbtexngystdmakqjyi.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_7wqbX7wUVFJZqinPyy8XLQ_SimByBEo'

if (!/^https:\/\/[^\s/]+\.supabase\.co(?:\/.*)?$/.test(SUPABASE_URL)) {
  throw new Error('Invalid Supabase URL')
}

if (!SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY.toLowerCase().includes('service_role')) {
  throw new Error('Supabase publishable key must not contain a service_role key')
}

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Backward-compatible query normalization for the legacy catalog view.
// Existing pages use human-readable column names; PostgREST requires names
// containing spaces to be quoted. Normalize only the select projection so
// existing UI/data contracts remain unchanged while production data stays in
// the normalized `products` table behind the compatibility view.
const LEGACY_COLUMNS = [
  'Option1 Name',
  'Option1 Value',
  'Variant SKU',
  'Variant Price',
  'Variant Inventory Qty',
]

function normalizeLegacySelect(columns) {
  if (typeof columns !== 'string') return columns
  let normalized = columns
  for (const column of LEGACY_COLUMNS) {
    const quoted = `"${column}"`
    const pattern = new RegExp(`(?<![\\w\"])${column.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(?![\\w\"])`, 'g')
    normalized = normalized.replace(pattern, quoted)
  }
  return normalized
}

const legacyCatalog = new Proxy(client, {
  get(target, property, receiver) {
    if (property !== 'from') return Reflect.get(target, property, receiver)
    return (table) => {
      const builder = target.from(table)
      if (table !== 'R2 NUSANTARA') return builder
      return new Proxy(builder, {
        get(query, method, queryReceiver) {
          if (method !== 'select') return Reflect.get(query, method, queryReceiver)
          return (columns, ...args) => query.select(normalizeLegacySelect(columns), ...args)
        },
      })
    }
  },
})

export const supabase = legacyCatalog
export default supabase
