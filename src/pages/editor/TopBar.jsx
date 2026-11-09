import {
  Flag,
  Bell,
  UserRound,
  Monitor,
} from 'lucide-react'

export default function TopBar() {
  return (
    <header className="h-14 border-b border-border bg-card">

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

            <span className="text-muted-foreground">
              CSS
            </span>

            <span className="text-foreground">
              /
            </span>

            <span className="font-semibold text-foreground">
              Selectors
            </span>

          </div>

          {/* Progress */}
          <div className="hidden items-center gap-3 md:flex">

            <div className="h-2 w-40 overflow-hidden rounded-full border border-border bg-muted">

              <div
                className="h-full bg-lime-400"
                style={{ width: '20%' }}
              />

            </div>

            <span className="text-xs text-muted-foreground">
              20%
            </span>

          </div>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5">

          <div className="h-3 w-3 rounded-full bg-lime-500" />

          <Flag
            size={18}
            className="text-muted-foreground"
          />

          <Monitor
            size={18}
            className="text-muted-foreground"
          />

          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted">
            <UserRound size={18} />
          </div>

          <button className="hidden border-2 border-yellow-600 bg-yellow-400 px-4 py-2 font-bold text-foreground shadow-[2px_2px_0px_#92400e] transition hover:translate-y-[1px] sm:flow-root">
            Join Club
          </button>

        </div>

      </div>

    </header>
  )
}