import {
  Flag,
  Bell,
  UserRound,
  Monitor,
} from 'lucide-react'

export default function TopBar() {
  return (
    <header className="h-14 border-b border-slate-700 bg-[#020617]">

      <div className="flex h-full items-center justify-between px-4">

        {/* LEFT */}
        <div className="flex items-center gap-4">

          <div className="text-xl font-black tracking-tight">
            <span className="text-yellow-400">0</span>
            <span className="ml-2 font-mono">
              Codédex
            </span>
          </div>

          <div className="hidden items-center gap-2 text-sm md:flex">

            <span className="text-slate-400">
              CSS
            </span>

            <span className="text-slate-600">
              /
            </span>

            <span className="font-semibold text-white">
              Selectors
            </span>

          </div>

          {/* Progress */}
          <div className="hidden items-center gap-3 md:flex">

            <div className="h-2 w-40 overflow-hidden rounded-full border border-slate-500 bg-slate-800">

              <div
                className="h-full bg-lime-400"
                style={{ width: '20%' }}
              />

            </div>

            <span className="text-xs text-slate-400">
              20%
            </span>

          </div>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5">

          <div className="h-3 w-3 rounded-full bg-lime-500" />

          <Flag
            size={18}
            className="text-slate-400"
          />

          <Monitor
            size={18}
            className="text-slate-400"
          />

          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-800">
            <UserRound size={18} />
          </div>

          <button className="hidden border-2 border-yellow-600 bg-yellow-400 px-4 py-2 font-bold text-black shadow-[2px_2px_0px_#92400e] transition hover:translate-y-[1px] sm:block">
            Join Club
          </button>

        </div>

      </div>

    </header>
  )
}