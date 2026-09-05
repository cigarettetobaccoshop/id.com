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

// Existing storefront pages use the legacy compatibility view and human-readable
// column names. PostgREST requires identifiers containing spaces to be quoted.
// Normalize only the SELECT projection; filters and returned field names stay
// unchanged, preserving the existing UI contract while reading production data.
function normalizeLegacySelect(columns) {
  if (typeof columns !== 'string') return columns
  return columns
    .split('Option1 Name').join('"Option1 Name"')
    .split('Option1 Value').join('"Option1 Value"')
    .split('Variant SKU').join('"Variant SKU"')
    .split('Variant Price').join('"Variant Price"')
    .split('Variant Inventory Qty').join('"Variant Inventory Qty"')
}

const supabase = new Proxy(client, {
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

export { supabase }
export default supabase
