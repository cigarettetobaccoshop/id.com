/**
 * Performance optimization utilities
 */

/**
 * Cache API responses
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function that fetches data
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>}
 */
export async function cachedFetch(key, fetchFn, ttl = 3600) {
  // Check if data exists in localStorage and is still valid
  const cached = localStorage.getItem(key)
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < ttl * 1000) {
      return data
    }
  }

  // Fetch new data
  const data = await fetchFn()

  // Cache the data
  localStorage.setItem(
    key,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    })
  )

  return data
}

/**
 * Debounce function calls
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay = 500) {
  let timeoutId

  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * Throttle function calls
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function}
 */
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

/**
 * Lazy load images
 * @param {HTMLElement} element - Image element
 * @param {string} dataSrc - Data source attribute
 */
export function lazyLoadImage(element, dataSrc = 'data-src') {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.getAttribute(dataSrc)
          img.removeAttribute(dataSrc)
          imageObserver.unobserve(img)
        }
      })
    })

    const images = document.querySelectorAll(`img[${dataSrc}]`)
    images.forEach((img) => imageObserver.observe(img))
  }
}

/**
 * Prefetch resources
 * @param {string} url - URL to prefetch
 */
export function prefetchResource(url) {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = url
  document.head.appendChild(link)
}

/**
 * Preload resources
 * @param {string} url - URL to preload
 * @param {string} as - Resource type (script, style, font, etc)
 */
export function preloadResource(url, as = 'script') {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = url
  document.head.appendChild(link)
}

/**
 * Code splitting helper
 * @param {Function} importFn - Dynamic import function
 * @returns {Promise<any>}
 */
export async function loadModule(importFn) {
  try {
    return await importFn()
  } catch (err) {
    console.error('Module loading failed:', err)
    throw err
  }
}

/**
 * Measure function execution time
 * @param {string} label - Label for measurement
 * @param {Function} fn - Function to measure
 * @returns {any}
 */
export function measurePerformance(label, fn) {
  const start = performance.now()
  const result = fn()
  const end = performance.now()

  console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`)

  return result
}

/**
 * Get memory usage (if available)
 * @returns {Object|null}
 */
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

/**
 * Optimize bundle size - Dynamic import
 * @param {string} modulePath - Module path
 * @returns {Promise<any>}
 */
export function dynamicImport(modulePath) {
  return import(modulePath)
}

/**
 * Request idle callback fallback
 * @param {Function} callback - Callback function
 */
export function scheduleIdleTask(callback) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback)
  } else {
    setTimeout(callback, 1)
  }
}

/**
 * Optimize API calls with batch processing
 * @param {Array} items - Items to process
 * @param {Function} batchFn - Batch processing function
 * @param {number} batchSize - Size of each batch
 * @returns {Promise<Array>}
 */
export async function batchProcess(items, batchFn, batchSize = 10) {
  const results = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await batchFn(batch)
    results.push(...batchResults)
  }

  return results
}
