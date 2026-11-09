import { useSyncExternalStore } from 'react'
import { createThemeController } from '../lib/theme'

const controller = createThemeController(window)
if (import.meta.hot) import.meta.hot.dispose(() => controller.destroy())

export function useTheme() {
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot)
  return { ...state, setPreference: controller.setPreference }
}
