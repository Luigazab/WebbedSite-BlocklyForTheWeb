import { useEffect } from 'react'
import Router from './router'
import Toast from './components/ui/Toast'
import { useAuthStore } from './store/authStore'
import { TourProvider } from './components/tour/TourProvider'

export default function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [])

  return (
    <TourProvider>
      <Router />
      <Toast />
    </TourProvider>
  )
}