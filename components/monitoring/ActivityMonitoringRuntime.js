import { useEffect } from 'react'
import { useAuthMonitor } from '../../hooks/useAuthMonitor'
import { useFormTracker } from '../../hooks/useFormTracker'
import { useOnlineGuests } from '../../hooks/useOnlineGuests'
import CourierPartners from '../homepage/CourierPartners'
import HeroInstantSearch from '../homepage/HeroInstantSearch'

export default function ActivityMonitoringRuntime() {
  useAuthMonitor()
  useFormTracker()
  useOnlineGuests()

  useEffect(() => {
    const pruneHomepageShowcases = () => {
      if (!document.querySelector('.r2-hp-final')) return
      document.querySelectorAll('.r2-hp-final > .r2-hp-final-section').forEach((section) => {
        if (section.querySelector('.r2-hp-final-categories, .r2-hp-final-products')) {
          section.setAttribute('data-r2-home-pruned', 'true')
          section.style.setProperty('display', 'none', 'important')
          section.setAttribute('aria-hidden', 'true')
        }
      })
    }

    pruneHomepageShowcases()
    const observer = new MutationObserver(pruneHomepageShowcases)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return <>
    <CourierPartners />
    <HeroInstantSearch />
  </>
}

// Production redeploy marker: preserve homepage visual-pruning logic without changing runtime behavior.
