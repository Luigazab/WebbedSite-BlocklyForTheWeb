import { Calendar, ChevronRight } from "lucide-react";
import { useLectureViewer } from "@/hooks/useLectureViewer";
import CompleteSuccessModal from "../../components/app/CompleteSuccessModal";
import { useState } from "react";
import Loader from "../../components/layout/Loader";

const LectureContent = ({ lessonId, onNext, onPrevious, navigation }) => {
  const { lecture, loading, completing, finishLecture } = useLectureViewer(lessonId);
  const [showModal, setShowModal] = useState(false);

  const handleFinishClick = async () => {
    await finishLecture();
    setShowModal(true);
  };

  const handleRemain = () => setShowModal(false);
  const handleGoToTopic = () => { setShowModal(false); onNext?.("topic"); };
  const handleGoToNext = () => { setShowModal(false); onNext?.("next"); };

  if (loading || !lecture) return <Loader />;

  return (
    <div className="space-y-4 max-w-2xl mx-auto py-6">
      <h1 className="text-center font-bold text-4xl font-sans! border-b border-slate-400 pb-4">
        {lecture.title}
      </h1>

      <div className="flex flex-wrap justify-between items-center gap-x-5 gap-y-2 py-2 text-sm text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>Posted {new Date(lecture.createdAt).toLocaleDateString()}</span>
        </div>
        {lecture.author && (
          <div className="flex items-center gap-2">
            <img
              src={lecture.author.avatarUrl || "/profile.svg"}
              className="w-6 h-6 rounded-full object-cover border border-gray-200"
              alt=""
            />
            <span className="font-bold text-gray-700">{lecture.author.username}</span>
          </div>
        )}
      </div>

      {lecture.lecture?.video_src && (
        <div className="w-full aspect-video border-2 p-2 border-slate-200 rounded-2xl shadow bg-white">
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
        <div className="rounded-2xl p-8 bg-white shadow my-2 border border-slate-200">
          <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: lecture.lecture.content }} />
        </div>
      )}

      {lecture.lecture?.file_url && (
        <details className="rounded-2xl bg-white shadow border border-slate-200">
          <summary className="cursor-pointer flex items-center justify-between font-semibold px-4 py-2 transition-colors">
            <span className="p-4 font-bold tracking-widest">View Attached File</span>
            <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
          </summary>
          <div className="mt-4 w-full aspect-4/3 rounded-2xl shadow">
            <iframe src={lecture.lecture.file_url} className="w-full h-full rounded-2xl" frameBorder="0" />
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
          {completing ? "Saving…" : navigation?.next ? "Next Lesson" : "Finish Topic"}
          {!completing && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      <CompleteSuccessModal
        isOpen={showModal}
        onClose={handleRemain}
        onRemain={handleRemain}
        onSubmitToTopic={handleGoToTopic}
        onSubmitToNext={navigation?.next ? handleGoToNext : handleGoToTopic}
        title="Lecture Complete!"
        message="Great job finishing this lecture. What would you like to do next?"
      />
    </div>
  );
};

export default LectureContent;