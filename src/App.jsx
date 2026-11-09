import { useEffect } from 'react'
import Router from './router'
import Toast from './components/ui/Toast'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/authStore'
import { TourProvider } from './components/tour/TourProvider'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const { resolvedTheme } = useTheme()
  const startAuth = useAuthStore((state) => state.start)

  useEffect(() => {
    return startAuth()
  }, [startAuth])

  return (
    <TourProvider>
      <Router />
      <Toaster theme={resolvedTheme} richColors position='bottom-right'/>
    </TourProvider>
  )
}
