import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../supabaseClient";
import {
  gradeLabRubric,
  gradeLaboratorySubmission,
} from "../../services/studentReviewService";
import { rubricTotal } from "../../lib/assessment";
import { codeGeneratorService } from "../../services/codeGenerator.service";
import { buildPreviewDocument } from "../../utils/previewRuntime";
import { PREVIEW_SANDBOX } from "../../utils/previewSecurity";
import { Button } from "../ui/button";
import { 
  Play, 
  Square, 
  FileCode, 
  Code, 
  Eye, 
  Copy, 
  Check, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  ChevronDown, 
  Sliders, 
  Loader2,
  Calendar,
  Layers
} from "lucide-react";

/* ---------- Status Helpers ---------- */

const STATUS_THEMES = {
  graded: { label: "Graded", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  submitted: { label: "Submitted", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: Clock },
  in_review: { label: "In Review", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: Clock },
  resubmission_requested: { label: "Resubmission Requested", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20", icon: AlertCircle },
};

function formatStatus(status) {
  const key = status?.toLowerCase() || "submitted";
  return STATUS_THEMES[key] || {
    label: (status || "Submitted").replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase()),
    color: "bg-muted text-muted-foreground border-border",
    icon: Clock,
  };
}

/* ---------- Submission Output (Preview & Code Viewer) ---------- */

export function SubmissionOutput({ submission }) {
  const files = submission.files ?? [];
  const htmlFiles = files.filter((f) => f.filename.endsWith(".html"));
  
  const [filename, setFilename] = useState(
    htmlFiles[0]?.filename ?? files[0]?.filename ?? ""
  );
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState(files[0]?.filename ?? "");
  const [copiedFile, setCopiedFile] = useState(null);

  const code = running
    ? codeGeneratorService.combineFilesForPreview(
        files.map((f) => ({ ...f, generatedCode: f.code ?? "" })),
        filename
      )
    : "";

  const handleCopy = (fileName, fileContent) => {
    navigator.clipboard.writeText(fileContent || "");
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  if (!files.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
        No source code files attached to this submission.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Preview Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Preview Target:</span>
          {htmlFiles.length > 0 ? (
            <select
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {htmlFiles.map((f) => (
                <option key={f.filename} value={f.filename}>
                  {f.filename}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-muted-foreground font-mono">No HTML entry file</span>
          )}
        </div>

        <Button
          type="button"
          size="sm"
          variant={running ? "formalPlain" : "formalPrimary"}
          onClick={() => setRunning((v) => !v)}
          className="text-xs h-8 gap-1.5"
        >
          {running ? (
            <>
              <Square className="size-3.5 fill-current text-rose-500" /> Stop Preview
            </>
          ) : (
            <>
              <Play className="size-3.5 fill-current text-primary" /> Run Output
            </>
          )}
        </Button>
      </div>

      {/* Interactive Browser Preview Window */}
      {running && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/40">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-500/80" />
              <span className="size-2.5 rounded-full bg-amber-500/80" />
              <span className="size-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[200px]">
              sandbox://{filename}
            </span>
            <div className="w-8" />
          </div>
          <iframe
            title="Submitted project output"
            sandbox={PREVIEW_SANDBOX}
            srcDoc={buildPreviewDocument(code)}
            className="h-96 w-full bg-white dark:bg-card"
          />
        </div>
      )}

      {/* Code Inspector Tabs & Content */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        {/* File Tabs */}
        <div className="flex items-center overflow-x-auto border-b border-border bg-muted/30 px-2 pt-2 scrollbar-none">
          {files.map((f) => {
            const isSelected = activeTab === f.filename;
            return (
              <button
                key={f.filename}
                type="button"
                onClick={() => setActiveTab(f.filename)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium rounded-t-lg border-t border-x transition-colors -mb-px ${
                  isSelected
                    ? "bg-card border-border text-primary font-semibold shadow-xs"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <FileCode className="size-3.5" />
                {f.filename}
              </button>
            );
          })}
        </div>

        {/* Selected File Content View */}
        {files.map((f) => {
          if (f.filename !== activeTab) return null;
          const isCopied = copiedFile === f.filename;

          return (
            <div key={f.filename} className="p-4 space-y-3 bg-card">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-mono">
                  {f.code ? `${f.code.split("\n").length} lines` : "Empty file"}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(f.filename, f.code)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="size-3 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" /> Copy Code
                    </>
                  )}
                </button>
              </div>

              {/* Code Pre Box */}
              <div className="relative rounded-xl border border-border/80 bg-slate-950 p-4 overflow-auto max-h-80 shadow-inner">
                <pre className="font-mono text-xs text-slate-100 whitespace-pre leading-relaxed">
                  {f.code || "// No code saved in this file."}
                </pre>
              </div>

              {/* Collapsible Saved Block JSON Data */}
              {f.blocks_json && (
                <details className="group pt-2 border-t border-border text-xs">
                  <summary className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer font-medium select-none">
                    <Layers className="size-3.5" /> Saved Block Structure (Read-only)
                    <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
                  </summary>
                  <pre className="mt-2.5 max-h-56 overflow-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-[11px] text-muted-foreground">
                    {JSON.stringify(f.blocks_json, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Main SubmissionReview Component ---------- */

export default function SubmissionReview({
  submission,
  onSaved,
  readOnly = false,
}) {
  const [scores, setScores] = useState(submission.criterion_scores ?? {});
  const [legacy, setLegacy] = useState(submission.score ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("submission_history")
      .select("id,snapshot,recorded_at")
      .eq("submission_id", submission.id)
      .order("recorded_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (active) {
          if (err) setError(err.message);
          else setHistory(data ?? []);
        }
      });
    return () => {
      active = false;
    };
  }, [submission.id, submission.graded_at, submission.revision]);

  // Real-time calculation of rubric grade
  const liveRubricScore = useMemo(() => {
    if (!submission.rubric_snapshot) return null;
    try {
      return rubricTotal(submission.rubric_snapshot, scores);
    } catch {
      return null;
    }
  }, [submission.rubric_snapshot, scores]);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      let updated;
      if (submission.rubric_snapshot) {
        rubricTotal(submission.rubric_snapshot, scores);
        updated = await gradeLabRubric(
          submission,
          Object.fromEntries(
            Object.entries(scores).map(([id, value]) => [id, Number(value)])
          ),
          feedback
        );
      } else {
        if (
          legacy === "" ||
          !Number.isInteger(Number(legacy)) ||
          Number(legacy) < 0 ||
          Number(legacy) > 100
        ) {
          throw new Error("Enter a whole-number percentage from 0 to 100.");
        }
        updated = await gradeLaboratorySubmission(
          submission.id,
          Number(legacy),
          feedback
        );
      }
      onSaved?.(updated);
    } catch (err) {
      setError(err.message || "Failed to save submission evaluation.");
    } finally {
      setBusy(false);
    }
  }

  const statusInfo = formatStatus(submission.review_status);
  const StatusIcon = statusInfo.icon;
  const isPassed = submission.score != null && submission.score >= (submission.passing_score_snapshot ?? 75);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
              Revision #{submission.revision ?? 1}
            </span>

            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
              <StatusIcon className="size-3.5" />
              {statusInfo.label}
            </span>

            {submission.score != null && (
              <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${
                isPassed 
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-600 border-rose-500/20"
              }`}>
                {submission.score}% Score
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="size-3" />
            Submitted on {new Date(submission.submitted_at).toLocaleString()}
            {submission.rubric_version && ` · Rubric v${submission.rubric_version}`}
          </p>
        </div>

        <div className="text-right text-xs">
          <span className="text-muted-foreground">Passing Threshold: </span>
          <span className="font-semibold font-mono text-foreground">
            {submission.passing_score_snapshot ?? 75}%
          </span>
        </div>
      </div>

      {/* Interactive Code & Output Sandbox */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Code className="size-3.5 text-primary" /> Submission Artifacts & Preview
        </h4>
        <SubmissionOutput submission={submission} />
      </div>

      {/* Instructor Feedback Callout (Read-Only Mode) */}
      {submission.feedback && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1.5">
          <p className="text-xs font-bold text-primary flex items-center gap-1.5">
            <MessageSquare className="size-4" /> Instructor Evaluation & Feedback
          </p>
          <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap pl-5.5">
            {submission.feedback}
          </p>
        </div>
      )}

      {/* Teacher Grading & Rubric Scoring Form */}
      {!readOnly && submission.is_final && (
        <form onSubmit={save} className="rounded-xl border border-border bg-muted/20 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Sliders className="size-4 text-primary" /> Grade Submission
            </h4>
            {liveRubricScore != null && (
              <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-md">
                Calculated Grade: {Math.round(liveRubricScore)}%
              </span>
            )}
          </div>

          {/* Rubric Criteria List */}
          {submission.rubric_snapshot ? (
            <div className="space-y-3">
              {submission.rubric_snapshot.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div>
                    <p className="text-xs font-semibold text-foreground">{c.label}</p>
                    <span className="text-[11px] text-muted-foreground">Maximum points: {c.max}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min="0"
                      max={c.max}
                      step="1"
                      value={scores[c.id] ?? ""}
                      onChange={(e) => setScores({ ...scores, [c.id]: e.target.value })}
                      className="w-20 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-mono font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <span className="text-xs text-muted-foreground font-mono">/ {c.max}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-foreground">Percentage Grade (0–100):</label>
              <input
                required
                type="number"
                min="0"
                max="100"
                step="1"
                value={legacy}
                onChange={(e) => setLegacy(e.target.value)}
                className="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          )}

          {/* Teacher Feedback Textarea */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5">
              Evaluation Notes & Student Feedback
            </label>
            <textarea
              maxLength={5000}
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback on code structure, styling, or logic..."
              className="w-full rounded-xl border border-border bg-background p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button variant="formalPrimary" disabled={busy} className="gap-2 text-xs">
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              {busy ? "Saving Evaluation..." : "Save Review"}
            </Button>
          </div>
        </form>
      )}

      {/* Global Form Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Version History Accordion */}
      {history.length > 0 && (
        <details className="group pt-4 border-t border-border text-xs">
          <summary className="flex items-center justify-between font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none">
            <span className="flex items-center gap-2">
              <History className="size-4 text-primary" /> Previous Revisions & Submissions ({history.length})
            </span>
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </summary>

          <div className="mt-4 space-y-4 pl-3 border-l-2 border-border ml-2">
            {history.map((h) => {
              const snap = h.snapshot;
              const snapStatus = formatStatus(snap.review_status);

              return (
                <div key={h.id} className="relative space-y-3 pt-2">
                  <span className="absolute -left-[19px] top-3 size-2.5 rounded-full bg-border" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-foreground">
                      Revision #{snap.revision ?? 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${snapStatus.color}`}>
                      {snapStatus.label}
                    </span>
                    {snap.score != null && (
                      <span className="font-mono font-bold text-foreground">
                        {snap.score}%
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      • {new Date(h.recorded_at).toLocaleString()}
                    </span>
                  </div>

                  {snap.feedback && (
                    <p className="rounded-lg bg-muted/40 p-2.5 text-xs text-foreground/90 whitespace-pre-wrap">
                      {snap.feedback}
                    </p>
                  )}

                  <SubmissionOutput submission={snap} />
                </div>
              );
            })}
          </div>
        </details>
      )}
    </section>
  );
}