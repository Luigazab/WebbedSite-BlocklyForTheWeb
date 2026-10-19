import { lazy } from 'react'
const ReportsPage = lazy(() => import('../components/shared/ReportsPage'))
import { Navigate } from 'react-router'
const AdminLayout = lazy(() => import('../dashboards/admin/AdminLayout'))
const AdminHome = lazy(() => import('../dashboards/admin/pages/AdminHome'))
const UserManagement = lazy(() => import('../dashboards/admin/pages/UserManagement'))
const UserEngagement = lazy(() => import('../dashboards/admin/pages/UserEngagement'))
const ReportsAndFeedback = lazy(() => import('../dashboards/admin/pages/ReportsAndFeedback'))
const AdminProfile = lazy(() => import('../dashboards/admin/pages/AdminProfile'))
const ProfilePage = lazy(() => import('../dashboards/admin/pages/AdminProfile'))
const SettingsPage = lazy(() => import('../components/shared/SettingsPage'))
const ContentManagement = lazy(() => import('../dashboards/admin/pages/ContentManagement'))
const PlatformConfig = lazy(() => import('../dashboards/admin/pages/PlatformConfig'))
const CoursesLibrary = lazy(() => import('@/dashboards/admin/pages/CoursesLibrary'))
const CourseDetail = lazy(() => import('@/dashboards/admin/pages/CourseDetail'))
const Analytics = lazy(() => import('@/dashboards/admin/pages/Analytics'))
const LecturePage = lazy(() => import('@/dashboards/teacher/pages/LecturePage'))
const QuizPage = lazy(() => import('@/dashboards/teacher/pages/QuizPage'))
const TutorialBuilderPage = lazy(() => import('@/dashboards/teacher/pages/TutorialBuilderPage'))
const LaboratoryBuilderPage = lazy(() => import('@/dashboards/teacher/pages/LaboratoryBuilderPage'))
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
      { path: 'profile', element: <Navigate to="/admin/settings" replace /> },
      { path: 'help', element: <ReportsPage /> },
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