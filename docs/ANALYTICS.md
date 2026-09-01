# Analytics & Optimization Guide

## Overview

Analytics membantu Anda memahami perilaku user dan mengoptimalkan performa aplikasi untuk pengalaman terbaik.

## Features

✅ Google Analytics integration
✅ Core Web Vitals tracking
✅ Performance metrics monitoring
✅ User behavior analytics
✅ Caching & optimization strategies

## Setup

### 1. Google Analytics

**Di Google Analytics:**
1. Buka [analytics.google.com](https://analytics.google.com)
2. Create new property
3. Get Measurement ID (format: `G-XXXXXXXXXX`)

**Di Next.js App:**
```bash
# Add to .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Di pages/_app.js:**
```javascript
import { useEffect } from 'react'
import { initializeAnalytics, trackPageView } from '@/lib/analytics'
import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    initializeAnalytics(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
  }, [])

  useEffect(() => {
    const handleRouteChange = (url) => {
      trackPageView(url, document.title)
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => router.events.off('routeChangeComplete', handleRouteChange)
  }, [router.events])

  return <Component {...pageProps} />
}

export default MyApp
```

### 2. Track Events

```javascript
import { trackEvent } from '@/lib/analytics'

// Track button click
<button onClick={() => trackEvent('signup_click')}>
  Sign Up
</button>

// Track form submission
<form onSubmit={() => trackEvent('form_submit', { form_id: 'contact' })}>
  {/* form fields */}
</form>
```

### 3. Core Web Vitals

```javascript
import { trackWebVitals } from '@/lib/analytics'

// In pages/_app.js
useEffect(() => {
  trackWebVitals()
}, [])
```

## Performance Optimization

### 1. Caching

```javascript
import { cachedFetch } from '@/lib/optimization'

// Cache API response for 1 hour
const data = await cachedFetch(
  'todos-cache',
  () => fetch('/api/todos').then(r => r.json()),
  3600
)
```

### 2. Debouncing

```javascript
import { debounce } from '@/lib/optimization'

const handleSearch = debounce((query) => {
  // Perform search
}, 500)

<input onChange={(e) => handleSearch(e.target.value)} />
```

### 3. Throttling

```javascript
import { throttle } from '@/lib/optimization'

const handleScroll = throttle(() => {
  // Handle scroll
}, 300)

window.addEventListener('scroll', handleScroll)
```

### 4. Lazy Loading Images

```javascript
import { lazyLoadImage } from '@/lib/optimization'

useEffect(() => {
  lazyLoadImage(document.querySelector('img'))
}, [])

// In HTML
<img data-src="image.jpg" alt="Lazy loaded image" />
```

### 5. Prefetching

```javascript
import { prefetchResource } from '@/lib/optimization'

// Prefetch next page
prefetchResource('/api/users')
```

## Testing

Development:
```bash
npm run dev
# Open Chrome DevTools > Lighthouse
# Run performance audit
```

Production:
```bash
# Check PageSpeed Insights
# https://pagespeed.web.dev/?url=https://id.com
```

## Metrics to Monitor

### Core Web Vitals
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Custom Metrics
- Page load time
- API response time
- Error rate
- User engagement

## Implementation Examples

### Track Page View
```javascript
import { usePageTracking } from '@/lib/analytics'

export default function HomePage() {
  usePageTracking('home_page')
  
  return <div>Home</div>
}
```

### Track User Action
```javascript
import { useTrackAction } from '@/lib/analytics'

export default function Button() {
  const trackClick = useTrackAction('button_click', 'engagement', 'cta_button')
  
  return <button onClick={trackClick}>Click Me</button>
}
```

### Performance Measurement
```javascript
import { measurePerformance } from '@/lib/optimization'

const result = measurePerformance('fetch_todos', () => {
  return fetch('/api/todos').then(r => r.json())
})
```

## Best Practices

✅ Do's:
- Track meaningful user actions
- Monitor Core Web Vitals regularly
- Cache static data
- Use lazy loading for images
- Optimize bundle size
- Monitor error rates

❌ Don'ts:
- Track excessive events (causes lag)
- Disable Google Analytics
- Ignore Core Web Vitals
- Cache sensitive data
- Load all images upfront
- Bundle large dependencies

## Optimization Checklist

- [ ] Google Analytics configured
- [ ] Core Web Vitals tracking enabled
- [ ] Images lazy loaded
- [ ] API caching implemented
- [ ] Debouncing/throttling added
- [ ] Code splitting configured
- [ ] Performance audit passed
- [ ] PageSpeed score > 90

## Common Issues

### Analytics not tracking
```
Solution:
1. Verify GA Measurement ID is correct
2. Check if analytics.js is loaded
3. Allow tracking in browser privacy settings
```

### Performance degradation
```
Solution:
1. Run Lighthouse audit
2. Check bundle size
3. Monitor API response times
4. Check for memory leaks
```

### Images not lazy loading
```
Solution:
1. Verify IntersectionObserver support
2. Check data-src attribute
3. Monitor network tab
```

## Tools & Resources

- [Google Analytics](https://analytics.google.com)
- [PageSpeed Insights](https://pagespeed.web.dev)
- [Chrome DevTools Lighthouse](https://developer.chrome.com/docs/lighthouse/)
- [Web.dev Performance Guide](https://web.dev/performance/)

## Next Steps
- ✅ Step 2: Real-time Integration
- ✅ Step 3: OAuth Integration
- ✅ Step 4: Storage Setup
- ✅ Step 5: Analytics & Optimization
- 🚀 Deploy to Production
