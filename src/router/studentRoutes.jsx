import StudentLayout from '../dashboards/student/StudentLayout'
import StudentHome from '../dashboards/student/pages/StudentHome'
import FeedbackPage from '../dashboards/student/pages/FeedbackPage'
import ProjectsPage from '../components/shared/ProjectsPage'
import SettingsPage from '../components/shared/SettingsPage'
import ProfilePage from '../pages/profile/ProfilePage'
import EditorLayout from '../components/layout/EditorLayout'
import BlockEditor from '../components/shared/BlockEditor'
import Documentation from '../components/shared/Documentation'
import QuizAssessment from '../dashboards/student/pages/QuizAssessment'
import QuizResult from '../dashboards/student/pages/QuizResult'
import Loader from '../components/layout/Loader'
import WelcomeOnboarding from '../dashboards/student/pages/WelcomeOnboarding'
import Background from '../components/layout/Background'
import LessonPage from '../pages/app/LessonPage'
import LessonLayout from '../components/layout/LessonLayout'
import LegacyLessonRedirect from '../components/layout/LegacyLessonRedirect'
import { Navigate } from 'react-router'
import StudentClassroomHub from '@/dashboards/student/pages/StudentClassroomHub'
import StudentClassrooms from '@/dashboards/student/pages/StudentClassrooms'



export const studentRoutes = [
  {
    element: <StudentLayout />,
    children: [
      { index: true,                                        element: <StudentHome />              },
      { path: 'projects',                                   element: <ProjectsPage />             },
      { path: 'classrooms',                                 element: <StudentClassrooms />        },
      { path: 'classrooms/:classroomId',                    element: <StudentClassroomHub /> },
      { path: 'quiz',                                       element: <QuizAssessment />           },
      { path: 'quiz/result',                                element: <QuizResult />               },
      { path: 'docs',                                       element: <Documentation />            },
      { path: 'feedback',                                   element: <FeedbackPage />             },
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
