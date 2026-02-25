import { useEffect, useState, useRef } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { useTour } from './TourProvider'

export default function TourSpotlight({ steps }) {
  const { currentStep, isVisible, nextStep, prevStep, skipTour } = useTour()
  const [highlightRect, setHighlightRect] = useState(null)
  const [bubblePosition, setBubblePosition] = useState({ top: 0, left: 0 })
  const overlayRef = useRef(null)

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  useEffect(() => {
    if (!isVisible || !step) return

    const updateHighlight = () => {
      const element = document.querySelector(step.target)
      if (element) {
        const rect = element.getBoundingClientRect()
        setHighlightRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        })

        // Position bubble near the highlighted element
        const bubbleTop = rect.bottom + 20
        const bubbleLeft = Math.max(20, Math.min(rect.left, window.innerWidth - 420))
        setBubblePosition({ top: bubbleTop, left: bubbleLeft })

        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    updateHighlight()
    window.addEventListener('resize', updateHighlight)
    window.addEventListener('scroll', updateHighlight)

    return () => {
      window.removeEventListener('resize', updateHighlight)
      window.removeEventListener('scroll', updateHighlight)
    }
  }, [step, isVisible, currentStep])

  if (!isVisible || !step) return null

  const handleNext = () => {
    if (isLastStep) {
      skipTour()
    } else {
      nextStep()
    }
  }

  return (
    <div className="fixed inset-0 z-9999">
      {/* Dark overlay with spotlight cutout */}
      <svg
        ref={overlayRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left - 8}
                y={highlightRect.top - 8}
                width={highlightRect.width + 16}
                height={highlightRect.height + 16}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Highlighted element border glow */}
      {highlightRect && (
        <div
          className="absolute border-4 border-blockly-purple rounded-xl pointer-events-none shadow-[0_0_20px_rgba(147,51,234,0.5)] animate-pulse"
          style={{
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            zIndex: 10000,
          }}
        />
      )}

      {/* Character + Speech Bubble */}
      <div
        className="absolute z-10001 flex items-end gap-4 transition-all duration-300"
        style={{
          top: `${bubblePosition.top}px`,
          left: `${bubblePosition.left}px`,
        }}
      >
        {/* Character */}
        <div className="shrink-0 w-50 h-50 animate-bounce-slow">
          <img
            src="/remi.png"
            alt="Tour guide"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>

        {/* Speech Bubble */}
        <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md border-4 border-blockly-purple">
          {/* Bubble tail */}
          <div className="absolute -left-3 bottom-8 w-6 h-6 bg-white border-l-4 border-b-4 border-blockly-purple transform rotate-45" />

          {/* Close button */}
          <button
            onClick={skipTour}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          {/* Content */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-bold text-blockly-purple uppercase tracking-wider mb-1">
                Step {currentStep + 1} of {steps.length}
              </p>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{step.content}</p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={skipTour}
                className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
              >
                Skip Tour
              </button>

              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <button
                    onClick={prevStep}
                    className="btn flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="btn flex items-center gap-1 px-4 py-2 bg-blockly-purple text-white rounded-lg text-sm font-semibold hover:bg-blockly-purple/90 transition-colors"
                >
                  {isLastStep ? 'Finish' : 'Next'}
                  {!isLastStep && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}