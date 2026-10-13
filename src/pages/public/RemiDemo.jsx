import { useCallback, useState } from 'react'
import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas'
import { ArrowLeft, Pause, Play, RotateCcw, Sparkles } from 'lucide-react'
import { Link } from 'react-router'

const ARTBOARD = 'Remi'
const STATE_MACHINE = 'Remi Controller'

export default function RemiDemo() {
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [loadError, setLoadError] = useState('')

  const handleLoad = useCallback(() => {
    setIsReady(true)
    setLoadError('')
  }, [])

  const handleLoadError = useCallback(() => {
    setIsReady(false)
    setLoadError('Remi could not be loaded. Check that the exported .riv file still uses the expected artboard and state-machine names.')
  }, [])

  const { rive, RiveComponent } = useRive({
    src: '/rive/untitled.riv',
    artboard: ARTBOARD,
    stateMachine: STATE_MACHINE,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoad: handleLoad,
    onLoadError: handleLoadError,
  })

  const togglePlayback = () => {
    if (!rive) return
    if (isPlaying) rive.pause(STATE_MACHINE)
    else rive.play(STATE_MACHINE)
    setIsPlaying((playing) => !playing)
  }

  const restart = () => {
    if (!rive) return
    rive.reset({ artboard: ARTBOARD, stateMachine: STATE_MACHINE, autoplay: true })
    setIsPlaying(true)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07152f] px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-20 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-300/40 hover:bg-white/12 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to WebbedSite
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
            <span className={`h-2 w-2 rounded-full ${isReady ? 'bg-emerald-400' : 'animate-pulse bg-amber-300'}`} />
            {isReady ? 'Rive connected' : 'Loading Rive'}
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:py-6">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-sky-300">
              <Sparkles size={18} />
              Interactive mascot prototype
            </div>
            <h1 className="text-5xl font-black leading-[0.96] tracking-[-0.04em] sm:text-6xl">
              Meet Remi,
              <span className="mt-2 block bg-gradient-to-r from-sky-300 via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                now in motion.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
              This page runs the exported Rive file directly inside WebbedSite. The animation is rendered in real time from the <strong className="text-white">Remi Controller</strong> state machine.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={togglePlayback}
                disabled={!isReady}
                className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                onClick={restart}
                disabled={!isReady}
                className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={18} />
                Restart
              </button>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <dt className="text-slate-400">Artboard</dt>
                <dd className="mt-1 font-bold text-white">{ARTBOARD}</dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <dt className="text-slate-400">State machine</dt>
                <dd className="mt-1 font-bold text-white">{STATE_MACHINE}</dd>
              </div>
              <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:col-span-1">
                <dt className="text-slate-400">Source</dt>
                <dd className="mt-1 font-bold text-white">untitled.riv</dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-2xl">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-sky-400/25 via-blue-500/5 to-indigo-500/25 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-b from-white/12 to-white/5 p-3 shadow-2xl shadow-black/35 backdrop-blur-xl sm:p-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.45rem] bg-gradient-to-b from-[#dff5ff] to-[#9bd8ff]">
                {!isReady && !loadError && (
                  <div className="absolute inset-0 z-10 grid place-items-center">
                    <div className="flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-blue-950 shadow-lg backdrop-blur">
                      <span className="h-2.5 w-2.5 animate-ping rounded-full bg-sky-500" />
                      Waking Remi up…
                    </div>
                  </div>
                )}

                {loadError ? (
                  <div className="absolute inset-0 grid place-items-center p-8 text-center text-sm font-semibold leading-6 text-red-950">
                    {loadError}
                  </div>
                ) : (
                  <RiveComponent className="h-full w-full" aria-label="Animated Remi mascot" />
                )}
              </div>

              <div className="mt-3 flex items-center justify-between px-2 text-xs text-slate-300">
                <span>Live canvas preview</span>
                <span className="font-mono text-sky-200">512 × 384</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
