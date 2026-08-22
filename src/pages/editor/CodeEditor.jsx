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
    <section className="relative flex min-h-0 w-full flex-col border-r border-slate-700 bg-[#052b5f] lg:w-[34%]">

      {/* Tabs */}
      <div className="flex h-11 flex-shrink-0 border-b border-slate-700 bg-[#0f2745]">

        <button
          onClick={() => setActiveTab('html')}
          className={`
            flex items-center gap-2 px-5
            font-semibold
            ${isHTML
              ? 'bg-[#052b5f] text-white'
              : 'text-slate-400 hover:text-white'
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
              ? 'bg-[#052b5f] text-white'
              : 'text-slate-400 hover:text-white'
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
        <div className="pointer-events-none absolute left-0 top-0 z-10 w-12 pt-5 text-right font-mono text-xs text-slate-500">

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
            text-slate-200
            outline-none
            placeholder:text-slate-500
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
          border-slate-500
          bg-[#061a36]
          shadow-[2px_2px_0px_#020617]
          hover:bg-[#0b2345]
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
            border-slate-400
            bg-[#061a36]
            px-4
            py-2
            font-bold
            shadow-[2px_2px_0px_#020617]
            hover:bg-[#0b2345]
          "
        >

          <Play size={14} fill="currentColor" />

          Run

        </button>

      </div>

    </section>
  )
}