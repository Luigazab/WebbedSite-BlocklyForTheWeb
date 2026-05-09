import { ArrowLeft, CheckCircle, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useLesson } from "../../hooks/useLesson";
import Loader from "../../components/layout/Loader";
import LectureContent from "./LectureContent";
import QuizContent from "./QuizContent";
// import TutorialContent from "./TutorialContent";

const LessonPage = () => {
  const { lesson, navigation, isLoading, error } = useLesson();
  const navigate = useNavigate();
  const { courseSlug } = useParams();

  if (isLoading) return <Loader />;
  if (error)     return <div className="text-red-500 p-8">{error.message}</div>;
  if (!lesson)   return <div className="p-8">Lesson not found.</div>;

  const handleNext = () => {
    if (navigation.next) navigate(navigation.next);
    else navigate(`/student/learn/${courseSlug}`);
  };

  const handlePrevious = () => {
    if (navigation.previous) navigate(navigation.previous);
  };

  const renderContent = () => {
    switch (lesson.type) {
      case 'lecture':    return <LectureContent    lesson={lesson} />;
      case 'quiz':       return <QuizContent       lesson={lesson} onFinish={handleNext} />;
      // case 'tutorial':   return <TutorialContent   lesson={lesson} />;
      // case 'laboratory': return <TutorialContent   lesson={lesson} />;
      default:           return <div>Unknown type</div>;
    }
  };

  return (
    <div className='relative min-h-[99%] inset-0 z-0'
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
              radial-gradient(circle 500px at 20% 80%, rgba(139,92,246,0.3), transparent),
              radial-gradient(circle 500px at 80% 20%, rgba(59,130,246,0.3), transparent)
            `,
            backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
          }}
    >
      <div className='relative z-10'>
        {/* Shared sticky header */}
        <div className='flex sticky top-0 justify-between items-baseline border-b bg-white border-slate-200 px-4 py-2'>
          <h2 className='font-bold tracking-widest text-xl text-slate-500'>{lesson.topic.title}</h2>
          <h2 className='font-semibold tracking-tight text-xs text-slate-400 uppercase truncate max-w-md'>{lesson.topic.description}</h2>
        </div>

        {/* Content area — each type fills this */}
        {renderContent()}

        {/* Shared prev/next — quiz might override this with its own finish button */}
        {lesson.type !== 'quiz' && (
          <div className='flex justify-between font-bold mt-8 p-4 max-w-5xl mx-auto'>
            <button onClick={handlePrevious} disabled={!navigation.previous}
              className='btn px-10 btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'>
              <ArrowLeft /> Previous
            </button>
            <button onClick={handleNext}
              className='btn px-10 btn-primary flex items-center gap-2'>
              {navigation.next ? 'Next Lesson' : 'Finish Topic'}
              {navigation.next ? <ChevronRight /> : <CheckCircle />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default LessonPage;