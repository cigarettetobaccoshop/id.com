import { useEffect } from 'react'

/**
 * Initialize Google Analytics
 * @param {string} measurementId - GA measurement ID
 */
export function initializeAnalytics(measurementId) {
  if (typeof window === 'undefined') return

  // Load Google Analytics script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag = gtag
  gtag('js', new Date())
  gtag('config', measurementId, {
    page_path: window.location.pathname,
  })
}

/**
 * Track page view
 * @param {string} path - Page path
 * @param {string} title - Page title
 */
export function trackPageView(path, title) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path,
      page_title: title,
    })
  }
}

/**
 * Track custom event
 * @param {string} eventName - Event name
 * @param {Object} eventData - Event data
 */
export function trackEvent(eventName, eventData = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventData)
  }
}

/**
 * Track user action
 * @param {string} action - Action name
 * @param {string} category - Category
 * @param {string} label - Label
 * @param {number} value - Value (optional)
 */
export function trackUserAction(action, category, label, value) {
  trackEvent(action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

/**
 * React hook for tracking page views
 * @param {string} pageName - Page name for analytics
 */
export function usePageTracking(pageName) {
  useEffect(() => {
    trackPageView(window.location.pathname, pageName)
  }, [pageName])
}

/**
 * React hook for tracking user actions
 * @param {string} action - Action to track
 * @param {string} category - Category
 * @param {string} label - Label (optional)
 * @returns {Function} Function to call when action occurs
 */
export function useTrackAction(action, category, label = '') {
  return () => {
    trackUserAction(action, category, label)
  }
}

/**
 * Track performance metrics
 */
export function trackPerformanceMetrics() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    const metrics = performance.getEntriesByType('navigation')[0]
    
    if (metrics) {
      trackEvent('page_performance', {
        dns_time: metrics.domainLookupEnd - metrics.domainLookupStart,
        tcp_time: metrics.connectEnd - metrics.connectStart,
        ttfb: metrics.responseStart - metrics.requestStart,
        load_time: metrics.loadEventEnd - metrics.loadEventStart,
        total_time: metrics.loadEventEnd - metrics.fetchStart,
      })
    }
  })
}

/**
 * Track Core Web Vitals
 */
export function trackWebVitals() {
  if (typeof window === 'undefined') return

  // Largest Contentful Paint
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    trackEvent('lcp', {
      value: Math.round(lastEntry.renderTime || lastEntry.loadTime),
    })
  })
  observer.observe({ entryTypes: ['largest-contentful-paint'] })

  // Cumulative Layout Shift
  let clsValue = 0
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value
        trackEvent('cls', { value: clsValue })
      }
    }
  })
  clsObserver.observe({ entryTypes: ['layout-shift'] })

  // First Input Delay
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      trackEvent('fid', {
        value: Math.round(entry.processingEnd - entry.startTime),
      })
    })
  })
  fidObserver.observe({ entryTypes: ['first-input'] })
}
