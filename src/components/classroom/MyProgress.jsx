import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../supabaseClient";
import { useAuthStore } from "../../store/authStore";
import { getStudentReview } from "../../services/studentReviewService";
import { lessonResult } from "../../lib/assessment";
import SubmissionReview from "../shared/SubmissionReview";
import { Button } from "../ui/button";
import { 
  Trophy, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCcw, 
  Award, 
  BookOpen, 
  Check, 
  GraduationCap, 
  ClipboardCheck, 
  Flame,
  Target
} from "lucide-react";

/* ---------- Helper Formatters ---------- */

const STATUS_CONFIG = {
  passed: { label: "Completed", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  completed: { label: "Completed", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  submitted: { label: "Under Review", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: Clock },
  failed: { label: "Needs Retake", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20", icon: AlertCircle },
  not_started: { label: "Not Started", color: "bg-muted text-muted-foreground border-border", icon: Target },
};

export default function MyProgress({ classroomId }) {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState(null);
  const [mastery, setMastery] = useState([]);
  const [badges, setBadges] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    Promise.all([
      getStudentReview(classroomId, user.id),
      supabase.rpc("get_course_mastery", {
        p_classroom: classroomId,
        p_student: user.id,
      }),
      supabase
        .from("classroom_badge_awards")
        .select("*")
        .eq("student_id", user.id)
        .eq("classroom_id", classroomId),
    ])
      .then(([review, result, awards]) => {
        if (result.error) throw result.error;
        if (active) {
          setData(review);
          setMastery(result.data ?? []);
          setBadges(awards.data ?? []);
        }
      })
      .catch((e) => {
        if (active) setError(e.message || "Could not load progress records.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [classroomId, user.id, retry]);

  // Aggregate metrics for summary cards
  const summary = useMemo(() => {
    if (!data?.lessons) return null;

    const published = data.lessons.filter((l) => l.is_published);
    let completedCount = 0;
    let totalScore = 0;
    let scoredLessonsCount = 0;

    published.forEach((l) => {
      const res = lessonResult(l, data.submissions);
      const isDone = res.status === "passed" || res.status === "completed";
      if (isDone) completedCount += 1;
      if (res.score != null) {
        totalScore += Number(res.score);
        scoredLessonsCount += 1;
      }
    });

    const avgScore = scoredLessonsCount ? Math.round(totalScore / scoredLessonsCount) : null;
    const completionPercent = published.length ? Math.round((completedCount / published.length) * 100) : 0;

    // Checkpoints total & passed
    let totalCheckpoints = 0;
    let passedCheckpoints = 0;
    mastery.forEach((m) => {
      (m.checkpoints || []).forEach((cp) => {
        totalCheckpoints += 1;
        if (cp.passed) passedCheckpoints += 1;
      });
    });

    return {
      publishedCount: published.length,
      completedCount,
      completionPercent,
      avgScore,
      totalCheckpoints,
      passedCheckpoints,
      badgesCount: badges.length,
    };
  }, [data, mastery, badges]);

  const labSubmissions = useMemo(() => {
    if (!data?.submissions) return [];
    return data.submissions.filter((s) => !s.step_key && s.is_final);
  }, [data]);

  return (
    <div className="w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            My Learning Progress
          </h2>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive font-medium">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="space-y-6 animate-pulse">
          <div className="grid gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl border border-border bg-card/60" />
            ))}
          </div>
          <div className="h-64 rounded-2xl border border-border bg-card/60" />
        </div>
      )}

      {/* Main Content */}
      {data && summary && (
        <>
          {/* Top Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold">Curriculum Done</span>
                <BookOpen className="size-4 text-primary" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-extrabold text-foreground">
                  {summary.completionPercent}%
                </span>
                <span className="text-xs text-muted-foreground">
                  ({summary.completedCount}/{summary.publishedCount} lessons)
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${summary.completionPercent}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold">Average Score</span>
                <Flame className="size-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-extrabold text-foreground">
                  {summary.avgScore != null ? `${summary.avgScore}%` : "—"}
                </span>
                <span className="text-xs text-muted-foreground">across attempts</span>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Graded quizzes & laboratory rubrics
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold">Assessments Passed</span>
                <CheckCircle2 className="size-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-extrabold text-foreground">
                  {summary.passedCheckpoints}
                </span>
                <span className="text-xs text-muted-foreground">
                  of {summary.totalCheckpoints} checkpoints
                </span>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Required for tier promotion
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold">Badges Earned</span>
                <Trophy className="size-4 text-violet-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-extrabold text-foreground">
                  {summary.badgesCount}
                </span>
                <span className="text-xs text-muted-foreground">achievements</span>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Classroom honors & milestones
              </p>
            </div>
          </div>

          {/* Section 1: Course Mastery & Tier Checkpoints */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Target className="size-4 text-primary" /> Course Mastery & Checkpoints
            </h3>

            {mastery.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-xs text-muted-foreground">
                No course proficiency tiers configured for this classroom.
              </div>
            ) : (
              mastery.map((c) => (
                <section
                  key={c.course_id}
                  className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                    <div>
                      <h4 className="font-display text-base font-bold text-foreground">{c.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pass the checkpoint activities at each tier level to advance your classification.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Classification:</span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold capitalize bg-primary/10 text-primary border border-primary/20">
                        {c.classification ?? "Not yet assessed"}
                      </span>
                    </div>
                  </div>

                  {/* Checkpoints list */}
                  {!c.checkpoints?.length ? (
                    <p className="text-xs text-muted-foreground italic py-2">
                      Your teacher has not designated evaluation checkpoints for this course yet.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {c.checkpoints.map((p) => {
                        const isPassed = Boolean(p.passed);
                        const hasScore = p.score != null;
                        const passingGrade = Math.ceil(p.passing ?? 75);

                        return (
                          <div
                            key={p.id}
                            className={`flex flex-col justify-between rounded-xl border p-3.5 transition-colors ${
                              isPassed 
                                ? "border-emerald-500/20 bg-emerald-500/5" 
                                : "border-border bg-background"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                  {p.proficiency_tier} Tier
                                </span>
                                <p className="font-semibold text-xs text-foreground mt-2 truncate">
                                  {p.title}
                                </p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                                isPassed
                                  ? "text-emerald-600 bg-emerald-500/10"
                                  : hasScore
                                  ? "text-rose-600 bg-rose-500/10"
                                  : "text-muted-foreground bg-muted"
                              }`}>
                                {isPassed ? <Check className="size-3" /> : null}
                                {isPassed ? "Passed" : hasScore ? "Needs Retake" : "Pending"}
                              </span>
                            </div>

                            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Score:{" "}
                                <strong className="text-foreground font-mono">
                                  {hasScore ? `${Math.round(p.score)}%` : "—"}
                                </strong>
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                Pass Req: {passingGrade}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              ))
            )}
          </div>

          {/* Section 2: Detailed Lesson Breakdown Table */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen className="size-4 text-primary" /> Lessons & Assessments
            </h3>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Lesson Name</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.lessons
                      .filter((l) => l.is_published)
                      .map((l) => {
                        const result = lessonResult(l, data.submissions);
                        const statusKey = result.status?.toLowerCase() || "not_started";
                        const conf = STATUS_CONFIG[statusKey] || STATUS_CONFIG.not_started;
                        const StatusIcon = conf.icon;

                        return (
                          <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">
                              {l.title}
                            </td>
                            <td className="px-4 py-3">
                              <span className="capitalize px-2 py-0.5 rounded text-[11px] bg-muted text-muted-foreground font-medium">
                                {l.type}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${conf.color}`}>
                                <StatusIcon className="size-3" />
                                {conf.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
                              {result.score == null ? "—" : `${result.score}%`}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 3: Laboratory Submissions Feedback */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <ClipboardCheck className="size-4 text-primary" /> Instructor Laboratory Reviews
            </h3>

            {labSubmissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-xs text-muted-foreground">
                No finalized laboratory submissions with feedback on record yet.
              </div>
            ) : (
              <div className="space-y-3">
                {labSubmissions.map((s) => (
                  <SubmissionReview
                    key={`${s.id}-${s.revision}`}
                    submission={s}
                    readOnly
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Achievements & Badges */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Award className="size-4 text-primary" /> Earned Achievements
            </h3>

            {badges.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-xs text-muted-foreground">
                No achievements awarded in this classroom yet. Keep advancing through course milestones!
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs"
                  >
                    <div className="grid size-10 place-items-center rounded-xl bg-violet-500/10 text-violet-600 shrink-0">
                      <Trophy className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">
                        {b.badge_name ?? b.name ?? "Classroom Achievement"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Awarded Milestone
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}