import { useState } from 'react'
import TopBar from './TopBar'
import LessonPanel from './LessonPanel'
import CodeEditor from './CodeEditor'
import PreviewPanel from './PreviewPanel'
import ExerciseFooter from './ExerciseFooter'

export default function ExercisePage() {
  const [activeTab, setActiveTab] = useState('html')

  const [htmlCode, setHtmlCode] = useState(`<!-- Write code below 💖 -->`)

  const [cssCode, setCssCode] = useState('')

  const [isRunning, setIsRunning] = useState(false)

  const runCode = () => {
    setIsRunning(true)
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#020817] text-white">

      {/* Top navigation */}
      <TopBar />

      {/* Main workspace */}
      <main className="flex h-[calc(100vh-56px)] flex-col pb-[58px] lg:flex-row">

        {/* LEFT */}
        <LessonPanel />

        {/* CENTER */}
        <CodeEditor
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          htmlCode={htmlCode}
          setHtmlCode={setHtmlCode}
          cssCode={cssCode}
          setCssCode={setCssCode}
          runCode={runCode}
        />

        {/* RIGHT */}
        <PreviewPanel
          htmlCode={htmlCode}
          cssCode={cssCode}
          isRunning={isRunning}
        />

      </main>

      {/* Bottom */}
      <ExerciseFooter />

    </div>
  )
}