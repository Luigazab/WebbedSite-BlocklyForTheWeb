import Loader from "../../components/layout/Loader";
import LectureContent from "./LectureContent";
import QuizContent from "./QuizContent";
import TutorialViewer from "../../dashboards/student/pages/TutorialViewer";
import LaboratoryViewer from "../../dashboards/student/pages/LaboratoryViewer";
import { useNavigate, useParams } from "react-router";
import { useLesson } from "../../hooks/useLesson";

const LessonPage = () => {
  const { lesson, navigation, isLoading, error } = useLesson();
  const navigate    = useNavigate();
  const { courseSlug } = useParams();

  if (isLoading) return <Loader />;
  if (error)     return <div className="text-red-500 p-8">{error.message}</div>;
  if (!lesson)   return <div className="p-8">Lesson not found.</div>;

  const handleNext = (destination) => {
    if (destination === "topic" || (!navigation?.next && destination !== "next")) {
      navigate(`/student/learn/${courseSlug}`);
    } else if (navigation?.next) {
      navigate(navigation.next);
    } else {
      navigate(`/student/learn/${courseSlug}`);
    }
  };

  const handlePrevious = () => {
    if (navigation?.previous) navigate(navigation.previous);
  };

  const renderContent = () => {
    switch (lesson.type) {
      case "lecture":
        return (
          <LectureContent
            lesson={lesson}
            onNext={handleNext}
            onPrevious={handlePrevious}
            navigation={navigation}
          />
        );
      case "quiz":
        return (
          <QuizContent
            lesson={lesson}
            onNext={handleNext}
            navigation={navigation}
          />
        );
      case "tutorial":
        return <TutorialViewer tutorialIdOverride={lesson.tutorial?.id} />;
      case "laboratory":
        return (
          <LaboratoryViewer
            lesson={lesson}
            onNext={handleNext}
            onPrevious={handlePrevious}
            navigation={navigation}
          />
        );
      default:
        return <div className="p-8">Unknown lesson type: {lesson.type}</div>;
    }
  };

  return (
    <div
      className="relative min-h-[99%] inset-0 z-0"
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
      <div className="relative z-10">
        <div className="flex sticky top-0 justify-between items-baseline border-b bg-white border-slate-200 px-4 py-2">
          <h2 className="font-bold tracking-widest text-xl text-slate-500">
            {lesson.topic.title}
          </h2>
          <h2 className="font-semibold tracking-tight text-xs text-slate-400 uppercase truncate max-w-md">
            {lesson.topic.description}
          </h2>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default LessonPage;
