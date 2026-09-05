import { useEffect, useState } from 'react'
import {
  initializeAnalytics,
  trackEvent,
  trackUserAction,
  trackWebVitals,
  usePageTracking,
  useTrackAction,
} from '../lib/analytics'
import {
  debounce,
  throttle,
  measurePerformance,
  getMemoryUsage,
} from '../lib/optimization'

export default function AnalyticsDemo() {
  const [metrics, setMetrics] = useState(null)
  const [message, setMessage] = useState('')
  const [eventLog, setEventLog] = useState([])

  // Track page view
  usePageTracking('analytics_demo_page')

  useEffect(() => {
    // Initialize analytics
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      initializeAnalytics(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
      setMessage('✅ Google Analytics initialized')
    } else {
      setMessage('⚠️ GA_MEASUREMENT_ID not configured')
    }

    // Track Web Vitals
    trackWebVitals()

    // Get initial metrics
    updateMetrics()
  }, [])

  function updateMetrics() {
    const memory = getMemoryUsage()
    setMetrics({
      timestamp: new Date().toLocaleTimeString(),
      memory: memory,
      navigation: performance.getEntriesByType('navigation')[0],
    })
  }

  function addEventLog(event) {
    setEventLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        event,
      },
      ...prev.slice(0, 9),
    ])
  }

  // Track button click
  const handleButtonClick = useTrackAction('demo_button_click', 'engagement', 'main_button')

  // Debounced search
  const handleSearch = debounce((query) => {
    trackUserAction('search', 'engagement', query)
    addEventLog(`🔍 Search: "${query}"`)
  }, 500)

  // Throttled scroll
  useEffect(() => {
    const handleScroll = throttle(() => {
      trackEvent('scroll_event')
    }, 1000)

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleCustomEvent() {
    trackEvent('custom_event', {
      timestamp: new Date().toISOString(),
      page: 'analytics_demo',
    })
    addEventLog('📊 Custom event tracked')
    setMessage('✅ Custom event sent to Google Analytics')
  }

  function handlePerformanceTest() {
    const result = measurePerformance('test_function', () => {
      // Simulate heavy computation
      let sum = 0
      for (let i = 0; i < 1000000; i++) {
        sum += i
      }
      return sum
    })

    trackEvent('performance_test', {
      result: result,
    })
    addEventLog('⏱️ Performance test completed')
    setMessage('✅ Performance metrics tracked')
  }

  function handleMemoryCheck() {
    updateMetrics()
    addEventLog('💾 Memory check performed')
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    trackUserAction('form_submit', 'conversion', 'analytics_demo_form')
    addEventLog('📝 Form submitted')
    setMessage('✅ Form submission tracked')
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1>📊 Analytics & Performance Demo</h1>

      {message && (
        <p
          style={{
            color: '#666',
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
          }}
        >
          {message}
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        {/* Metrics Panel */}
        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        >
          <h2>📈 Performance Metrics</h2>
          {metrics ? (
            <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
              <p>
                <strong>Time:</strong> {metrics.timestamp}
              </p>
              {metrics.memory && (
                <>
                  <p>
                    <strong>Used JS Heap:</strong> {metrics.memory.usedJSHeapSize} MB
                  </p>
                  <p>
                    <strong>Total JS Heap:</strong> {metrics.memory.totalJSHeapSize} MB
                  </p>
                  <p>
                    <strong>Heap Limit:</strong> {metrics.memory.jsHeapSizeLimit} MB
                  </p>
                </>
              )}
              {metrics.navigation && (
                <>
                  <p>
                    <strong>DOM Content Loaded:</strong>{' '}
                    {(
                      metrics.navigation.domContentLoadedEventEnd -
                      metrics.navigation.domContentLoadedEventStart
                    ).toFixed(2)}{' '}
                    ms
                  </p>
                  <p>
                    <strong>Load Time:</strong>{' '}
                    {(
                      metrics.navigation.loadEventEnd - metrics.navigation.loadEventStart
                    ).toFixed(2)}{' '}
                    ms
                  </p>
                  <p>
                    <strong>Total Duration:</strong>{' '}
                    {(
                      metrics.navigation.loadEventEnd - metrics.navigation.fetchStart
                    ).toFixed(2)}{' '}
                    ms
                  </p>
                </>
              )}
            </div>
          ) : (
            <p>Loading metrics...</p>
          )}
          <button
            onClick={handleMemoryCheck}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '10px',
              backgroundColor: '#3ECF8E',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Refresh Metrics
          </button>
        </div>

        {/* Event Log */}
        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        >
          <h2>📝 Event Log</h2>
          <div
            style={{
              height: '200px',
              overflowY: 'auto',
              fontSize: '12px',
              fontFamily: 'monospace',
              backgroundColor: '#fff',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #eee',
            }}
          >
            {eventLog.length === 0 ? (
              <p style={{ color: '#999' }}>No events yet...</p>
            ) : (
              eventLog.map((log) => (
                <div
                  key={log.id}
                  style={{
                    marginBottom: '8px',
                    color: '#666',
                    borderBottom: '1px solid #eee',
                    paddingBottom: '4px',
                  }}
                >
                  <span style={{ color: '#999' }}>{log.time}</span> - {log.event}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tracking Actions */}
      <div
        style={{
          padding: '15px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          marginBottom: '20px',
        }}
      >
        <h2>🎯 Track Events</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '10px',
          }}
        >
          <button
            onClick={() => {
              handleButtonClick()
              addEventLog('🔘 Button clicked')
              setMessage('✅ Button click tracked')
            }}
            style={{
              padding: '10px',
              backgroundColor: '#4285F4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Button Click
          </button>

          <button
            onClick={handleCustomEvent}
            style={{
              padding: '10px',
              backgroundColor: '#EA4335',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Custom Event
          </button>

          <button
            onClick={handlePerformanceTest}
            style={{
              padding: '10px',
              backgroundColor: '#FBBC04',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Performance Test
          </button>

          <button
            onClick={() => {
              trackEvent('like_event', { item: 'demo' })
              addEventLog('❤️ Like tracked')
              setMessage('✅ Like event tracked')
            }}
            style={{
              padding: '10px',
              backgroundColor: '#34A853',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Like Event
          </button>
        </div>
      </div>

      {/* Search with Debounce */}
      <div
        style={{
          padding: '15px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          marginBottom: '20px',
        }}
      >
        <h2>🔍 Search (Debounced)</h2>
        <input
          type="text"
          placeholder="Type to search (tracked with 500ms debounce)..."
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
          }}
        />
        <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
          💡 Type characters and notice the debounce delay before tracking
        </p>
      </div>

      {/* Form */}
      <div
        style={{
          padding: '15px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
        }}
      >
        <h2>📋 Contact Form</h2>
        <form onSubmit={handleFormSubmit}>
          <input
            type="text"
            placeholder="Name"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          />
          <input
            type="email"
            placeholder="Email"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          />
          <textarea
            placeholder="Message"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              minHeight: '100px',
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3ECF8E',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Submit (Tracked)
          </button>
        </form>
      </div>

      <hr style={{ marginTop: '30px' }} />
      <div style={{ fontSize: '12px', color: '#999' }}>
        <h3>📚 Setup Instructions:</h3>
        <ol>
          <li>Add NEXT_PUBLIC_GA_MEASUREMENT_ID to .env.local</li>
          <li>Configure Google Analytics property</li>
          <li>Initialize tracking in pages/_app.js</li>
          <li>Check Real-time events in GA Dashboard</li>
        </ol>
        <p>See docs/ANALYTICS.md for detailed setup guide</p>
      </div>
    </div>
  )
}
