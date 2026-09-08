/**
 * Performance optimization utilities
 */

export async function cachedFetch(key, fetchFn, ttl = 3600) {
  const cached = localStorage.getItem(key)
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < ttl * 1000) return data
  }
  const data = await fetchFn()
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
  return data
}

export function debounce(fn, delay = 500) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function throttle(fn, limit = 300) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function lazyLoadImage(element, dataSrc = 'data-src') {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.getAttribute(dataSrc)
          img.removeAttribute(dataSrc)
          observer.unobserve(img)
        }
      })
    })
    document.querySelectorAll(`img[${dataSrc}]`).forEach(img => imageObserver.observe(img))
  }
}

export function prefetchResource(url) {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = url
  document.head.appendChild(link)
}

export function preloadResource(url, as = 'script') {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = url
  document.head.appendChild(link)
}

export async function loadModule(importFn) {
  try { return await importFn() }
  catch (err) { console.error('Module loading failed:', err); throw err }
}

export function measurePerformance(label, fn) {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`)
  return result
}

export function getMemoryUsage() {
  if (performance.memory) {
    return {
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2),
    }
  }
  return null
}

export function scheduleIdleTask(callback) {
  if ('requestIdleCallback' in window) window.requestIdleCallback(callback)
  else setTimeout(callback, 1)
}

export async function batchProcess(items, batchFn, batchSize = 10) {
  const results = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batchResults = await batchFn(items.slice(i, i + batchSize))
    results.push(...batchResults)
  }
  return results
}
