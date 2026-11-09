import { useState } from 'react'
import { ArrowRight, Check, LoaderCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const variants = [
  'default', 'locked', 'primary', 'primaryOutline', 'secondary',
  'secondaryOutline', 'success', 'danger', 'dangerOutline', 'super', 'superOutline',
  'ghost', 'sidebar', 'sidebarOutline', 'formalPlain', 'formalPrimary',
]
const sizes = ['xs', 'sm', 'default', 'lg', 'icon-xs', 'icon-sm', 'icon', 'icon-lg']

export default function ButtonGallery() {
  const [size, setSize] = useState('default')
  const [lastClicked, setLastClicked] = useState('No button clicked yet.')
  const isIcon = size.startsWith('icon')

  return (
    <main className="min-h-screen bg-muted px-4 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-600">WebbedSite / UI workshop / Dev only</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Button gallery</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Every variant of your shared shadcn-style Button, lined up for comparison.
            Hover, press, or use Tab to inspect focus. Changes to the shared component appear here automatically.
          </p>
        </header>

        <section aria-labelledby="variants-heading" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5">
            <div>
              <h2 id="variants-heading" className="text-lg font-bold">All {variants.length} variants</h2>
              <p className="mt-1 text-sm text-muted-foreground">Same component. Same label. Different treatments.</p>
            </div>
            <label className="flex items-center gap-3 text-sm font-semibold">
              Preview size
              <select value={size} onChange={(event) => setSize(event.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 focus-visible:outline-2 focus-visible:outline-sky-500">
                {sizes.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  {['Variant', 'Enabled', 'With icon', 'Disabled', 'Loading'].map((label) => <th key={label} scope="col" className="px-5 py-4 font-semibold">{label}</th>)}
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr key={variant} className="border-t border-border">
                    <th scope="row" className="px-5 py-6 font-normal"><code className="text-xs text-foreground">{variant}</code></th>
                    <td className="px-5 py-6"><Button variant={variant} size={size} aria-label={isIcon ? `${variant} example` : undefined} onClick={() => setLastClicked(`${variant} / ${size} clicked`)}>{isIcon ? <Plus className="size-4" /> : 'Continue'}</Button></td>
                    <td className="px-5 py-6"><Button variant={variant} size={size} aria-label={isIcon ? `${variant} arrow example` : undefined} onClick={() => setLastClicked(`${variant} / ${size} with icon clicked`)}>{!isIcon && 'Continue'}<ArrowRight data-icon="inline-end" className="size-4" /></Button></td>
                    <td className="px-5 py-6"><Button variant={variant} size={size} disabled aria-label={isIcon ? `${variant} disabled example` : undefined}>{isIcon ? <Plus className="size-4" /> : 'Continue'}</Button></td>
                    <td className="px-5 py-6"><Button variant={variant} size={size} disabled aria-busy="true" aria-label={isIcon ? `${variant} loading example` : undefined}><LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />{!isIcon && 'Saving'}</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="sizes-heading" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 id="sizes-heading" className="text-lg font-bold">All {sizes.length} sizes</h2>
          <p className="mt-1 text-sm text-muted-foreground">Primary variant, at its natural dimensions.</p>
          <div className="mt-6 flex flex-wrap items-end gap-8">
            {sizes.map((value) => (
              <div key={value} className="flex min-h-20 flex-col items-start justify-between gap-4">
                <Button variant="primary" size={value} aria-label={value.startsWith('icon') ? `${value} example` : undefined} onClick={() => setLastClicked(`primary / ${value} clicked`)}>{value.startsWith('icon') ? <Plus className="size-4" /> : 'Continue'}</Button>
                <code className="text-xs text-muted-foreground">{value}</code>
              </div>
            ))}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p role="status" className="flex items-center gap-2"><Check className="size-4 text-sky-600" />{lastClicked}</p>
          <p>Source: <code>src/components/ui/button.jsx</code></p>
        </footer>
      </div>
    </main>
  )
}
