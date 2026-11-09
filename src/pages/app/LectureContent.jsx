import { Calendar, ChevronRight } from "lucide-react";
import { useLectureViewer } from "@/hooks/useLectureViewer";
import Loader from "../../components/layout/Loader";

const LectureContent = ({ lessonId, onNext, onPrevious, navigation, onCompleted, preview = false }) => {
  const { lecture, loading, completing, finishLecture } = useLectureViewer(lessonId);

  const handleFinishClick = async () => {
    if (preview) { onNext?.("next"); return; }
    if (await finishLecture()) await onCompleted?.();
  };

  if (loading || !lecture) return <Loader />;

  return (
    <div className="space-y-4 max-w-2xl mx-auto py-6">
      <h1 className="text-center font-bold text-4xl font-sans! border-b border-slate-400 pb-4">
        {lecture.title}
      </h1>

      <div className="flex flex-wrap justify-between items-center gap-x-5 gap-y-2 py-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>Posted {new Date(lecture.createdAt).toLocaleDateString()}</span>
        </div>
        {lecture.author && (
          <div className="flex items-center gap-2">
            <img
              src={lecture.author.avatarUrl || "/profile.svg"}
              className="w-6 h-6 rounded-full object-cover border border-border"
              alt=""
            />
            <span className="font-bold text-foreground">{lecture.author.username}</span>
          </div>
        )}
      </div>

      {lecture.lecture?.video_src && (
        <div className="w-full aspect-video border-2 p-2 border-border rounded-2xl shadow bg-card">
          <iframe
            className="w-full h-full rounded-2xl"
            src={lecture.lecture.video_src}
            title={lecture.title}
            frameBorder="0"
            allowFullScreen
          />
        </div>
      )}

      {lecture.lecture?.content && (
        <div className="rounded-2xl p-8 bg-card shadow my-2 border border-border">
          <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: lecture.lecture.content }} />
        </div>
      )}

      {lecture.lecture?.file_url && (
        <details className="rounded-2xl bg-card shadow border border-border">
          <summary className="cursor-pointer flex items-center justify-between font-semibold px-4 py-2 transition-colors">
            <span className="p-4 font-bold tracking-widest">View Attached File</span>
            <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
          </summary>
          <div className="mt-4 w-full aspect-4/3 rounded-2xl shadow">
            <iframe title="Attached lecture document" src={lecture.lecture.file_url} className="w-full h-full rounded-2xl" frameBorder="0" />
          </div>
        </details>
      )}

      <div className="flex justify-between font-bold mt-8 pb-8">
        <button
          onClick={onPrevious}
          disabled={!navigation?.previous}
          className="btn px-10 btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button
          onClick={handleFinishClick}
          disabled={completing}
          className="btn px-10 btn-primary flex items-center gap-2 disabled:opacity-60"
        >
          {completing ? "Saving…" : navigation?.next ? "Mark complete & continue" : "Mark lecture complete"}
          {!completing && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>


    </div>
  );
};

export default LectureContent;