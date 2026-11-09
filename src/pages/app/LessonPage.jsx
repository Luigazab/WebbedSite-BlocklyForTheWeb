import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import CompleteSuccessModal from '../../components/app/CompleteSuccessModal';
import { getCompletionRewards, queueBadges } from '../../services/completionRewardsService';
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
  const userId = useAuthStore(state => state.user?.id);
  const [completion, setCompletion] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const [rewardError, setRewardError] = useState('');
  const rewardBusy = useRef(false);
  const onCompleted = async () => {
    if (preview || rewardBusy.current) return;
    rewardBusy.current = true;
    try {
      const result = await getCompletionRewards(lesson.id);
      if (!result.completed) return;
      queueBadges(userId, classroomId, result.awards ?? []);
      setCompletion(result);
      setRewardError('');
      setCelebrating(true);
    } catch {
      setRewardError('Your work was saved, but reward details could not load. Retry to view your completion.');
    } finally { rewardBusy.current = false; }
  };
  const leaveCelebration = (continueLesson) => {
    setCelebrating(false);
    setTimeout(() => {
      if (continueLesson && navigation?.next && !completion?.topic_complete) handleNext('next');
      else navigate(coursePath, { state: { badgeAwards: completion?.awards ?? [] } });
      setCompletion(null);
    }, 250);
  };
  const celebration = <>
    {rewardError && <div role="alert" className="fixed inset-x-4 top-4 z-[110] rounded-xl border bg-card p-4 shadow-lg">{rewardError}<button className="ml-3 font-bold text-violet-700 dark:text-violet-300 underline" onClick={onCompleted}>Retry</button><button className="ml-3 underline" onClick={handleBack}>Back to classroom</button></div>}
    <CompleteSuccessModal isOpen={celebrating} onExit={() => leaveCelebration(false)} onContinue={() => leaveCelebration(true)} earnedXp={completion?.earned_xp ?? 0} lastLesson={!navigation?.next || completion?.topic_complete} message={lesson?.type === 'laboratory' ? 'Submitted! You can continue while your teacher reviews your work.' : undefined} />
  </>;

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
            onCompleted={onCompleted}
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
            onCompleted={onCompleted}
            onNext={handleNext}
            navigation={navigation}
          />
        );
      case "tutorial":
        return <TutorialViewer key={lesson.id} tutorialIdOverride={lesson.tutorial?.id} preview={preview} onCompleted={onCompleted} onBack={handleBack} />;
      case "laboratory":
        return (
          <LaboratoryViewer
            key={lesson.id}
            preview={preview}
            onCompleted={onCompleted}
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
  if (lesson.type === 'tutorial' || lesson.type === 'laboratory') return <>{renderContent()}{celebration}</>;

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
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
          <Link to={coursePath} className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary"><ArrowLeft size={16} />{backLabel}</Link>
          <div className="min-w-0 flex-1"><h2 className="font-bold text-foreground">{lesson.topic.title}</h2><p className="truncate text-xs text-muted-foreground">{lesson.topic.description}</p></div>
          {preview && <span className="text-xs text-muted-foreground">Student preview · Progress is not saved</span>}
        </header>
        {renderContent()}
        {celebration}
      </div>
    </div>
  );
};

export default LessonPage;
