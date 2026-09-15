import { useAuthMonitor } from '../../hooks/useAuthMonitor'
import { useFormTracker } from '../../hooks/useFormTracker'
import { useOnlineGuests } from '../../hooks/useOnlineGuests'
import CourierPartners from '../homepage/CourierPartners'

export default function ActivityMonitoringRuntime() {
  useAuthMonitor()
  useFormTracker()
  useOnlineGuests()
  return <CourierPartners />
}
