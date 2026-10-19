import { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import { studentRoutes } from './studentRoutes'
import { teacherRoutes } from './teacherRoutes'
import { adminRoutes } from './adminRoutes'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import Auth from '../components/layout/Auth'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import StudentRegister from '../pages/auth/StudentRegister'
import NotFound from '../pages/public/NotFound'
import ErrorPage from '../pages/public/ErrorPage'
import { PublicRoute } from '../components/layout/PublicRoute'
const JavaScriptPractice = lazy(() => import('../pages/public/JavaScriptPractice'))
import UpdatePassword from '../pages/auth/UpdatePassword'
import ForgotPassword from '../pages/auth/ForgotPassword'
import NotificationEntry from '../pages/app/NotificationEntry'
const ClassroomPostPage = lazy(() => import('../pages/app/ClassroomPostPage'))
const RemiDemo = lazy(() => import('../pages/public/RemiDemo'))

const router = createBrowserRouter([
  { path: '/classroom-posts/:postId', element: <ClassroomPostPage />, errorElement: <ErrorPage /> },
  { path: '/', element: <Navigate to="/login" replace />, errorElement: <ErrorPage/> },
  {element:<PublicRoute/>, errorElement:<ErrorPage/>, children:[
    {
      element: <Auth/>, children: [
        { path: '/login', element: <Login /> },
        { path: '/register', element: <Register /> },
        { path: '/register/student', element: <StudentRegister /> },
        { path: '/register/teacher', element: <Navigate to="/register/student" replace /> },
        { path: '/forgot-password', element: <ForgotPassword /> },
      ]
    },
  ]},
  { element: <Auth />, errorElement: <ErrorPage />, children: [
    { path: '/update-password', element: <UpdatePassword /> },
    { path: '/notifications/:notificationId', element: <NotificationEntry />, errorElement: <ErrorPage /> },
  ] },
  { path: '/remi-demo', element: <RemiDemo />, errorElement: <ErrorPage /> },
  {
    path: '/student',
    element: <ProtectedRoute allowedRole="student" />,
    errorElement: <ErrorPage />,
    children: studentRoutes
  },
  {
    path: '/teacher',
    element: <ProtectedRoute allowedRole="teacher" />,
    errorElement: <ErrorPage />,
    children: teacherRoutes
  },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRole="admin" />,
    errorElement: <ErrorPage />,
    children: adminRoutes
  },
  { path: '*', element: <NotFound /> },
  { path: '/tryEditor', element: <JavaScriptPractice/> },
])

export default function Router() {
  return <Suspense fallback={<div role="status" className="p-8 text-center">Loading WebbedSite…</div>}><RouterProvider router={router} /></Suspense>
}
