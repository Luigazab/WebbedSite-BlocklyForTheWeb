import { lessonTypeMeta } from "@/lib/lesson-type";
import { BookOpen, ClipboardCheck, MonitorPlay, FlaskConical } from "lucide-react"; // or wherever your icons come from

const tokenBg = {
  lecture: "bg-sky-500/15 text-sky-500 ring-sky-500/25",
  quiz: "bg-amber-500/15 text-amber-500 ring-amber-500/30",
  tutorial: "bg-purple-500/15 text-purple-500 ring-purple-500/25",
  laboratory: "bg-green-500/15 text-green-700 ring-green-500/25",
};

const lessonIcons = {
  lecture: <BookOpen className="w-5 h-5 text-blue-500" />,
  quiz: <ClipboardCheck className="w-5 h-5 text-red-500" />,
  tutorial: <MonitorPlay className="w-5 h-5 text-purple-500" />,
  laboratory: <FlaskConical className="w-5 h-5 text-green-700" />,
};

export function LessonChip({ type, size = "md" }) {
  const meta = lessonTypeMeta[type];
  return (
    <span className="items-center flex flex-col">
      {lessonIcons[type]}
      <span
        className={`gap-1.5 rounded-md ring-1 ring-inset font-medium tracking-wide ${tokenBg[type]} ${
          size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
        }`}
      >
        {meta.label}
      </span>
    </span>
  );
}

export function LessonTypeBadge({ type }) {
  const meta = lessonTypeMeta[type];
  return (
    <div
      className={`grid size-10 place-items-center rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest ring-1 ring-inset ${tokenBg[type]}`}
    >
      {lessonIcons[type]}
    </div>
  );
}