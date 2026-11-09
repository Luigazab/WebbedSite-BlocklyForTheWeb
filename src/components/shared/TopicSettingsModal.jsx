import React, { useState } from "react";
import { supabase } from "@/supabaseClient";
import { Button } from "#components/ui/button";
import { LessonTypeBadge } from "#components/common/LessonChip";
import { 
  X, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  Loader2 
} from "lucide-react";

export default function TopicSettingsModal({ isOpen, onClose, topic, onSaved }) {
  if (!isOpen || !topic) return null;

  // Local Form State
  const [title, setTitle] = useState(topic.title || "");
  const [description, setDescription] = useState(topic.description || "");
  const [lessons, setLessons] = useState(
    [...(topic.lessons || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
  );
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reorder helper
  const moveLesson = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const updated = [...lessons];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);

    // Re-index orders sequentially
    const reordered = updated.map((l, idx) => ({ ...l, order: idx + 1 }));
    setLessons(reordered);
  };

  // Lesson field update
  const updateLessonField = (lessonId, patch) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, ...patch } : l))
    );
  };

  // Save all changes
  const handleSave = async () => {
    if (!title.trim()) {
      setError("Topic title cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // 1. Update Topic metadata
      const { error: topicErr } = await supabase
        .from("topics")
        .update({
          title: title.trim(),
          description: description.trim(),
        })
        .eq("id", topic.id);

      if (topicErr) throw topicErr;

      // 2. Batch/Parallel update lessons progression & ordering
      const lessonUpdates = lessons.map((l, idx) =>
        supabase
          .from("lessons")
          .update({
            order: idx + 1,
            topic_track: l.topic_track || "core",
            required_for_topic: l.topic_track === "core" ? Boolean(l.required_for_topic) : false,
            expected_minutes: Number(l.expected_minutes) || 15,
          })
          .eq("id", l.id)
          .is("classroom_id", null)
      );

      const results = await Promise.all(lessonUpdates);
      const firstFailure = results.find((r) => r.error);
      if (firstFailure?.error) throw firstFailure.error;

      onSaved();
      onClose();
    } catch (err) {
      console.error("Save topic settings error:", err);
      setError(err.message || "Failed to save topic changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/40">
          <div>
            <h2 className="text-lg font-bold font-display flex items-center gap-2 text-foreground">
              <Layers className="size-5 text-primary" /> Topic Settings & Progression
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Edit topic info, rearrange sequence, and set progression prerequisites.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Topic Info */}
          <div className="space-y-4 rounded-xl border border-border bg-background p-4 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1">
                  Topic Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                  placeholder="e.g. Introduction to Variables"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="What will students learn in this topic?"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Lesson Order & Progression */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Lessons Progression & Track Allocation
                </h3>
                <p className="text-xs text-muted-foreground">
                  Required core lessons advance the classroom. Practice tracks remain optional.
                </p>
              </div>
              <span className="text-xs font-medium bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
              </span>
            </div>

            {lessons.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No lessons found in this topic yet. Add lessons to configure progression.
              </div>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                {lessons.map((lesson, idx) => {
                  const isCore = (lesson.topic_track || "core") === "core";

                  return (
                    <div
                      key={lesson.id}
                      className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                    >
                      {/* Left: Reorder controls + Title */}
                      <div className="flex items-center gap-3 min-w-[220px] flex-1">
                        {/* Order buttons */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0 || saving}
                            onClick={() => moveLesson(idx, -1)}
                            className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Up"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === lessons.length - 1 || saving}
                            onClick={() => moveLesson(idx, 1)}
                            className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Down"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                        </div>

                        {/* Order Index */}
                        <span className="text-xs font-mono font-semibold text-muted-foreground w-5 text-center">
                          {idx + 1}
                        </span>

                        <LessonTypeBadge type={lesson.type} />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate text-foreground">
                            {lesson.title}
                          </p>
                          <span className="text-[11px] text-muted-foreground">
                            {lesson.base_xp} XP {!lesson.is_published && "• Draft"}
                          </span>
                        </div>
                      </div>

                      {/* Right: Progression Settings */}
                      <div className="flex flex-wrap items-center gap-3 pl-8 md:pl-0">
                        {/* Track selector */}
                        <div>
                          <select
                            aria-label={`Track for ${lesson.title}`}
                            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-primary/40 focus:outline-none"
                            value={lesson.topic_track || "core"}
                            disabled={saving}
                            onChange={(e) => {
                              const track = e.target.value;
                              updateLessonField(lesson.id, {
                                topic_track: track,
                                required_for_topic: track === "core" ? lesson.required_for_topic : false,
                              });
                            }}
                          >
                            <option value="core">Core Track</option>
                            <option value="beginner">Beginner Practice</option>
                            <option value="intermediate">Intermediate Practice</option>
                            <option value="advanced">Advanced Practice</option>
                          </select>
                        </div>

                        {/* Required switch */}
                        <label className={`flex items-center gap-1.5 text-xs select-none ${!isCore ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
                          <input
                            type="checkbox"
                            disabled={saving || !isCore}
                            checked={Boolean(lesson.required_for_topic)}
                            onChange={(e) =>
                              updateLessonField(lesson.id, { required_for_topic: e.target.checked })
                            }
                            className="rounded border-border text-primary focus:ring-primary size-3.5"
                          />
                          <span className="font-medium text-foreground">Required</span>
                        </label>

                        {/* Minutes target */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="size-3.5" />
                          <input
                            type="number"
                            min="1"
                            max="240"
                            disabled={saving}
                            value={lesson.expected_minutes || 15}
                            onChange={(e) =>
                              updateLessonField(lesson.id, {
                                expected_minutes: Math.max(1, Math.min(240, Number(e.target.value) || 1)),
                              })
                            }
                            className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                          />
                          <span>min</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-muted/20">
          <Button variant="formalPlain" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="formalPrimary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}