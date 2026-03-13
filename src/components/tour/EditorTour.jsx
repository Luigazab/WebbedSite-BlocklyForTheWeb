import { useEffect } from 'react'
import { HelpCircle } from 'lucide-react'
import TourSpotlight from './TourSpotlight'
import { useTour } from './TourProvider'

// ─────────────────────────────────────────────
// Tour step definitions
// Each `target` is a CSS selector that must exist
// in the DOM when that step is shown.
// ─────────────────────────────────────────────
export const EDITOR_TOUR_ID = 'editor'

const EDITOR_STEPS = [
  {
    target: '[data-tour="editor-header"]',
    title: 'Welcome to the Editor!',
    content:
      "This is your creative workspace! You build websites by snapping blocks together — no typing code required. Let me show you around.",
  },
  {
    target: '[data-tour="file-tabs"]',
    title: 'Your Project Files',
    content:
      "Each tab is a file in your project — HTML, CSS, or JavaScript. Click a tab to switch files, or hit the + button to create a new one. The active file is what you're currently editing in the canvas.",
  },
  {
    target: '.blocklyDiv',
    title: 'The Block Canvas',
    content:
      "This is where the magic happens! Drag blocks from the toolbox on the left and snap them together to build your website. Each block generates real HTML, CSS, or JavaScript code automatically.",
  },
  {
    target: '[data-tour="toolbox"]',
    title: 'The Toolbox',
    content:
      "Click any category here to browse blocks. You'll find blocks for layout, text, images, buttons, styles, and much more. Just drag one onto the canvas to start using it!",
  },
  {
    target: '[data-tour="run-btn"]',
    title: 'Run Your Code',
    content:
      "Hit this button to instantly see your website come to life in the preview panel. Your blocks get converted to real HTML and displayed right away — no waiting!",
  },
  {
    target: '[data-tour="preview-tabs"]',
    title: 'Preview Panel',
    content:
      "The Output tab shows your live website preview. Switch to Code to see the actual HTML your blocks generated. If you have multiple HTML pages, the Pages tab lets you jump between them.",
  },
  {
    target: '[data-tour="device-selector"]',
    title: 'Device Preview',
    content:
      "Test how your site looks on different screens! Switch between Desktop, Tablet, and Mobile views. This opens a popup showing your site at that exact screen size.",
  },
  {
    target: '[data-tour="save-btn"]',
    title: 'Saving Your Work',
    content:
      "Click Save to keep your project. You can save it to your account to access it anywhere, export it as an HTML file, or save the block layout as a JSON file to share or back up.",
  },
  {
    target: '[data-tour="file-actions"]',
    title: 'New & Load Projects',
    content:
      "Use New to start a fresh project, or Load to open one you saved earlier — either from your account or a JSON file on your device. That's it — you're ready to build! 🎉",
  },
]

// ─────────────────────────────────────────────
// Hook: auto-start the tour for first-time users
// ─────────────────────────────────────────────
export function useAutoStartEditorTour() {
  const { startTour } = useTour()

  useEffect(() => {
    const completed = localStorage.getItem(`tour_${EDITOR_TOUR_ID}_completed`)
    if (!completed) {
      // Small delay so the editor fully mounts before we query DOM elements
      const timer = setTimeout(() => startTour(EDITOR_TOUR_ID), 800)
      return () => clearTimeout(timer)
    }
  }, [])
}

// ─────────────────────────────────────────────
// TourHelpButton — drop this anywhere in your UI
// (e.g. inside EditorHeader's action buttons)
// ─────────────────────────────────────────────
export function TourHelpButton({ className = '' }) {
  const { startTour } = useTour()

  return (
    <button
      onClick={() => startTour(EDITOR_TOUR_ID)}
      title="Take the editor tour"
      className={`btn flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blockly-purple/10 text-blockly-purple hover:bg-blockly-purple hover:text-white transition-all font-semibold text-sm ${className}`}
    >
      <HelpCircle size={16} />
      <span>Tour</span>
    </button>
  )
}

// ─────────────────────────────────────────────
// EditorTour — render this once inside BlockEditor
// It only shows when activeTour === EDITOR_TOUR_ID
// ─────────────────────────────────────────────
export default function EditorTour() {
  const { activeTour } = useTour()

  if (activeTour !== EDITOR_TOUR_ID) return null

  return <TourSpotlight steps={EDITOR_STEPS} />
}