// Wraps every page — handles the content area padding and scroll
export default function PageWrapper({ title, subtitle, actions, children }) {
  return (
    <div className="flex flex-col min-h-full p-6 gap-6 max-w-6xl mx-auto">
      {(title || actions) && (
        <div className="flex items-start justify-between">
          <div>
            {title && <h1 className="text-2xl font-extrabold text-foreground">{title}</h1>}
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}