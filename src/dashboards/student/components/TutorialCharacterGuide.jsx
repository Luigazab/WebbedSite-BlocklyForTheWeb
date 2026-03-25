import { useState } from 'react'
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
}) {
  const [showHint, setShowHint]     = useState(false)
  const [minimized, setMinimized]   = useState(false)

  const step    = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast  = currentStep === steps.length - 1

  if (!step || steps.length === 0) return null

  const handleNext = () => {
    setShowHint(false)
    isLast ? onFinish?.() : onNext?.()
  }

  const handlePrev = () => {
    setShowHint(false)
    onPrev?.()
  }

  return (
    <div className="fixed bottom-4 right-4 z-9000 flex flex-col items-end select-none">
      {/* ── Speech bubble ─────────────────────────────────────────── */}
      {!minimized && (
        <div
          className="relative bg-white rounded-2xl shadow-2xl border-4 border-blockly-purple p-5 w-80 mb-1 mr-3"
          style={{ animation: 'tutorialFadeIn 0.25s ease-out' }}
        >
          {/* Tail pointing toward character (bottom-right) */}
          <div className="absolute -bottom-3.5 right-10 w-6 h-6 bg-white border-r-4 border-b-4 border-blockly-purple rotate-45" />

          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black text-blockly-purple uppercase tracking-wider">
                Step {currentStep + 1} of {steps.length}
              </p>
              {tutorialTitle && (
                <p className="text-xs text-gray-400 truncate">{tutorialTitle}</p>
              )}
            </div>
            <button
              onClick={() => setMinimized(true)}
              className="shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          {/* Instruction */}
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {step.instruction_text}
          </p>

          {/* Hint toggle */}
          {step.hint && (
            <div className="mt-3">
              <button
                onClick={() => setShowHint(h => !h)}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                {showHint ? 'Hide hint' : 'Need a hint?'}
              </button>
              {showHint && (
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 leading-relaxed">
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
                className={`rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'w-4 h-1.5 bg-blockly-purple'
                    : i < currentStep
                      ? 'w-1.5 h-1.5 bg-blockly-purple/40'
                      : 'w-1.5 h-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Navigation row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-500 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-1.5 bg-blockly-purple text-white text-xs font-semibold rounded-xl hover:bg-blockly-purple/90 transition-colors shadow-md shadow-blockly-purple/20"
            >
              {isLast ? (
                <><Check className="w-3.5 h-3.5 mr-0.5" />Done!</>
              ) : (
                <>Next <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Character ─────────────────────────────────────────────── */}
      <div
        className={`relative ${minimized ? 'cursor-pointer' : ''}`}
        onClick={() => minimized && setMinimized(false)}
        title={minimized ? 'Click to show tutorial guide' : undefined}
      >
        {/* Badge showing step number when minimized */}
        {minimized && (
          <div className="absolute -top-2 -left-1 z-10 w-6 h-6 bg-blockly-purple rounded-full flex items-center justify-center shadow-md">
            <MessageCircle className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Minimized step pill */}
        {minimized && (
          <div className="absolute -top-8 right-0 bg-blockly-purple text-white text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
            Step {currentStep + 1}/{steps.length}
          </div>
        )}

        <img
          src="/rim_white.png"
          alt="Tutorial guide"
          className="w-50 h-50 object-contain drop-shadow-lg"
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
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  )
}