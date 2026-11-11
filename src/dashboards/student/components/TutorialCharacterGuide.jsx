import { useEffect, useRef, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Lightbulb,
  Minimize2, MessageCircle, Check,
} from 'lucide-react'

export default function TutorialCharacterGuide({
  steps = [],
  currentStep = 0,
  tutorialTitle = '',
  onNext,
  onPrev,
  onFinish,
  targetElement = null,
  feedback = null,
  busy = false,
}) {
  const [showHint, setShowHint]     = useState(false)
  const [minimized, setMinimized]   = useState(false)
  const guideRef = useRef(null)
  const characterRef = useRef(null)
  const bubbleRef = useRef(null)
  const dragOffset = useRef(null)
  const dragged = useRef(false)
  const userMovedGuide = useRef(false)

  const step    = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast  = currentStep === steps.length - 1
  const [guidePosition, setGuidePosition] = useState(null)
  const [measuredBubbleHeight, setMeasuredBubbleHeight] = useState(0)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => {
      setIsMobile(media.matches)
      if (media.matches) setMinimized(true)
    }
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    userMovedGuide.current = false
    if (!targetElement) {
      setGuidePosition(null)
      return
    }
    const updatePosition = () => {
      if (userMovedGuide.current) return
      if (!targetElement.isConnected) return
      const rect = targetElement.getBoundingClientRect()
      if (!rect.width && !rect.height) {
        setGuidePosition(null)
        return
      }
      const rightSpace = window.innerWidth - rect.right - 16
      const leftSpace = rect.left - 16
      if (window.matchMedia('(max-width: 767px)').matches) {
        const left = Math.max(8, Math.min(window.innerWidth - 104, rect.left + rect.width / 2 - 48))
        const top = Math.max(8, Math.min(window.innerHeight - 104, rect.top - 96))
        setGuidePosition({ left, top })
        return
      }
      const width = Math.min(window.innerWidth - 16, Math.max(240, Math.min(320, Math.max(rightSpace, leftSpace))))
      const height = Math.min(440, window.innerHeight - 16)
      let left = rightSpace >= width ? rect.right + 8 : rect.left - width - 8
      if (left < 8 || left + width > window.innerWidth - 8) {
        left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.left))
      }
      const top = Math.max(8, Math.min(window.innerHeight - height - 8, rect.top - 12))
      setGuidePosition({ left, top })
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updatePosition)
    observer?.observe(targetElement)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      observer?.disconnect()
    }
  }, [targetElement])

  useEffect(() => {
    if (minimized || isMobile || !bubbleRef.current) return
    const bubble = bubbleRef.current
    const measure = () => setMeasuredBubbleHeight(bubble.getBoundingClientRect().height)
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(bubble)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [minimized, isMobile, step, showHint, tutorialTitle])

  const handleDragStart = (event) => {
    event.preventDefault()
    const rect = characterRef.current?.getBoundingClientRect()
    if (!rect) return
    if (isMobile && !minimized) setMinimized(true)
    userMovedGuide.current = true
    dragOffset.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    setGuidePosition({ left: rect.left, top: rect.top })
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleDragMove = (event) => {
    if (!dragOffset.current || !characterRef.current) return
    const rect = characterRef.current.getBoundingClientRect()
    const left = Math.max(8, Math.min(window.innerWidth - rect.width - 8, event.clientX - dragOffset.current.x))
    const top = Math.max(8, Math.min(window.innerHeight - rect.height - 8, event.clientY - dragOffset.current.y))
    dragged.current = true
    setGuidePosition({ left, top })
  }

  const handleDragEnd = (event) => {
    dragOffset.current = null
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleMoveKeyDown = (event) => {
    const offsets = { ArrowUp: [0, -16], ArrowDown: [0, 16], ArrowLeft: [-16, 0], ArrowRight: [16, 0] }
    const offset = offsets[event.key]
    if (!offset || !characterRef.current) return
    event.preventDefault()
    userMovedGuide.current = true
    const rect = characterRef.current.getBoundingClientRect()
    const left = Math.max(8, Math.min(window.innerWidth - rect.width - 8, rect.left + offset[0]))
    const top = Math.max(8, Math.min(window.innerHeight - rect.height - 8, rect.top + offset[1]))
    setGuidePosition({ left, top })
  }

  if (!step || steps.length === 0) return null

  const handleNext = () => {
    setShowHint(false)
    isLast ? onFinish?.() : onNext?.()
  }

  const handlePrev = () => {
    setShowHint(false)
    onPrev?.()
  }

  // Determine if bubble should be placed on the left side of the character
  const isBubbleOnLeft =
    ((guidePosition?.left ?? (typeof window !== 'undefined' ? window.innerWidth - 216 : 0)) + 200 + 16 + 240) >
    (typeof window !== 'undefined' ? window.innerWidth : 0)
  const bubbleHeight = typeof window !== 'undefined'
    ? Math.min(measuredBubbleHeight || 240, 448, window.innerHeight - 16)
    : 240
  const characterTop = guidePosition?.top ?? window.innerHeight - 216
  const absoluteBubbleTop = Math.max(8, Math.min(window.innerHeight - bubbleHeight - 8, characterTop + 100 - bubbleHeight / 2))
  const bubbleTop = absoluteBubbleTop - characterTop
  const tailTop = Math.max(16, Math.min(bubbleHeight - 16, characterTop + 100 - absoluteBubbleTop))

  return (
    <div
      ref={guideRef}
      className={`fixed z-9000 select-none ${guidePosition ? '' : 'bottom-4 right-4'}`}
      style={guidePosition ?? undefined}
    >
      {/* ── Speech bubble ─────────────────────────────────────────── */}
      {!minimized && (
        <div
          ref={bubbleRef}
          className={`bg-card rounded-2xl shadow-2xl border border-primary flex flex-col ${isMobile ? 'fixed left-3 right-3 top-1/2 -translate-y-[60%] z-[10000] w-auto max-h-[calc(100dvh-12rem)]' : 'absolute w-[min(28rem,calc(100vw-2rem))] max-h-[min(28rem,calc(100vh-1rem))]'}`}
          style={{
            animation: 'tutorialFadeIn 0.25s ease-out',
            pointerEvents: 'auto',
            ...(isMobile ? {} : {
              top: bubbleTop,
              ...(isBubbleOnLeft ? { right: 'calc(100% + 1rem)' } : { left: 'calc(100% + 1rem)' }),
            }),
          }}
        >
          {/* ── Tail (outside scroll container so it won't be clipped) ── */}
          <div
            className={`absolute w-5 h-5 bg-card rotate-45 z-10 border-primary ${
              isMobile
                ? '-bottom-2 right-8 border-r border-b'
                : isBubbleOnLeft
                  ? '-right-2 border-r border-t'
                  : '-left-2 border-l border-b'
            }`}
            style={isMobile ? undefined : { top: tailTop }}
          />

          {/* ── Scrollable Content Area ─────────────────────────────── */}
          <div className="p-5 overflow-y-auto min-h-0 flex-1 flex flex-col">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-primary uppercase tracking-wider">
                  Step {currentStep + 1} of {steps.length}
                </p>
                {tutorialTitle && (
                  <p className="text-xs text-muted-foreground truncate">{tutorialTitle}</p>
                )}
              </div>
              <button
                onClick={() => setMinimized(true)}
                className="pointer-events-auto shrink-0 p-1 rounded-lg hover:bg-muted transition-colors!"
                title="Minimize"
              >
                <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Instruction */}
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {step.instruction_text}
            </p>

            {/* Hint toggle */}
            {feedback && <div role="status" aria-live="polite" className={`mt-3 rounded-xl border p-3 text-xs leading-relaxed ${feedback.kind === 'saving' ? 'border-sky-300 bg-sky-50 text-sky-900 dark:bg-sky-950/50 dark:text-sky-100' : 'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100'}`}>
              <p className="font-bold">{feedback.kind === 'invalid' ? 'Step not ready yet' : feedback.kind === 'saving' ? 'Checking your work' : 'Could not continue'}</p>
              <ul className="mt-1 list-disc space-y-1 pl-4">{feedback.messages.map((message, index) => <li key={index}>{message}</li>)}</ul>
            </div>}

            {/* Hint toggle */}
            {step.hint && (
              <div className="pointer-events-auto mt-3">
                <button
                  onClick={() => setShowHint(h => !h)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-300 hover:text-amber-700 transition-colors!"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  {showHint ? 'Hide hint' : 'Need a hint?'}
                </button>
                {showHint && (
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 rounded-xl px-3 py-2 leading-relaxed">
                    💡 {step.hint}
                  </p>
                )}
              </div>
            )}

            {/* Progress pips */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all! duration-300 ${
                    i === currentStep
                      ? 'w-4 h-1.5 bg-primary'
                      : i < currentStep
                        ? 'w-1.5 h-1.5 bg-primary/40'
                        : 'w-1.5 h-1.5 bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Navigation row */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <button
                onClick={handlePrev}
                disabled={isFirst}
                className="pointer-events-auto flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-muted-foreground rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors!"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={busy}
                className="flex items-center gap-1 px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-colors! shadow-md shadow-primary/20"
                style={{ pointerEvents: 'auto' }}
              >
                {busy ? 'Saving…' : isLast ? (
                  <><Check className="w-3.5 h-3.5 mr-0.5" />Done!</>
                ) : (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Character ─────────────────────────────────────────────── */}
      <div
        ref={characterRef}
        className={`relative w-25 h-25 md:w-50 md:h-50 touch-none cursor-grab active:cursor-grabbing ${isMobile && !minimized ? 'fixed bottom-3 left-1/2 -translate-x-1/2 z-[10001]' : ''}`}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
        onKeyDown={handleMoveKeyDown}
        onClick={() => {
          if (dragged.current) {
            dragged.current = false
            return
          }
          if (isMobile && minimized) {
            setGuidePosition({
              left: Math.max(8, (window.innerWidth - 100) / 2),
              top: Math.max(8, window.innerHeight - 112),
            })
          }
          setMinimized(!minimized)
        }}
        role="button"
        tabIndex={0}
        title={minimized ? 'Click Remi to show the guide' : 'Drag Remi to move. Click Remi to hide or show the guide.'}
      >
        {/* Badge showing step number when minimized */}
        {minimized && (
          <div className="absolute -top-2 -left-1 z-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
            <MessageCircle className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Minimized step pill */}
        {minimized && (
          <div className="absolute -top-8 right-0 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
            {feedback && feedback.kind !== 'saving' ? 'Check this step · Tap Remi' : `Step ${currentStep + 1}/${steps.length}`}
          </div>
        )}

        <img
          src="/rim_white.png"
          alt="Tutorial guide"
          className="pointer-events-none w-25 h-25 md:w-50 md:h-50 object-contain drop-shadow-lg"
          style={{ animation: 'tutorialFloat 2s ease-in-out infinite' }}
        />
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes tutorialFloat {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-12px); }
        }
        @keyframes tutorialFadeIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
