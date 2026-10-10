import Loader from "../../components/layout/Loader";
import LectureContent from "./LectureContent";
import QuizContent from "./QuizContent";
import TutorialViewer from "../../dashboards/student/pages/TutorialViewer";
import LaboratoryViewer from "../../dashboards/student/pages/LaboratoryViewer";
import { Link, useNavigate, useParams } from "react-router";
import { useLesson } from "../../hooks/useLesson";
import { classroomPath, coursePreviewPath, lessonPath as studentLessonPath } from '../../utils/lessonRoutes';
import { ArrowLeft } from 'lucide-react';

const LessonPage = ({ preview = false }) => {
  const { lesson, navigation, isLoading, error } = useLesson({ masterOnly: preview });
  const navigate    = useNavigate();
  const { courseSlug, id, classroomId } = useParams();
  const coursePath = preview ? `/teacher/courses/${encodeURIComponent(id)}` : classroomPath(classroomId);
  const lessonPath = (path) => preview
    ? path.replace(studentLessonPath(courseSlug, ''), coursePreviewPath(id, courseSlug, ''))
    : path;
  const backLabel = preview ? 'Back to course' : 'Back to classroom';
  const handleBack = () => navigate(coursePath);

  if (isLoading) return <Loader />;
  if (error || !lesson) return <div className="space-y-4 p-8"><p role="alert" className="text-red-500">{error?.message || 'Lesson not found.'}</p><Link to={coursePath} className="font-semibold text-primary">{backLabel}</Link></div>;

  const handleNext = (destination) => {
    if (destination === "topic" || (!navigation?.next && destination !== "next")) {
      navigate(coursePath);
    } else if (navigation?.next) {
      navigate(lessonPath(navigation.next));
    } else {
      navigate(coursePath);
    }
  };

  const handlePrevious = () => {
    if (navigation?.previous) navigate(lessonPath(navigation.previous));
  };

  const renderContent = () => {
    switch (lesson.type) {
      case "lecture":
        return (
          <LectureContent
            key={lesson.id}
            lessonId={lesson.id}
            preview={preview}
            onNext={handleNext}
            onPrevious={handlePrevious}
            navigation={navigation}
          />
        );
      case "quiz":
        return (
          <QuizContent
            key={lesson.id}
            lessonId={lesson.id}
            preview={preview}
            onNext={handleNext}
            navigation={navigation}
          />
        );
      case "tutorial":
        return <TutorialViewer key={lesson.id} tutorialIdOverride={lesson.tutorial?.id} preview={preview} onBack={handleBack} />;
      case "laboratory":
        return (
          <LaboratoryViewer
            key={lesson.id}
            preview={preview}
            lesson={lesson}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onBack={handleBack}
            navigation={navigation}
          />
        );
      default:
        return <div className="p-8">Unknown lesson type: {lesson.type}</div>;
    }
  };

  // Blockly activities own their full-height workspace and activity toolbar.
  if (lesson.type === 'tutorial' || lesson.type === 'laboratory') return renderContent();

  return (
    <div
      className="relative min-h-dvh z-0"
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
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <Link to={coursePath} className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary"><ArrowLeft size={16} />{backLabel}</Link>
          <div className="min-w-0 flex-1"><h2 className="font-bold text-slate-700">{lesson.topic.title}</h2><p className="truncate text-xs text-slate-400">{lesson.topic.description}</p></div>
          {preview && <span className="text-xs text-muted-foreground">Student preview · Progress is not saved</span>}
        </header>
        {renderContent()}
      </div>
    </div>
  );
};

export default LessonPage;
