import { useAuthMonitor } from '../../hooks/useAuthMonitor'
import { useFormTracker } from '../../hooks/useFormTracker'
import { useOnlineGuests } from '../../hooks/useOnlineGuests'

export default function ActivityMonitoringRuntime() {
  useAuthMonitor()
  useFormTracker()
  useOnlineGuests()
  return null
}
