export default function ExerciseFooter() {

  return (
    <footer className="
      fixed
      bottom-0
      left-0
      right-0
      z-50
      h-[58px]
      border-t
      border-border
      bg-card
    ">

      <div className="flex h-full items-center justify-between px-5">

        {/* Exercise information */}
        <div className="flex items-center gap-4">

          <button className="
            hidden
            h-9
            w-11
            items-center
            justify-center
            border
            border-border
            bg-card
            md:flex
          ">
            ☷
          </button>

          <div>

            <p className="text-sm font-bold">
              Syntax
            </p>

            <div className="flex items-center gap-3">

              <span className="text-xs text-muted-foreground">
                Exercise 2 / 5
              </span>

              <span className="
                rounded-full
                bg-muted
                px-2
                py-0.5
                text-[10px]
                font-bold
                text-foreground
              ">
                10 XP
              </span>

            </div>

          </div>

        </div>

        {/* Complete */}
        <button className="
          hidden
          border-2
          border-lime-700
          bg-lime-400
          px-5
          py-2
          font-bold
          text-foreground
          shadow-[2px_2px_0px_#365314]
          transition
          hover:translate-y-[1px]
          sm:flow-root
        ">
          ✓ Mark complete
        </button>

        {/* Navigation */}
        <div className="flex gap-3">

          <button className="
            border
            border-border
            bg-card
            px-8
            py-2
            font-bold
            text-foreground
            hover:bg-muted
          ">
            Back
          </button>

          <button className="
            border
            border-border
            bg-card
            px-8
            py-2
            font-bold
            text-foreground
          ">
            Next
          </button>

        </div>

      </div>

    </footer>
  )
}