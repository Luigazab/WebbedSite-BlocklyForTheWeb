import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  BookOpen,
  ChevronRight,
  Loader2,
  LogOut,
  Plus,
  Users,
} from "lucide-react";
import DeleteModal from "#components/ui/DeleteModal";
import { getClassroomTopicFlow } from "../../../services/classroomFlowService";
import { useAuthStore } from "../../../store/authStore";
import { useClassroomStore } from "../../../store/classroomStore";
import JoinClassroomModal from "../components/JoinClassroomModal";
import { summarizeStudentLessons } from "../utils/classroomProgress";
import { PageHeader } from "#components/common/PageHeader";
import { Button } from "#components/ui/button";

function MyClassroomCard({ classroom, progress, progressLoading, onLeave }) {
  const summary = summarizeStudentLessons(progress);
  const percent = summary.total
    ? Math.round((summary.completed / summary.total) * 100)
    : 0;

  return (
    <article className="lg:flex gap-10 w-full max-w-7xl mx-auto rounded-2xl border border-b-8 border-border bg-card p-6 shadow-sm">
      <div className="flex-1 flex flex-col justify-between gap-4 h-full">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-blockly-purple">
            Your classroom
          </p>
          <h2 className="mt-2 text-2xl font-black text-foreground">
            {classroom.name}
          </h2>
          {classroom.description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {classroom.description}
            </p>
          )}
          {classroom.teacher && (
            <div className="flex gap-3 items-center mt-3">
              <img
                src={classroom.teacher.avatar_url || "/default-avatar.png"}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="badge bg-primary text-primary-foreground w-fit">
                  Teacher
                </p>
                <p>{classroom.teacher.username || ""}</p>
              </div>
            </div>
          )}
        </div>
        {progress && (
          <div className="mt-5">
            <div className="flex justify-between gap-3 text-sm">
              <span className="font-medium text-gray-600">
                Your core lesson progress
              </span>
              <span className="font-bold text-blockly-purple">
                {summary.completed} of {summary.total}
              </span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-label="Your required core lesson progress"
              aria-valuenow={summary.completed}
              aria-valuemin={0}
              aria-valuemax={summary.total || 1}
            >
              <div
                className="h-full bg-blockly-purple"
                style={{ width: `${percent}%` }}
              />
            </div>
            {summary.currentTopic && (
              <p className="mt-2 text-xs text-muted-foreground">
                Current topic: {summary.currentTopic}
              </p>
            )}
            {!summary.total && (
              <p className="mt-2 text-xs text-muted-foreground">
                Your teacher has not opened any required core lessons yet.
              </p>
            )}
          </div>
        )}
        <div className="flex-1 flex gap-2">
          <Button type="button" onClick={onLeave} variant="danger">
            <LogOut size={16} /> Leave
          </Button>

          <Link to={`/student/classrooms/${classroom.id}`} className="flex-2/3">
            <Button variant="primary" className="w-full">
              Open classroom <ChevronRight size={17} />
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex-1.5 mt-6 grid gap-3 sm:grid-cols-3">
        <div className="flex lg:flex-col gap-4 justify-between rounded-xl bg-success/30 p-4">
          <div>
            <p className="text-4xl font-black text-foreground">
              {classroom.member_count ?? 0}
            </p>
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Classmates
            </p>
          </div>
          <img
            src="/teacher.png"
            alt="classmates count"
            className="self-center max-h-15 lg:max-h-50"
          />
        </div>
        <div className="flex lg:flex-col gap-4 justify-between rounded-xl bg-secondary/30 p-4">
          <div>
            <p className="text-4xl font-black text-foreground">
              {progressLoading
                ? "…"
                : progress
                  ? `${summary.completed}/${summary.total}`
                  : "—"}
            </p>
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Your required core lessons
            </p>
          </div>
          <img
            src="/lesson.png"
            alt=""
            className="self-center max-h-15 lg:max-h-50"
          />
        </div>
        <div className="flex lg:flex-col gap-4 justify-between rounded-xl bg-destructive/20 p-4">
          <div>
            <p className="text-4xl font-black text-foreground">
              {progressLoading ? "…" : progress ? summary.openTopics : "—"}
            </p>
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Open topics
            </p>
          </div>
          <img
            src="/topic.png"
            alt=""
            className="self-center max-h-15 lg:max-h-50"
          />
        </div>
      </div>
    </article>
  );
}

export default function StudentClassrooms() {
  const profile = useAuthStore((state) => state.profile);
  const {
    studentClassroom,
    loading,
    actionLoading,
    error,
    fetchStudentClassroom,
    joinClassroom,
    leaveClassroom,
  } = useClassroomStore();
  const [showJoin, setShowJoin] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    let active = true;
    fetchStudentClassroom(profile.id)
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [profile?.id, fetchStudentClassroom]);

  useEffect(() => {
    if (!studentClassroom?.id) return;
    let active = true;
    const refresh = () => {
      setProgressLoading(true);
      getClassroomTopicFlow(studentClassroom.id)
        .then((flow) => {
          if (active) setProgress({ classroomId: studentClassroom.id, flow });
        })
        .catch(() => {
          if (active)
            setProgress({ classroomId: studentClassroom.id, flow: null });
        })
        .finally(() => {
          if (active) setProgressLoading(false);
        });
    };
    queueMicrotask(refresh);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
    };
  }, [studentClassroom?.id]);

  const onJoin = async (code) => {
    await joinClassroom(profile.id, code);
    setShowJoin(false);
  };
  const onLeave = async () => {
    await leaveClassroom(profile.id, studentClassroom.id);
    setShowLeave(false);
  };
  const visibleProgress =
    progress && studentClassroom && progress.classroomId === studentClassroom.id
      ? progress.flow
      : null;

  return (
    <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="My Classroom"
        description="Work through core lessons with your class."
        actions={
          !studentClassroom && {
            label: "Join classroom",
            icon: <Plus size={16} />,
            onClick: () => setShowJoin(true),
          }
        }
      />
      {!ready || loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blockly-purple" />
        </div>
      ) : error && !studentClassroom ? (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
          {error}
          <button
            type="button"
            onClick={() => fetchStudentClassroom(profile.id).catch(() => {})}
            className="ml-3 underline"
          >
            Try again
          </button>
        </div>
      ) : studentClassroom ? (
        <MyClassroomCard
          classroom={studentClassroom}
          progress={visibleProgress}
          progressLoading={
            progressLoading || progress?.classroomId !== studentClassroom.id
          }
          onLeave={() => setShowLeave(true)}
        />
      ) : (
        <div className="rounded-2xl border bg-white px-6 py-16 text-center">
          <BookOpen className="mx-auto text-blockly-purple" size={42} />
          <h2 className="mt-4 text-xl font-bold">
            You’re not in a classroom yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ask your teacher for a six-character classroom code.
          </p>
          <button
            type="button"
            onClick={() => setShowJoin(true)}
            className="mt-5 rounded-lg bg-blockly-purple px-5 py-2 text-sm font-semibold text-white"
          >
            Join a classroom
          </button>
        </div>
      )}
      {showJoin && (
        <JoinClassroomModal
          loading={actionLoading}
          onSubmit={onJoin}
          onClose={() => setShowJoin(false)}
        />
      )}
      {showLeave && studentClassroom && (
        <DeleteModal
          isOpen
          onClose={() => setShowLeave(false)}
          onConfirm={onLeave}
          title="Leave classroom?"
          message={`You'll leave “${studentClassroom.name}”. You can rejoin with a code from your teacher.`}
          confirmText="Leave"
          loading={actionLoading}
        />
      )}
    </div>
  );
}
