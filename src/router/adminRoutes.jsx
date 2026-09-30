import AdminLayout from '../dashboards/admin/AdminLayout'
import AdminHome from '../dashboards/admin/pages/AdminHome'
import UserManagement from '../dashboards/admin/pages/UserManagement'
import UserEngagement from '../dashboards/admin/pages/UserEngagement'
import ReportsAndFeedback from '../dashboards/admin/pages/ReportsAndFeedback'
import AdminProfile from '../dashboards/admin/pages/AdminProfile'
import ProfilePage from '../dashboards/admin/pages/AdminProfile'
import SettingsPage from '../components/shared/SettingsPage'
import ContentManagement from '../dashboards/admin/pages/ContentManagement'
import PlatformConfig from '../dashboards/admin/pages/PlatformConfig'
import CoursesLibrary from '@/dashboards/admin/pages/CoursesLibrary'
import CourseDetail from '@/dashboards/admin/pages/CourseDetail'
import Analytics from '@/dashboards/admin/pages/Analytics'
import LecturePage from '@/dashboards/teacher/pages/LecturePage'
import QuizPage from '@/dashboards/teacher/pages/QuizPage'
import TutorialBuilderPage from '@/dashboards/teacher/pages/TutorialBuilderPage'
import LaboratoryBuilderPage from '@/dashboards/teacher/pages/LaboratoryBuilderPage'

export const adminRoutes = [
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminHome /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'courses', element: <CoursesLibrary /> },
      { path: 'courses/:id', element: <CourseDetail /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'engagement', element: <UserEngagement /> },
      { path: 'reports', element: <ReportsAndFeedback /> },
      { path: 'contents', element: <ContentManagement /> },
      { path: 'config', element: <PlatformConfig/> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ]
  },
  { path: 'lecture/create',    element: <LecturePage context="admin" /> },
  { path: 'lecture/edit/:id',  element: <LecturePage context="admin" /> },
  { path: 'quiz/create',       element: <QuizPage context="admin" /> },
  { path: 'quiz/edit/:id',     element: <QuizPage context="admin" /> },
  { path: 'tutorial/create',   element: <TutorialBuilderPage context="admin" /> },
  { path: 'tutorial/edit/:id', element: <TutorialBuilderPage context="admin" /> },
  { path: 'laboratory/create',   element: <LaboratoryBuilderPage context="admin" /> },
  { path: 'laboratory/edit/:id', element: <LaboratoryBuilderPage context="admin" /> },
]