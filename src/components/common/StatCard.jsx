export default function StatCard({
  label, value, sub, progress, accent = false, icon: Icon, imageSrc,
  iconClassName = "bg-primary/10 text-primary", loading = false, className = "",
}) {
  const percent = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : null;

  return (
    <div aria-busy={loading || undefined} className={`flex h-full min-w-0 flex-col rounded-2xl border bg-card p-5 text-card-foreground shadow-sm ${accent ? "border-primary/40" : "border-border"} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {(Icon || imageSrc) && (
          <div aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
            {Icon ? <Icon size={22} strokeWidth={1.75} /> : <img src={imageSrc} alt="" className="size-6 object-contain" />}
          </div>
        )}
      </div>
      {loading ? (
        <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-muted"><span className="sr-only">Loading {label}</span></div>
      ) : (
        <p className="mt-3 break-words font-display text-3xl font-extrabold tracking-tight text-card-foreground tabular-nums">{value ?? "—"}</p>
      )}
      {sub && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{sub}</p>}
      {percent !== null && !loading && (
        <div className="mt-auto pt-4">
          <div role="progressbar" aria-label={`${label} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
