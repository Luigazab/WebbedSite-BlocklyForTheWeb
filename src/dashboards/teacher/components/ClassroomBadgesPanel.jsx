import { useCallback, useEffect, useState } from "react";
import {
  Award,
  Loader2,
  Plus,
  CheckCircle2,
  Sparkles,
  Zap,
  Check,
  Image as ImageIcon,
  AlertCircle,
  Smartphone,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import {
  getTemplateBadgeRules,
  createTemplateBadgeRule,
  setTemplateBadgeActive,
  createClassroomBadgeRule,
  getBadgeLibrary,
  getClassroomBadgeRules,
  setClassroomBadgeActive,
} from "../../../services/classroomBadgeService";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";

const emptyForm = {
  name: "",
  description: "",
  image_url: "",
  criterion: "topic_completed",
  course_id: "",
  topic_id: "",
  xp_target: "",
};

export default function ClassroomBadgesPanel({
  classroomId,
  templateCourseId = null,
  courses = [],
  topics = [],
  onAwarded = async () => {},
}) {
  const [showForm, setShowForm] = useState(false);
  const [rules, setRules] = useState([]);
  const [library, setLibrary] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [libraryError, setLibraryError] = useState("");
  const [previewTab, setPreviewTab] = useState("modal");
  const [previewImgError, setPreviewImgError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRules(
        templateCourseId
          ? await getTemplateBadgeRules(templateCourseId)
          : await getClassroomBadgeRules(classroomId),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [classroomId, templateCourseId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getBadgeLibrary()
      .then(setLibrary)
      .catch(() =>
        setLibraryError(
          "Badge images could not be loaded. You can still use the default award icon or an image URL.",
        ),
      );
  }, []);

  const update = (key, value) => {
    if (key === "image_url") setPreviewImgError(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const availableTopics = topics.filter(
    (topic) => topic.courseId === form.course_id,
  );

  async function save(event) {
    event.preventDefault();
    if (busy) return;

    if (
      form.criterion === "course_xp" &&
      (!Number.isSafeInteger(Number(form.xp_target)) ||
        Number(form.xp_target) <= 0)
    ) {
      setError("Enter a positive whole number for the XP target.");
      return;
    }
    if (form.image_url && !/^https?:\/\//i.test(form.image_url)) {
      setError("Please provide a valid HTTP or HTTPS image URL.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await (
        templateCourseId ? createTemplateBadgeRule : createClassroomBadgeRule
      )({
        classroom_id: classroomId,
        course_id: form.course_id,
        name: form.name.trim(),
        description: form.description.trim(),
        image_url: form.image_url.trim() || null,
        criterion: form.criterion,
        topic_id: form.criterion !== "course_xp" ? form.topic_id : null,
        xp_target:
          form.criterion === "course_xp" ? Number(form.xp_target) : null,
      });

      setForm(emptyForm);
      await load();
      await onAwarded();
      setShowForm(false);
      toast.success(
        templateCourseId
          ? "Badge template saved for future course clones."
          : "Badge created! Eligible students have been awarded automatically.",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(rule) {
    setBusy(true);
    setError("");
    try {
      await (
        templateCourseId ? setTemplateBadgeActive : setClassroomBadgeActive
      )(rule.id, !rule.is_active);
      await load();
      await onAwarded();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-heading">
            {templateCourseId ? "Topic Badge Templates" : "Classroom Badges"}
          </h2>
          <p className="text-sm text-subtitle">
            {templateCourseId
              ? "Badges inherited by courses when cloned into classrooms."
              : "Gamify learning and celebrate student milestones with automatic awards."}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setForm({ ...emptyForm, course_id: templateCourseId || "" });
            setPreviewImgError(false);
            setError("");
            setShowForm(true);
          }}
          className="gap-2 shrink-0"
        >
          <Plus size={16} /> Create Badge
        </Button>
      </header>

      {error && !showForm && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-danger-50 dark:bg-danger-900/20 p-3 text-sm text-destructive font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Creation Modal */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (!busy) setShowForm(open);
        }}
      >
        <DialogContent className="max-h-[92vh] sm:max-w-5xl p-0 overflow-hidden flex flex-col gap-0 border-border shadow-2xl bg-card">
          <DialogHeader className="p-6 pb-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 border border-brand-200 text-brand-600 dark:bg-brand-900/40 dark:border-brand-800 dark:text-brand-300">
                <Award size={20} />
              </span>
              <div>
                <DialogTitle className="text-lg font-extrabold text-heading">
                  Create Badge Award
                </DialogTitle>
                <DialogDescription className="text-xs text-subtitle">
                  {templateCourseId
                    ? "Future course clones inherit these badges automatically."
                    : "Students unlock this badge the moment they fulfill the condition."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form & Live Experience Preview */}
          <form
            id="badge-form"
            onSubmit={save}
            className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto"
          >
            {/* Form Settings (Left side) */}
            <div className="md:col-span-7 p-6 space-y-5 border-b md:border-b-0 md:border-r border-border bg-card">
              {/* Badge Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-subtitle">
                    Badge Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    required
                    maxLength={80}
                    placeholder="e.g. Master of Recursion"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-subtitle">
                    Description / Requirement Prompt
                  </label>
                  <textarea
                    rows={2}
                    maxLength={500}
                    placeholder="e.g. Completed all lessons and submitted checkpoint quizzes in Recursion."
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                  />
                </div>
              </div>

              {/* Award Criterion */}
              <div className="space-y-2.5 pt-2 border-t border-border">
                <label className="text-xs font-bold uppercase tracking-wider text-subtitle">
                  Award Trigger Condition
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <div
                    onClick={() => update("criterion", "topic_completed")}
                    className={`cursor-pointer rounded-xl border p-3 flex items-start gap-3 transition-all ${
                      form.criterion === "topic_completed"
                        ? "border-primary bg-brand-50/70 dark:bg-brand-900/20 ring-2 ring-primary"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5 text-leaf-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-heading">
                        Topic Completion
                      </p>
                      <p className="text-xs text-caption">
                        Awarded when completing every published lesson in the
                        topic.
                      </p>
                    </div>
                  </div>

                  {!templateCourseId && (
                    <>
                      <div
                        onClick={() => update("criterion", "topic_mastered")}
                        className={`cursor-pointer rounded-xl border p-3 flex items-start gap-3 transition-all ${
                          form.criterion === "topic_mastered"
                            ? "border-primary bg-brand-50/70 dark:bg-brand-900/20 ring-2 ring-primary"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <Sparkles className="h-5 w-5 text-[var(--special)] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-heading">
                            Topic Mastery
                          </p>
                          <p className="text-xs text-caption">
                            Passing the topic checkpoint quiz and laboratory
                            challenge.
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => update("criterion", "course_xp")}
                        className={`cursor-pointer rounded-xl border p-3 flex items-start gap-3 transition-all ${
                          form.criterion === "course_xp"
                            ? "border-primary bg-brand-50/70 dark:bg-brand-900/20 ring-2 ring-primary"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <Zap className="h-5 w-5 text-sun-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-heading">
                            Course XP Target
                          </p>
                          <p className="text-xs text-caption">
                            Accumulating a target XP threshold earned within
                            this course.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Course & Topic Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-subtitle">
                    Assigned Course <span className="text-destructive">*</span>
                  </label>
                  <select
                    required
                    value={form.course_id}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        course_id: e.target.value,
                        topic_id: "",
                      }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="">Select course...</option>
                    {courses.map((course) => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.courses?.title}
                      </option>
                    ))}
                  </select>
                </div>

                {form.criterion !== "course_xp" ? (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-subtitle">
                      Target Topic <span className="text-destructive">*</span>
                    </label>
                    <select
                      required
                      disabled={!form.course_id}
                      value={form.topic_id}
                      onChange={(e) => update("topic_id", e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                    >
                      <option value="">Select topic...</option>
                      {availableTopics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-subtitle">
                      XP Threshold <span className="text-destructive">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="e.g. 500"
                      value={form.xp_target}
                      onChange={(e) => update("xp_target", e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                )}
              </div>

              {/* Badge Icon Selector */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-subtitle">
                    Badge Artwork
                  </label>
                  <span className="text-[11px] text-caption">
                    Library icons or custom image URL
                  </span>
                </div>

                {libraryError && (
                  <p className="text-xs text-sun-800 dark:text-sun-300 font-medium">
                    {libraryError}
                  </p>
                )}

                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {/* Default Gold Award Icon */}
                  <button
                    type="button"
                    title="Default Award"
                    onClick={() => update("image_url", "")}
                    className={`relative flex aspect-square items-center justify-center rounded-xl border transition-all hover:bg-muted ${
                      !form.image_url
                        ? "border-primary bg-brand-50 dark:bg-brand-900/40 ring-2 ring-primary ring-offset-1"
                        : "border-border bg-card"
                    }`}
                  >
                    <Award className="h-7 w-7 text-amber-500 drop-shadow-xs" />
                    {!form.image_url && (
                      <span className="absolute top-1 right-1 rounded-full bg-primary p-0.5 text-white">
                        <Check size={10} />
                      </span>
                    )}
                  </button>

                  {/* Library Badges */}
                  {library.map((image) => {
                    const isSelected = form.image_url === image.image_url;
                    return (
                      <button
                        type="button"
                        key={image.id}
                        title={image.name}
                        onClick={() => update("image_url", image.image_url)}
                        className={`relative flex aspect-square items-center justify-center rounded-xl border p-2 transition-all hover:bg-muted ${
                          isSelected
                            ? "border-primary bg-brand-50 dark:bg-brand-900/40 ring-2 ring-primary ring-offset-1"
                            : "border-border bg-card"
                        }`}
                      >
                        <img
                          src={image.image_url}
                          alt={image.name}
                          className="h-full w-full object-contain drop-shadow-xs"
                        />
                        {isSelected && (
                          <span className="absolute top-1 right-1 rounded-full bg-primary p-0.5 text-white">
                            <Check size={10} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom URL Input */}
                <div className="relative mt-2">
                  <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="url"
                    placeholder="Or paste an image URL (https://...)"
                    value={form.image_url}
                    onChange={(e) => update("image_url", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-destructive/20 p-3 text-sm text-destructive font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Live Student Experience Preview (Right side) */}
            <div className="md:col-span-5 bg-muted/40 p-6 flex flex-col items-center justify-between border-t md:border-t-0">
              <div className="flex items-center justify-between w-full mb-3">
                <span className="eyebrow">Student Preview</span>
                <div className="flex rounded-lg border border-border bg-card p-0.5 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("modal")}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold transition-all ${
                      previewTab === "modal"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-subtitle hover:text-foreground"
                    }`}
                  >
                    <Smartphone size={12} />
                    Celebration
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("card")}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold transition-all ${
                      previewTab === "card"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-subtitle hover:text-foreground"
                    }`}
                  >
                    <CreditCard size={12} />
                    Badge Card
                  </button>
                </div>
              </div>

              {/* View 1: 1-to-1 match with CompleteSuccessModal */}
              {previewTab === "modal" ? (
                <div className="relative w-full max-w-sm rounded-3xl border border-border bg-gradient-to-b from-violet-50 via-white to-amber-50 dark:from-violet-950/40 dark:via-card dark:to-amber-950/20 p-6 shadow-xl flex flex-col items-center text-center overflow-hidden my-auto">
                  {/* Subtle celebratory radial blur */}
                  <div className="absolute top-8 h-40 w-40 rounded-full bg-gradient-to-tr from-amber-400/25 via-violet-400/20 to-transparent blur-2xl pointer-events-none" />

                  {/* Badge Illustration */}
                  <div className="relative flex h-32 w-32 items-center justify-center my-3">
                    {form.image_url && !previewImgError ? (
                      <img
                        src={form.image_url}
                        alt="Preview badge"
                        onError={() => setPreviewImgError(true)}
                        className="h-28 w-28 object-contain drop-shadow-xl transition-transform hover:scale-105"
                      />
                    ) : (
                      <Award className="h-28 w-28 text-amber-500 drop-shadow-lg" />
                    )}
                  </div>

                  {/* Upper Tagline */}
                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                    {form.criterion === "course_xp"
                      ? "Course badge earned"
                      : "Topic badge earned"}
                  </p>

                  {/* Title */}
                  <h3 className="text-xl font-extrabold text-heading line-clamp-2 px-2">
                    {form.name || "Badge Title Here"}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs text-body line-clamp-3 min-h-[2.5rem] px-2 leading-relaxed">
                    {form.description ||
                      "Congratulations! Your hard work is paying off."}
                  </p>

                  {/* Mock "Awesome!" Button matching CompleteSuccessModal */}
                  <div className="mt-5 w-full">
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-xl bg-violet-600 py-3 text-xs font-bold text-white shadow-md shadow-violet-500/20"
                    >
                      Awesome!
                    </button>
                  </div>
                </div>
              ) : (
                /* View 2: Compact Badge Card in Portfolio / Trophy Room */
                <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-[0_4px_0_0_var(--border)] flex items-start gap-4 my-auto">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 border border-brand-200 dark:bg-brand-900/30 dark:border-brand-800 p-2">
                    {form.image_url && !previewImgError ? (
                      <img
                        src={form.image_url}
                        alt="Badge"
                        onError={() => setPreviewImgError(true)}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Award className="h-8 w-8 text-amber-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-heading truncate">
                      {form.name || "Badge Name"}
                    </h4>
                    <p className="text-xs text-subtitle line-clamp-2 mt-0.5">
                      {form.description ||
                        "Student achievements will appear here."}
                    </p>
                    <span className="badge mt-2 border-brand-300 text-brand-700 bg-brand-50 dark:border-brand-800 dark:text-brand-300 dark:bg-brand-900/40 font-semibold">
                      Active Award
                    </span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-caption text-center mt-3">
                Students unlock this celebration modal the moment they meet the
                requirement.
              </p>
            </div>
          </form>

          {/* Modal Action Footer */}
          <DialogFooter className="p-4 px-6 border-t border-border bg-card sm:justify-between">
            <Button
              type="button"
              variant="default"
              onClick={() => setShowForm(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              form="badge-form"
              disabled={busy || !courses.length}
              className="gap-2"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving Badge...
                </>
              ) : (
                "Create & Activate Badge"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Classroom Badges Rules Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <div className="col-span-full flex items-center justify-center p-12 text-sm text-subtitle">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
            Loading badges...
          </div>
        )}

        {!loading && !rules.length && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12 text-center bg-card">
            <Award className="h-10 w-10 text-caption mb-2" />
            <h3 className="font-bold text-heading">No badges created yet</h3>
            <p className="text-sm text-subtitle max-w-sm mt-1">
              Create your first badge rule to reward students as they progress.
            </p>
          </div>
        )}

        {rules.map((rule) => (
          <article
            key={rule.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-[0_4px_0_0_var(--border)] transition-all hover:shadow-[0_6px_0_0_var(--border)] hover:-translate-y-px"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 border border-brand-200 dark:bg-brand-900/30 dark:border-brand-800 p-2.5">
                {rule.image_url ? (
                  <img
                    src={rule.image_url}
                    alt={rule.name}
                    className="h-full w-full object-contain drop-shadow-xs"
                  />
                ) : (
                  <Award className="h-7 w-7 text-amber-500 drop-shadow-xs" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-heading truncate">
                    {rule.name}
                  </h3>
                  <span
                    title={rule.is_active ? "Active" : "Paused"}
                    className={`inline-block h-2.5 w-2.5 rounded-full ${
                      rule.is_active ? "bg-leaf-600" : "bg-muted-foreground/40"
                    }`}
                  />
                </div>
                <p className="text-xs text-subtitle line-clamp-2 mt-1">
                  {rule.description || "No description provided."}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-caption truncate max-w-[170px] font-medium">
                {rule.criterion === "topic_mastered"
                  ? `Master: ${topics.find((t) => t.id === rule.topic_id)?.title ?? "Topic"}`
                  : rule.criterion === "topic_completed"
                    ? `Complete: ${topics.find((t) => t.id === rule.topic_id)?.title ?? "Topic"}`
                    : `${rule.xp_target} XP in Course`}
              </span>

              <Button
                variant="ghost"
                size="xs"
                disabled={busy}
                type="button"
                onClick={() => toggle(rule)}
                className={
                  rule.is_active
                    ? "text-caption hover:text-heading"
                    : "text-primary hover:text-brand-700"
                }
              >
                {rule.is_active ? "Pause" : "Resume"}
              </Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
