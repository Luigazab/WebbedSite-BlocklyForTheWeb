import { lazy } from 'react'
const ReportsPage = lazy(() => import('../components/shared/ReportsPage'))
const StudentLayout = lazy(() => import('../dashboards/student/StudentLayout'))
const StudentHome = lazy(() => import('../dashboards/student/pages/StudentHome'))
const FeedbackPage = lazy(() => import('../dashboards/student/pages/FeedbackPage'))
const ProjectsPage = lazy(() => import('../components/shared/ProjectsPage'))
const SettingsPage = lazy(() => import('../components/shared/SettingsPage'))
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'))
const EditorLayout = lazy(() => import('../components/layout/EditorLayout'))
const BlockEditor = lazy(() => import('../components/shared/BlockEditor'))
const Documentation = lazy(() => import('../components/shared/Documentation'))
const QuizAssessment = lazy(() => import('../dashboards/student/pages/QuizAssessment'))
const QuizResult = lazy(() => import('../dashboards/student/pages/QuizResult'))
import Loader from '../components/layout/Loader'
const WelcomeOnboarding = lazy(() => import('../dashboards/student/pages/WelcomeOnboarding'))
const Background = lazy(() => import('../components/layout/Background'))
const LessonPage = lazy(() => import('../pages/app/LessonPage'))
const LessonLayout = lazy(() => import('../components/layout/LessonLayout'))
const LegacyLessonRedirect = lazy(() => import('../components/layout/LegacyLessonRedirect'))
import { Navigate } from 'react-router'
const StudentClassroomHub = lazy(() => import('@/dashboards/student/pages/StudentClassroomHub'))
const StudentClassrooms = lazy(() => import('@/dashboards/student/pages/StudentClassrooms'))
export const studentRoutes = [
  {
    element: <StudentLayout />,
    children: [
      { index: true,                                        element: <StudentHome />              },
      { path: 'projects',                                   element: <ProjectsPage />             },
      { path: 'classrooms',                                 element: <StudentClassrooms />        },
      { path: 'classrooms/:classroomId',                    element: <StudentClassroomHub /> },
      { path: 'quiz', element: <Navigate to="/student/classrooms" replace /> },
      { path: 'quiz/result', element: <Navigate to="/student/classrooms" replace /> },
      { path: 'docs',                                       element: <Documentation />            },
      { path: 'feedback', element: <Navigate to="/student/help" replace /> },
      { path: 'help', element: <ReportsPage /> },
      { path: 'profile',                                    element: <ProfilePage />              },
      { path: 'settings',                                   element: <SettingsPage />             },
    ]
  },
  {
    element: <LessonLayout />,
    children: [
      { path: 'classrooms/:classroomId/lessons/:courseSlug/:slug', element: <LessonPage /> },
    ]
  },
  { path: 'learn', element: <Navigate to="/student/classrooms" replace /> },
  { path: 'learn/:courseSlug', element: <LegacyLessonRedirect /> },
  { path: 'learn/:courseSlug/:slug', element: <LegacyLessonRedirect /> },
  { path: 'lessons/:courseSlug/:slug', element: <LegacyLessonRedirect /> },
  { path: 'lessonviewer', element: <Navigate to="/student/classrooms" replace /> },
  { path: 'course-select', element: <Navigate to="/student/classrooms" replace /> },
  {
    element: <Background />,
    children: [
      { path: 'loader',                                     element: <Loader />                   },
      { path: 'welcome',                                    element: <WelcomeOnboarding />        },
    ]
  },
  {
    element: <EditorLayout />,
    children: [
      { path: 'editor',                                     element: <BlockEditor />              },
      { path: 'editor/:id',                                 element: <BlockEditor />              },
    ]
  }
]
