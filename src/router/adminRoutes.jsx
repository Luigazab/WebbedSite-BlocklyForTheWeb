import AdminLayout from '../dashboards/admin/AdminLayout'
import AdminHome from '../dashboards/admin/pages/AdminHome'
import UserManagement from '../dashboards/admin/pages/UserManagement'
import UserEngagement from '../dashboards/admin/pages/UserEngagement'
import ReportsAndFeedback from '../dashboards/admin/pages/ReportsAndFeedback'
import AdminProfile from '../dashboards/admin/pages/AdminProfile'

export const adminRoutes = [
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminHome /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'engagement', element: <UserEngagement /> },
      { path: 'reports', element: <ReportsAndFeedback /> },
      { path: 'profile', element: <AdminProfile /> },
    ]
  }
]