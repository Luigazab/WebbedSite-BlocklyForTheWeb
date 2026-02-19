import { useEffect, useRef } from 'react'

export default function Dropdown({ trigger, children, align = 'right' }) {
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        // find the open setter via a custom event
        ref.current.querySelector('[data-dropdown-panel]')?.classList.add('hidden')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      {children}
    </div>
  )
}