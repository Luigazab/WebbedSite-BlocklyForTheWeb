import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import CompleteSuccessModal from '../src/components/app/CompleteSuccessModal'
import '../src/index.css'

function Preview() {
  const [mode, setMode] = useState('lesson')
  const [open, setOpen] = useState(true)
  const badge = { name: 'Web explorer', description: 'You completed every lesson in this topic.', image_url: '/icon.png' }
  return <main className="flex min-h-dvh items-center justify-center gap-4">
    <button onClick={() => { setMode('lesson'); setOpen(true) }}>Preview lesson</button>
    <button onClick={() => { setMode('badge'); setOpen(true) }}>Preview badge</button>
    <CompleteSuccessModal key={mode} isOpen={open} earnedXp={60} badge={mode === 'badge' ? badge : null} onExit={() => setOpen(false)} onContinue={() => { setOpen(false); setTimeout(() => { setMode('badge'); setOpen(true) }, 250) }} />
  </main>
}
createRoot(document.getElementById('root')).render(<Preview />)
