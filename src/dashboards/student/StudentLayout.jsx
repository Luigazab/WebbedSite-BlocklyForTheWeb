import { Outlet, useLocation, useNavigate } from 'react-router'
import StudentSidebar from './components/StudentSidebar'
import StudentNavbar from './components/StudentNavbar'
import { useUIStore } from '../../store/uiStore'
import { useAuth } from '../../hooks/useAuth'
import { useCourses } from '../../hooks/useCourse'
import Loader from '../../components/layout/Loader'
import { useEffect } from 'react'

export default function StudentLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { allUserCourseProgresses, isLoadingProgress, fetchUserProgress } = useCourses(user?.id);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  
  useEffect(() => {
    if (user?.id) {
      fetchUserProgress();
    }
  }, [user?.id, fetchUserProgress]);

  useEffect(() => {
    if (isLoadingProgress || !user?.id || !allUserCourseProgresses) return;

    const isOnboardingPath = location.pathname.includes('/welcome') || location.pathname.includes('/course-select');

    if (allUserCourseProgresses.length === 0 && !isOnboardingPath) {
      navigate('/student/welcome', { replace: true });
    } else if (allUserCourseProgresses.length > 0 && isOnboardingPath) {
      navigate('/student', { replace: true });
    }
  }, [allUserCourseProgresses, isLoadingProgress, location.pathname, navigate]);

  if (isLoadingProgress) {
    return <Loader/>;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {!location.pathname.includes('/welcome') && !location.pathname.includes('/course-select') && (
        <StudentSidebar />
      )}
      <div className={`flex flex-col flex-1 transition-all! duration-300 ${sidebarOpen ? 'ml-75' : 'ml-16'}`}>
        <StudentNavbar />
        <main className="wrapper flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}