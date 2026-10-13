import { useEffect } from 'react'
import Router from './router'
import Toast from './components/ui/Toast'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/authStore'
import { TourProvider } from './components/tour/TourProvider'

export default function App() {
  const startAuth = useAuthStore((state) => state.start)

  useEffect(() => {
    return startAuth()
  }, [startAuth])

  return (
    <TourProvider>
      <Router />
      <Toaster richColors position='bottom-right'/>
    </TourProvider>
  )
}
