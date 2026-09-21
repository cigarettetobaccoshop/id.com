// Frontend-only merchandising configuration.
// Add product Handle / SKU values here to curate the VIP badge without touching the database/API.
export const CURATED_VIP_PRODUCTS = [
  // 'example-handle-or-sku',
]

export const NEW_PRODUCT_DAYS = 14

const normalize = value => String(value || '').trim().toLowerCase()

export const isCuratedVip = product => {
  const candidates = [product?.Handle, product?.handle, product?.['Variant SKU'], product?.sku]
    .map(normalize)
    .filter(Boolean)
  return candidates.some(value => CURATED_VIP_PRODUCTS.map(normalize).includes(value))
}

export const isNewProduct = product => {
  const raw = product?.created_at || product?.createdAt || product?.published_at || product?.publishedAt || product?.Published
  const date = raw instanceof Date ? raw : new Date(raw)
  if (!raw || Number.isNaN(date.getTime())) return false
  const age = Date.now() - date.getTime()
  return age >= 0 && age <= NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000
}

export const curatedBadge = product => {
  if (isCuratedVip(product)) return { type: 'vip', label: 'VIP' }
  if (isNewProduct(product)) return { type: 'new', label: 'BARU' }
  return null
}
