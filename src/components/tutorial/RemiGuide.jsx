import { useEffect, useState } from 'react'

export default function RemiGuide({
  instruction, hint, stepLabel,
  onNext, onPrev, isFirst, isLast,
  minimized, onToggleMinimize,
}) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    if (!instruction) return
    let i = 0
    const id = setInterval(() => {
      i += 2
      setDisplayed(instruction.slice(0, i))
      if (i >= instruction.length) clearInterval(id)
    }, 18)
    return () => clearInterval(id)
  }, [instruction])

  if (minimized) {
    return (
      <button onClick={onToggleMinimize} className="fixed bottom-4 right-4 z-9000 w-16 h-16" title="Show Remi">
        <img src="/remi.png" alt="Remi" className="w-full h-full object-contain drop-shadow-lg animate-bounce-slow" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-9000 flex items-end gap-3 max-w-md">
      <img src="/rim_white.png" alt="Remi" className="w-24 h-24 object-contain drop-shadow-lg shrink-0 animate-float" />
      <div className="relative bg-white rounded-2xl shadow-2xl border-4 border-blockly-purple p-4 flex-1">
        <div className="absolute -bottom-3 left-8 w-5 h-5 bg-white border-r-4 border-b-4 border-blockly-purple rotate-45" />
        {stepLabel && <p className="text-[10px] font-black text-blockly-purple uppercase tracking-wider mb-1">{stepLabel}</p>}
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-10">{displayed}</p>
        {hint && displayed.length >= (instruction?.length ?? 0) && (
          <p className="mt-2 text-xs text-amber-600">💡 {hint}</p>
        )}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          <button onClick={onToggleMinimize} className="text-[11px] text-gray-400 hover:text-gray-600">Hide</button>
          <div className="flex gap-2">
            {onPrev && <button onClick={onPrev} disabled={isFirst} className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 disabled:opacity-30">Back</button>}
            {onNext && <button onClick={onNext} disabled={isLast} className="text-xs font-semibold px-2 py-1 rounded bg-blockly-purple text-white disabled:opacity-30">Next</button>}
          </div>
        </div>
      </div>
    </div>
  )
}