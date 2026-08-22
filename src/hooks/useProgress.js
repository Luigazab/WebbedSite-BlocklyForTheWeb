import { useProgressStore } from '../store/progressStore'
import { useCurriculumStore } from '../store/curriculumStore'
import { useAuthStore } from '../store/authStore'
import { useClassroomStore } from '../store/classroomStore'
import { toast } from 'sonner'

export function useProgress() {
  const store = useProgressStore()
  const profile = useAuthStore((state) => state.profile)
  const studentClassroom = useClassroomStore((state) => state.studentClassroom)
  const refreshCurriculum = useCurriculumStore((state) => state.refreshCurriculum)

  const classroomId = studentClassroom?.id ?? null
  const courseId = studentClassroom?.classroomCourse?.course_id ?? null

  const fetchStudentProgress = async () => {
    if (!profile?.id || !classroomId) return
    try {
      await store.fetchStudentProgress(profile.id, classroomId)
    } catch (err) {
      toast.error('Failed to load your progress')
    }
  }

  const fetchLessonProgress = async (lessonId) => {
    if (!profile?.id) return
    return store.fetchLessonProgress(profile.id, lessonId)
  }

  const resyncCurriculum = () => {
    if (classroomId) refreshCurriculum(classroomId)
  }

  const handleCompleteLesson = async ({ lessonId, topicId, baseXp }) => {
    if (!profile?.id || !classroomId) return
    try {
      const result = await store.completeLesson({
        userId: profile.id, classroomId, courseId, lessonId, topicId, baseXp,
      })
      toast.success(`+${baseXp} XP!`)
      resyncCurriculum()
      return result
    } catch (err) {
      toast.error('Failed to save your progress')
      throw err
    }
  }

  const handleStartQuiz = async (quizId) => {
    if (!profile?.id) return
    try {
      return await store.startQuizAttempt(profile.id, quizId)
    } catch (err) {
      toast.error('Failed to start quiz')
      throw err
    }
  }

  const handleSubmitQuiz = async ({ attemptId, answers, lessonId, topicId, baseXp, passingScore }) => {
    if (!profile?.id || !classroomId) return
    try {
      const result = await store.submitQuizAttempt({
        attemptId, answers, userId: profile.id, classroomId, courseId, lessonId, topicId, baseXp, passingScore,
      })
      if (result.passed) {
        toast.success(`Passed with ${result.score}%! +${baseXp} XP`)
        resyncCurriculum()
      } else {
        toast.error(`Scored ${result.score}% — try again!`)
      }
      return result
    } catch (err) {
      toast.error('Failed to submit quiz')
      throw err
    }
  }

  const handleCompleteLaboratory = async ({ laboratoryId, lessonId, topicId, baseXp }) => {
    if (!profile?.id || !classroomId) return
    try {
      const result = await store.completeLaboratory({
        userId: profile.id, classroomId, courseId, laboratoryId, lessonId, topicId, baseXp,
      })
      toast.success(`+${baseXp} XP!`)
      resyncCurriculum()
      return result
    } catch (err) {
      toast.error('Failed to save lab progress')
      throw err
    }
  }

  const handleCompleteTutorialStep = async ({ stepId, isBlock }) => {
    if (!profile?.id) return
    try {
      await store.completeTutorialStep({ userId: profile.id, stepId, isBlock })
    } catch (err) {
      toast.error('Failed to save step progress')
      throw err
    }
  }

  const getStepStartingContent = async ({ tutorialId, currentOrder, fileId, isBlock }) => {
    if (!profile?.id) return null
    try {
      return await store.getStepStartingContent({
        userId: profile.id, tutorialId, currentOrder, fileId, isBlock,
      })
    } catch (err) {
      toast.error('Failed to load starting file')
      throw err
    }
  }

  return {
    studentProgress: store.studentProgress,
    lessonProgress:  store.lessonProgress,
    actionLoading:   store.actionLoading,

    fetchStudentProgress,
    fetchLessonProgress,
    handleCompleteLesson,
    handleStartQuiz,
    handleSubmitQuiz,
    handleCompleteLaboratory,
    handleCompleteTutorialStep,
    getStepStartingContent,
  }
}