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

  return <>
    <CourierPartners />
    <HeroInstantSearch />
  </>
}

// Production redeploy marker: preserve homepage visual-pruning logic without changing runtime behavior.
