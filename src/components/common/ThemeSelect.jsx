import { SunMoon } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export default function ThemeSelect({ compact = false, iconOnly = false }) {
  const { preference, setPreference } = useTheme()
  return <label className="relative inline-flex min-w-0 items-center gap-2 text-sm text-foreground">
    <span className={compact || iconOnly ? 'sr-only' : 'text-xs font-medium'}>Appearance</span>
    {iconOnly && <SunMoon aria-hidden="true" className="pointer-events-none absolute left-3 size-5" />}
    <select title="Color theme" aria-label="Color theme" value={preference} onChange={event => setPreference(event.target.value)}
      className={`min-h-11 max-w-full rounded-xl border border-border bg-card px-2 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring ${iconOnly ? "w-11 appearance-none text-transparent" : "text-card-foreground"}`}>
      <option className="text-card-foreground" value="system">System</option>
      <option className="text-card-foreground" value="light">Light</option>
      <option className="text-card-foreground" value="dark">Dark</option>
    </select>
  </label>
}
