import {
  Play,
  MoreHorizontal,
} from 'lucide-react'

export default function CodeEditor({
  activeTab,
  setActiveTab,
  htmlCode,
  setHtmlCode,
  cssCode,
  setCssCode,
  runCode,
}) {

  const isHTML = activeTab === 'html'

  return (
    <section className="relative flex min-h-0 w-full flex-col border-r border-border bg-card lg:w-[34%]">

      {/* Tabs */}
      <div className="flex h-11 flex-shrink-0 border-b border-border bg-card">

        <button
          onClick={() => setActiveTab('html')}
          className={`
            flex items-center gap-2 px-5
            font-semibold
            ${isHTML
              ? 'bg-card text-foreground'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >

          <span className="text-orange-500">
            HTML
          </span>

          index.html

        </button>

        <button
          onClick={() => setActiveTab('css')}
          className={`
            flex items-center gap-2 px-5
            font-semibold
            ${!isHTML
              ? 'bg-card text-foreground'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >

          <span className="text-blue-400">
            CSS
          </span>

          styles.css

        </button>

      </div>

      {/* Editor */}
      <div className="relative min-h-0 flex-1">

        {/* Line numbers */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 w-12 pt-5 text-right font-mono text-xs text-muted-foreground">

          {Array.from({ length: 30 }).map((_, index) => (
            <div
              key={index}
              className="h-[19px] pr-3"
            >
              {index + 1}
            </div>
          ))}

        </div>

        <textarea
          value={isHTML ? htmlCode : cssCode}
          onChange={(e) => {
            if (isHTML) {
              setHtmlCode(e.target.value)
            } else {
              setCssCode(e.target.value)
            }
          }}
          spellCheck="false"
          className="
            h-full
            w-full
            resize-none
            bg-transparent
            pl-14
            pr-5
            pt-5
            font-mono
            text-sm
            leading-[19px]
            text-foreground
            outline-none
            placeholder:text-muted-foreground
          "
          placeholder={
            isHTML
              ? '<!-- Write code below 💖 -->'
              : '/* Write CSS below */'
          }
        />

      </div>

      {/* Bottom editor controls */}
      <div className="absolute bottom-3 left-4 right-4 flex justify-between">

        <button className="
          flex
          h-9
          w-11
          items-center
          justify-center
          border
          border-border
          bg-card
          shadow-[2px_2px_0px_#020617]
          hover:bg-card
        ">
          <MoreHorizontal size={18} />
        </button>

        <button
          onClick={runCode}
          className="
            flex
            items-center
            gap-2
            border
            border-border
            bg-card
            px-4
            py-2
            font-bold
            shadow-[2px_2px_0px_#020617]
            hover:bg-card
          "
        >

          <Play size={14} fill="currentColor" />

          Run

        </button>

      </div>

    </section>
  )
}