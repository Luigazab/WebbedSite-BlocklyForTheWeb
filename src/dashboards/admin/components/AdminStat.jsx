export default function AdminStat({label, value, sub, progress, accent, icon, imageSrc}){
  const IconComponent = icon;
  return(
    <div className={`shadow rounded-lg border p-5 relative overflow-hidden ${
        accent
          ? "border-primary/40 bg-linear-to-br from-primary/15 to-transparent"
          : "border-slate-200 bg-card"
      }`}
    >
      {(icon || imageSrc) && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          {imageSrc && !icon ? (
            <img 
              src={imageSrc} 
              alt="stat decoration" 
              className="w-20 h-20 object-contain"
            />
          ) : (
            <IconComponent size={80} strokeWidth={1.5} className="text-sky-600" />
          )}
        </div>
      )}
      
      <div className="relative z-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className={`mt-2 font-display text-3xl font-black ${accent ? "text-primary-glow" : ""}`}>
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        {typeof progress === "number" && (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white border border-border">
            <div className="h-full rounded-full bg-blue-500 transition-all!"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}