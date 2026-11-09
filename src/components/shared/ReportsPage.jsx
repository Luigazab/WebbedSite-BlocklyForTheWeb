import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../../supabaseClient";
import { useAuthStore } from "../../store/authStore";
import { Button } from "#components/ui/button";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  X, 
  RefreshCw, 
  Bug, 
  BookOpen, 
  User, 
  HelpCircle, 
  MessageSquare, 
  ImageIcon, 
  ExternalLink, 
  Send, 
  UploadCloud, 
  ChevronDown,
  ShieldAlert,
  Loader2,
  Calendar
} from "lucide-react";

const STATUSES = ["open", "in_review", "resolved", "closed"];
const CATEGORIES = ["bug", "lesson", "account", "general", "other"];

const CATEGORY_META = {
  bug: { label: "Bug", icon: Bug, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  lesson: { label: "Lesson Content", icon: BookOpen, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  account: { label: "Account", icon: User, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  general: { label: "General", icon: MessageSquare, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  other: { label: "Other", icon: HelpCircle, color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
};

const STATUS_META = {
  open: { label: "Open", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: Clock },
  in_review: { label: "In Review", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: AlertCircle },
  resolved: { label: "Resolved", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
};

export default function ReportsPage({ manage = false }) {
  const user = useAuthStore((s) => s.user);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [retry, setRetry] = useState(0);

  // Form & Screenshot States
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let q = supabase
        .from("feedback")
        .select(
          "*,sender:profiles!feedback_user_id_fkey(username),feedback_history(status,created_at)"
        )
        .order("created_at", { ascending: false });

      if (!manage && user?.id) {
        q = q.eq("user_id", user.id);
      }

      const { data, error: fetchErr } = await q;
      if (fetchErr) throw fetchErr;
      setReports(data ?? []);
    } catch (e) {
      setError(e.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [manage, user?.id]);

  useEffect(() => {
    load();
  }, [load, retry]);

  // Handle Form Submission
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = e.currentTarget;
    const v = new FormData(form);

    try {
      let path = null;
      if (screenshotFile) {
        if (
          !["image/png", "image/jpeg", "image/webp"].includes(screenshotFile.type) ||
          screenshotFile.size > 2 * 1024 * 1024
        ) {
          throw new Error("Screenshot must be PNG, JPEG or WebP under 2 MB.");
        }
        path = `${user.id}/${crypto.randomUUID()}.${screenshotFile.type.split("/")[1]}`;
        const { error: uploadErr } = await supabase.storage
          .from("report-screenshots")
          .upload(path, screenshotFile);
        if (uploadErr) throw uploadErr;
      }

      const { error: insertErr } = await supabase.from("feedback").insert({
        user_id: user.id,
        title: v.get("title")?.trim(),
        message: v.get("message")?.trim(),
        type: v.get("category"),
        context_url: v.get("context")?.trim(),
        screenshot_path: path,
        status: "open",
      });

      if (insertErr) throw insertErr;

      form.reset();
      setScreenshotFile(null);
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
      setScreenshotPreview(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchStatus = filter === "all" || r.status === filter;
      const matchCat = category === "all" || r.type === category;
      const matchSearch =
        search === "" ||
        `${r.title} ${r.message} ${r.sender?.username || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());
      return matchStatus && matchCat && matchSearch;
    });
  }, [reports, filter, category, search]);

  // Status counts for badges
  const statusCounts = useMemo(() => {
    return reports.reduce(
      (acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      },
      { open: 0, in_review: 0, resolved: 0, closed: 0 }
    );
  }, [reports]);

  return (
    <main className="wide-container">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="size-6 text-primary" />
            {manage ? "Issue Reports & Feedback" : "Help & Support Tickets"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {manage
              ? "Review, triage, and update reported technical or lesson issues."
              : "Report unexpected bugs or content issues. Track resolutions directly below."}
          </p>
        </div>

        {/* Quick Summary Pill Counters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => setFilter(filter === st ? "all" : st)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                filter === st
                  ? "bg-foreground text-background font-semibold border-foreground"
                  : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="capitalize">{st.replace("_", " ")}</span>{" "}
              <span className="font-mono text-[11px] opacity-75">
                ({statusCounts[st] || 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <p className="flex-1 font-medium">{error}</p>
          <button onClick={() => setError("")} className="hover:opacity-75">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Create Ticket Form (Regular Users Only) */}
      {!manage && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Submit a Ticket</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Provide context and a screenshot so our team can resolve it quickly.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-foreground mb-1.5">
                  Subject / Summary *
                </label>
                <input
                  name="title"
                  required
                  maxLength={160}
                  placeholder="e.g. Code editor fails to compile Python loop"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 capitalize"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_META[c]?.label || c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5">
                Detailed Description *
              </label>
              <textarea
                name="message"
                required
                maxLength={5000}
                rows={3}
                placeholder="What happened? Steps to reproduce the issue..."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5">
                  Affected URL or Context
                </label>
                <input
                  name="context"
                  defaultValue={typeof window !== "undefined" ? window.location.href : ""}
                  maxLength={1000}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Upload Screenshot Dropzone */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5">
                  Screenshot (Optional, up to 2MB)
                </label>

                {screenshotPreview ? (
                  <div className="flex items-center justify-between rounded-xl border border-border bg-background p-2 px-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img
                        src={screenshotPreview}
                        alt="Preview"
                        className="size-8 rounded-lg object-cover border border-border shrink-0"
                      />
                      <span className="text-xs font-medium text-foreground truncate max-w-[180px]">
                        {screenshotFile?.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(screenshotPreview);
                        setScreenshotPreview(null);
                        setScreenshotFile(null);
                      }}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-3 py-2 cursor-pointer hover:bg-muted/40 transition-colors">
                    <UploadCloud className="size-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Upload PNG, JPEG or WebP</span>
                    <input
                      name="screenshot"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setScreenshotFile(file);
                          setScreenshotPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="formalPrimary" disabled={busy} className="gap-2">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                {busy ? "Submitting..." : "Send Ticket"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              aria-label="Search reports"
              placeholder="Search reports or authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-9 pr-8 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Status Select */}
          <select
            aria-label="Status filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 capitalize"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>

          {/* Category Select */}
          <select
            aria-label="Category filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 capitalize"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c]?.label || c}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Action */}
        <Button
          variant="formalPlain"
          size="sm"
          onClick={() => setRetry((n) => n + 1)}
          className="gap-1.5 text-xs h-8"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-40 rounded-2xl border border-border bg-card p-5 animate-pulse" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground mx-auto mb-3">
            <CheckCircle2 className="size-6 text-emerald-500" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No reports found</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            {search || filter !== "all" || category !== "all"
              ? "No tickets match your active filter criteria."
              : "Everything looks clean! No pending issue reports on record."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((r) => {
            const statusStyle = STATUS_META[r.status] || STATUS_META.open;
            const categoryStyle = CATEGORY_META[r.type] || CATEGORY_META.other;
            const StatusIcon = statusStyle.icon;
            const CategoryIcon = categoryStyle.icon;

            return (
              <article
                key={r.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md space-y-3"
              >
                {/* Header: Title, Category & Status Badge */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-[200px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-base font-bold text-foreground">
                        {r.title || "Report Ticket"}
                      </h2>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${categoryStyle.color}`}>
                        <CategoryIcon className="size-3" />
                        {categoryStyle.label}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {r.sender?.username || "Anonymous"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(r.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Status Indicator or Admin Selector */}
                  <div className="flex items-center gap-2">
                    {manage ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-muted-foreground">Status:</span>
                        <select
                          value={r.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              const { error: patchErr } = await supabase
                                .from("feedback")
                                .update({ status: newStatus })
                                .eq("id", r.id);
                              if (patchErr) throw patchErr;
                              await load();
                            } catch (err) {
                              setError(err.message);
                            }
                          }}
                          className="rounded-xl border border-border bg-background px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 capitalize"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.color}`}>
                        <StatusIcon className="size-3.5" />
                        <span className="capitalize">{r.status?.replace("_", " ")}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Message */}
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/20 p-3.5 rounded-xl border border-border/50">
                  {r.message}
                </p>

                {/* Context Link & Screenshot Link */}
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  {r.context_url && (
                    <a
                      href={r.context_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline font-mono truncate max-w-md"
                    >
                      <ExternalLink className="size-3.5 shrink-0" />
                      {r.context_url}
                    </a>
                  )}

                  {r.screenshot_path && (
                    <button
                      type="button"
                      onClick={async () => {
                        const { data, error: urlErr } = await supabase.storage
                          .from("report-screenshots")
                          .createSignedUrl(r.screenshot_path, 60);
                        if (urlErr) setError(urlErr.message);
                        else setPreviewImage(data.signedUrl);
                      }}
                      className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary transition-colors bg-muted/60 hover:bg-muted px-2.5 py-1 rounded-lg border border-border"
                    >
                      <ImageIcon className="size-3.5" /> View Screenshot
                    </button>
                  )}
                </div>

                {/* Administrator Official Reply */}
                {r.reply && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs space-y-1">
                    <p className="font-semibold text-primary flex items-center gap-1.5">
                      <ShieldAlert className="size-3.5" /> Staff Response
                    </p>
                    <p className="text-foreground leading-relaxed pl-5">{r.reply}</p>
                  </div>
                )}

                {/* Collapsible Status History Timeline */}
                {r.feedback_history?.length > 0 && (
                  <details className="group pt-2 border-t border-border/60 text-xs">
                    <summary className="flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground cursor-pointer select-none">
                      <Clock className="size-3.5" />
                      <span>Activity Log ({r.feedback_history.length})</span>
                      <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-2.5 space-y-2 pl-4 border-l-2 border-border ml-1">
                      {r.feedback_history
                        .slice()
                        .sort((a, b) => b.created_at.localeCompare(a.created_at))
                        .map((h, i) => (
                          <div key={i} className="relative">
                            <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-border" />
                            <p className="text-[11px] text-muted-foreground">
                              Status changed to{" "}
                              <strong className="text-foreground capitalize font-semibold">
                                {h.status.replace("_", " ")}
                              </strong>{" "}
                              on {new Date(h.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                    </div>
                  </details>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Screenshot Lightbox Modal */}
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ImageIcon className="size-4 text-primary" /> Report Screenshot
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground p-1"
                  title="Open original in new tab"
                >
                  <ExternalLink className="size-4" />
                </a>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex items-center justify-center overflow-auto bg-black/5 dark:bg-black/40">
              <img
                src={previewImage}
                alt="Report attachment"
                className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}