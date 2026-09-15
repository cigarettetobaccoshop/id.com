#!/usr/bin/env node

/**
 * Publish-gate audit for the catalog thumbnail layer.
 *
 * Read-only: it consumes /api/products and /api/thumbnails/resolve and never
 * writes to Supabase, products, orders, cart, checkout, or other integrations.
 *
 * Usage:
 *   node scripts/thumbnail-publish-audit.js
 *   THUMBNAIL_AUDIT_ORIGIN=https://r2nusantara-shop.vercel.app node scripts/thumbnail-publish-audit.js
 */

const origin = (process.env.THUMBNAIL_AUDIT_ORIGIN || 'https://r2nusantara-shop.vercel.app').replace(/\/$/, '');
const output = process.env.THUMBNAIL_AUDIT_OUTPUT || 'thumbnail-publish-audit.json';
const limit = Math.min(250, Math.max(1, Number(process.env.THUMBNAIL_AUDIT_LIMIT || 233)));
const concurrency = Math.min(4, Math.max(1, Number(process.env.THUMBNAIL_AUDIT_CONCURRENCY || 1)));
const minBytes = 8 * 1024;
const maxBytes = 2 * 1024 * 1024;
const minDimension = 320;

const fallbackUrl = '/images/thumbnails/cigarette-pack-fallback.svg';
const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
const tokens = (value) => normalize(value).split(' ').filter((x) => x.length >= 3);

async function json(url, options) {
  const response = await fetch(url, { ...options, headers: { accept: 'application/json', ...(options?.headers || {}) } });
  const body = await response.text();
  let data = null;
  try { data = JSON.parse(body); } catch {}
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${body.slice(0, 200)}`);
  return data;
}

function classify(product, result) {
  if (!result?.success || result.url === fallbackUrl || result.source === 'cigarette-fallback') return 'fallback';
  if (result.match) return result.match;
  const name = normalize(product.title || product.name);
  const urlText = normalize(result.url);
  const matched = tokens(name).filter((token) => urlText.includes(token)).length;
  if (matched >= Math.max(2, Math.ceil(tokens(name).length * 0.75)) && Number(result.confidence || 0) >= 80) return 'exact';
  if (matched >= 1 && Number(result.confidence || 0) >= 65) return 'brand';
  return 'category';
}

function parseDimensions(buffer, contentType) {
  try {
    if (/png/i.test(contentType) && buffer.length >= 24 && buffer.toString('ascii', 1, 4) === 'PNG') {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }
    if (/jpe?g/i.test(contentType) && buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset + 9 < buffer.length) {
        if (buffer[offset] !== 0xff) { offset += 1; continue; }
        const marker = buffer[offset + 1];
        const length = buffer.readUInt16BE(offset + 2);
        if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
          return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
        }
        offset += 2 + length;
      }
    }
    if (/webp/i.test(contentType) && buffer.length >= 30 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
      const type = buffer.toString('ascii', 12, 16);
      if (type === 'VP8X') return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
    }
    if (/svg/i.test(contentType)) return null;
  } catch {}
  return null;
}

async function inspectImage(url) {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
  if (!response.ok) return { ok: false, issue: `HTTP ${response.status}` };
  const contentType = response.headers.get('content-type') || '';
  const contentLength = Number(response.headers.get('content-length') || 0);
  if (!/^image\//i.test(contentType)) return { ok: false, issue: `non-image content-type: ${contentType || 'unknown'}` };
  const buffer = Buffer.from(await response.arrayBuffer());
  const bytes = buffer.length || contentLength;
  const dimensions = parseDimensions(buffer, contentType);
  const issues = [];
  if (bytes < minBytes && !/svg/i.test(contentType)) issues.push('small-file');
  if (bytes > maxBytes) issues.push('large-file');
  if (dimensions && (dimensions.width < minDimension || dimensions.height < minDimension)) issues.push('low-resolution');
  if (dimensions) {
    const ratio = dimensions.width / dimensions.height;
    if (ratio < 0.55 || ratio > 1.25) issues.push('poor-crop-ratio');
  }
  return { ok: issues.length === 0, contentType, bytes, dimensions, issues };
}

async function resolveOne(product) {
  const payload = { name: product.title || product.name || product.handle, sku: product.variant_sku || product.sku };
  try {
    const result = await json(`${origin}/api/thumbnails/resolve`, { method: 'POST', body: JSON.stringify(payload), headers: { 'content-type': 'application/json' } });
    const classification = classify(product, result);
    const imageUrl = result?.success ? new URL(result.url, origin).href : null;
    const visual = imageUrl ? await inspectImage(imageUrl).catch((error) => ({ ok: false, issue: error.message })) : { ok: false, issue: 'no-image-url' };
    return {
      handle: product.handle,
      sku: product.variant_sku,
      title: product.title,
      classification,
      source: result?.source || null,
      confidence: result?.confidence ?? null,
      url: result?.url || null,
      cached: Boolean(result?.cached),
      visual,
      publishReady: classification !== 'fallback' && visual.ok && !['category'].includes(classification),
      reviewRequired: classification === 'category' || classification === 'fallback' || !visual.ok,
    };
  } catch (error) {
    return { handle: product.handle, sku: product.variant_sku, title: product.title, classification: 'fallback', source: null, confidence: null, url: null, cached: false, visual: { ok: false, issue: error.message }, publishReady: false, reviewRequired: true };
  }
}

async function mapLimit(items, worker, size) {
  const results = new Array(items.length);
  let cursor = 0;
  async function runner() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
      process.stdout.write(`\rAuditing ${index + 1}/${items.length}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, runner));
  process.stdout.write('\n');
  return results;
}

(async () => {
  const payload = await json(`${origin}/api/products?limit=${limit}`);
  const products = Array.isArray(payload) ? payload : (payload?.data || payload?.products || []);
  if (!products.length) throw new Error('Production API returned no products. Audit aborted.');

  const rows = await mapLimit(products.slice(0, limit), resolveOne, concurrency);
  const counts = rows.reduce((acc, row) => { acc[row.classification] = (acc[row.classification] || 0) + 1; return acc; }, {});
  const visualFailures = rows.filter((row) => !row.visual?.ok).length;
  const publishReady = rows.filter((row) => row.publishReady).length;
  const report = {
    generatedAt: new Date().toISOString(),
    origin,
    requested: limit,
    received: products.length,
    audited: rows.length,
    counts,
    visualFailures,
    publishReady,
    finalPublish: rows.length === 233 && publishReady === 233 && counts.fallback === 0 && counts.category === 0 && visualFailures === 0,
    standard: { exact: 'verified product-level match', brand: 'brand-level match', category: 'category-only match; manual review', fallback: 'no acceptable external image; local fallback' },
    rows,
  };

  require('fs').writeFileSync(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ generatedAt: report.generatedAt, audited: report.audited, counts: report.counts, visualFailures, publishReady, finalPublish, output }, null, 2));
})().catch((error) => {
  console.error(`Thumbnail audit failed: ${error.message}`);
  process.exitCode = 1;
});
