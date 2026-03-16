import TeacherLayout from '../dashboards/teacher/TeacherLayout'
import TeacherHome from '../dashboards/teacher/pages/TeacherHome'
import CreateTutorial from '../dashboards/teacher/pages/CreateTutorial'
import TeacherClassrooms from '../dashboards/teacher/pages/Classrooms'
import TeacherClassroomDetail from '../dashboards/teacher/pages/TeacherClassroomDetail'
import TeacherStudentProfile from '../dashboards/teacher/pages/TeacherStudentProfile'
import StudentPerformance from '../dashboards/teacher/pages/StudentPerformance'
import FeedbackPage from '../dashboards/teacher/pages/FeedbackPage'
import ProjectsPage from '../components/shared/ProjectsPage'
import LearnPage from '../components/shared/LearnPage'
import SettingsPage from '../components/shared/SettingsPage'
import ProfilePage from '../dashboards/teacher/pages/TeacherProfile'
import EditorLayout from '../components/layout/EditorLayout'
import BlockEditor from '../components/shared/BlockEditor'
import LessonsPage from '../dashboards/teacher/pages/LessonsPage'
import CreateLessonPage from '../dashboards/teacher/pages/CreateLessonPage'
import QuizzesPage from '../dashboards/teacher/pages/QuizzesPage'
import CreateQuizPage from '../dashboards/teacher/pages/CreateQuizPage'

export const teacherRoutes = [
  {
    element: <TeacherLayout />,
    children: [
      { index: true,                                       element: <TeacherHome /> },
      { path: 'projects',                                  element: <ProjectsPage /> },
      { path: 'learn',                                     element: <LearnPage /> },

      // Lessons
      { path: 'lessons',                                   element: <LessonsPage /> },
      { path: 'lessons/create',                            element: <CreateLessonPage /> },
      { path: 'lessons/:id/edit',                          element: <CreateLessonPage /> },

      // Quizzes
      { path: 'quizzes',                                   element: <QuizzesPage /> },
      { path: 'quizzes/create',                            element: <CreateQuizPage /> },
      { path: 'quizzes/:id/edit',                          element: <CreateQuizPage /> },

      // Tutorials
      { path: 'tutorials/create',                          element: <CreateTutorial /> },
      { path: 'tutorials/:tutorialId/edit',                element: <CreateTutorial /> },

      // Classrooms
      { path: 'classrooms',                                element: <TeacherClassrooms /> },
      { path: 'classrooms/:classroomId',                   element: <TeacherClassroomDetail /> },
      { path: 'classrooms/:classroomId/student/:studentId',element: <TeacherStudentProfile /> },

      // Misc
      { path: 'performance',                               element: <StudentPerformance /> },
      { path: 'feedback',                                  element: <FeedbackPage /> },
      { path: 'profile',                                   element: <ProfilePage /> },
      { path: 'settings',                                  element: <SettingsPage /> },
    ]
  },
  {
    element: <EditorLayout />,
    children: [
      { path: 'editor',     element: <BlockEditor /> },
      { path: 'editor/:id', element: <BlockEditor /> },
    ]
  }
]