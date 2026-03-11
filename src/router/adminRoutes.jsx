import AdminLayout from '../dashboards/admin/AdminLayout'
import AdminHome from '../dashboards/admin/pages/AdminHome'
import UserManagement from '../dashboards/admin/pages/UserManagement'
import UserEngagement from '../dashboards/admin/pages/UserEngagement'
import ReportsAndFeedback from '../dashboards/admin/pages/ReportsAndFeedback'
import AdminProfile from '../dashboards/admin/pages/AdminProfile'
import ProfilePage from '../dashboards/admin/pages/AdminProfile'
import SettingsPage from '../components/shared/SettingsPage'
import ContentManagement from '../dashboards/admin/pages/ContentManagement'

export const adminRoutes = [
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminHome /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'engagement', element: <UserEngagement /> },
      { path: 'reports', element: <ReportsAndFeedback /> },
      { path: 'contents', element: <ContentManagement /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ]
  }
]