export default function LessonPanel() {
  return (
    <section className="w-full overflow-y-auto border-r border-border bg-card lg:w-[33%]">

      {/* Exercise header */}
      <div className="flex h-11 items-center justify-between border-b border-border bg-card px-5">

        <span className="text-sm font-semibold text-foreground">
          Exercise
        </span>

        <div className="flex items-center">

          <div className="flex -space-x-2">

            <div className="h-6 w-6 rounded-full border border-border bg-slate-300" />

            <div className="h-6 w-6 rounded-full border border-border bg-card" />

            <div className="h-6 w-6 rounded-full border border-border bg-slate-500" />

          </div>

          <span className="ml-3 text-xs text-muted-foreground">
            +6 also learning
          </span>

        </div>

      </div>

      <div className="p-5">

        {/* Title */}
        <h1 className="mb-8 font-mono text-3xl font-black tracking-tight">
          02. Syntax
        </h1>

        {/* Heading */}
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">

          <span className="text-blue-500">
            #
          </span>

          Rule Syntax

        </h2>

        <div className="space-y-5 text-sm leading-6 text-foreground">

          <p>
            Let's dig further into how CSS is written.
          </p>

          <p>
            In a given CSS file, we write rules for how
            the elements should be styled on our page.
            The syntax for these rules looks like this:
          </p>

        </div>

        {/* CSS diagram */}
        <div className="my-8 overflow-x-auto">

          <div className="min-w-[340px] font-mono text-sm">

            <div className="flex items-center">

              <span className="font-bold text-yellow-400">
                Selector
              </span>

              <span className="mx-2 text-muted-foreground">
                ─
              </span>

              <span className="text-muted-foreground">
                ┌
              </span>

              <span className="ml-2 text-foreground">
                div
              </span>

              <span className="ml-3 text-muted-foreground">
                {'{'}
              </span>

            </div>

            <div className="ml-24 mt-1 text-blue-300">
              text-align:
              <span className="text-sky-400">
                {' center'}
              </span>
              ;
            </div>

            <div className="ml-24 text-muted-foreground">
              {'}'}
            </div>

            <div className="ml-40 mt-1 text-blue-400">
              └──────── Declaration
            </div>

          </div>

        </div>

        <div className="space-y-5 text-sm leading-6 text-foreground">

          <p>
            Every rule begins with a selector, followed
            by curly brackets{' '}
            <code className="rounded bg-muted px-1.5 py-0.5">
              {'{ }'}
            </code>.
          </p>

          <p>
            Inside, declarations are made of{' '}
            <code className="rounded bg-muted px-1.5 py-0.5">
              property: value
            </code>{' '}
            pairs separated by a colon. Each line ends
            with a{' '}
            <code className="rounded bg-muted px-1.5 py-0.5">
              ;
            </code>{' '}
            semicolon.
          </p>

          <p>
            You can add as many rules as you want to your
            CSS files! Some of your favorite web pages
            might have hundreds of CSS rules.
          </p>

        </div>

      </div>

      {/* Instructions */}
      <div className="border-t border-border">

        <div className="bg-card px-5 py-3 text-sm font-semibold">
          Instructions
        </div>

        <div className="p-5 text-sm leading-7">

          <p className="mb-4">
            Let's practice writing some CSS!
          </p>

          <p>
            Copy and paste the following HTML:
          </p>

          <div className="mt-4 rounded border border-border bg-card p-4 font-mono text-xs text-foreground">

            &lt;div&gt;Hello World&lt;/div&gt;

          </div>

        </div>

      </div>

    </section>
  )
}