import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import { studentRoutes } from './studentRoutes'
import { teacherRoutes } from './teacherRoutes'
import { adminRoutes } from './adminRoutes'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import Auth from '../components/layout/Auth'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import StudentRegister from '../pages/auth/StudentRegister'
import TeacherRegister from '../pages/auth/TeacherRegister'
import NotFound from '../pages/public/NotFound'
import ErrorPage from '../pages/public/ErrorPage'
import { PublicRoute } from '../components/layout/PublicRoute'
import BlocklyTabs from '../components/editor/BlocklyTabs'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace />, errorElement: <ErrorPage/> },
  {element:<PublicRoute/>, errorElement:<ErrorPage/>, children:[
    {
      element: <Auth/>, children: [
        { path: '/login', element: <Login /> },
        { path: '/register', element: <Register /> },
        { path: '/register/student', element: <StudentRegister /> },
        { path: '/register/teacher', element: <TeacherRegister /> },
      ]
    },
  ]},
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
  { path: '/tryEditor', element: <BlocklyTabs/> },
])

export default function Router() {
  return <RouterProvider router={router} />
}