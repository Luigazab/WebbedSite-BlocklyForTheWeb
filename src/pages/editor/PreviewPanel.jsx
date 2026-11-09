export default function PreviewPanel({
  htmlCode,
  cssCode,
  isRunning,
}) {

  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          ${cssCode}
        </style>
      </head>

      <body>
        ${htmlCode}
      </body>
    </html>
  `

  return (
    <section className="flex min-h-0 w-full flex-col bg-card lg:w-[33%]">

      {/* Preview toolbar */}
      <div className="flex h-11 flex-shrink-0 items-center border-b border-border bg-card">

        <div className="px-5 text-foreground">
          ↻
        </div>

        <div className="flex h-8 flex-1 items-center rounded-full bg-card px-5 text-sm text-foreground">
          index.html
        </div>

      </div>

      {/* Preview */}
      <div className="min-h-0 flex-1">

        {isRunning ? (

          <iframe
            title="preview"
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            className="h-full w-full border-0 bg-card"
          />

        ) : (

          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">

            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded border-2 border-border font-mono text-lg">
              &gt;_
            </div>

            <p className="max-w-[250px] text-sm leading-6">
              Your code results will appear here
              when you Run the project.
            </p>

          </div>

        )}

      </div>

    </section>
  )
}