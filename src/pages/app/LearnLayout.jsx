import { Outlet, useLocation, useNavigate } from 'react-router'
import { useUIStore } from '../../store/uiStore'
import { useAuth } from '../../hooks/useAuth'
import { useCourses } from '../../hooks/useCourse'
import Loader from '../../components/layout/Loader'
import { useEffect, useState } from 'react' // Import useState
import StudentSidebar from '../../dashboards/student/components/StudentSidebar'
import NotificationPanel from '../../components/ui/NotificationPanel'
import ProfileMenu from '../../components/ui/ProfileMenu'
import { useLevels } from '../../hooks/useLevel' // Import useLevels
import CourseSelectionMenu from './CourseSelectionMenu'

export default function LearnLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeCourseProgress,     
    allUserCourseProgresses,  
    setActiveCourse,         
    isLoadingProgress,
    fetchUserProgress, 
    courses,
    fetchCourses,
    startCourse 
  } = useCourses(user?.id);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(false); 
  const { startingLevels, fetchLevels } = useLevels(user?.id);
  
  useEffect(() => {
    if (user?.id) {
      fetchUserProgress();
    }
  }, [user?.id, fetchUserProgress]);

  useEffect(() => {
    fetchCourses();
    fetchLevels();

    if (isLoadingProgress || !user?.id || !allUserCourseProgresses) return;

    const isOnboardingPath = location.pathname.includes('/welcome') || location.pathname.includes('/course-select');

    if (allUserCourseProgresses.length === 0 && !isOnboardingPath) {
      navigate('/student/welcome', { replace: true });
    } else if (allUserCourseProgresses.length > 0 && isOnboardingPath) {
      if (!activeCourseProgress && allUserCourseProgresses.length > 0) {
        if (allUserCourseProgresses[0].active_course) {
          setActiveCourse(allUserCourseProgresses[0].active_course);
        }
      }
      navigate('/student/course', { replace: true }); 
    }
    else if (allUserCourseProgresses.length > 0 && !activeCourseProgress) {
        if (allUserCourseProgresses[0].active_course) {
          setActiveCourse(allUserCourseProgresses[0].active_course); 
        }
    }
  }, [allUserCourseProgresses, activeCourseProgress, isLoadingProgress, location.pathname, navigate, fetchCourses, fetchLevels, setActiveCourse, user?.id]);

  if (isLoadingProgress) {
    return <Loader/>;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {!location.pathname.includes('/welcome') && !location.pathname.includes('/course-select') && (
        <StudentSidebar />
      )}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-75' : 'ml-16'}`}>
        <header className='flex justify-between items-center border-b border-slate-200 p-4 relative'> 
          <div
            className={`flex flex-col justify-center items-center group ${location.pathname.startsWith('/student/learn/') ? 'cursor-pointer' : 'invisible pointer-events-none'}`}
            onClick={() => setIsCourseMenuOpen(true)}
          >
            <img src="/svgcourse.svg" alt="" width={40} height={40} className='bg-slate-200 border border-slate-300 p-1 rounded-2xl group-hover:bg-slate-300 transition!'/>
            <div className='text-[8px] tracking-tighter uppercase font-bold text-slate-600 group-hover:text-blockly-blue transition!'>
              Course catalog
            </div>
          </div>
          <h1 className='font-bold text-2xl leading-6 text-gray-800'>
            {activeCourseProgress?.courses?.title || 'Select Course'}
          </h1>
          <div className='flex items-center gap-4'>
            {/* Course Selection Menu */}
            <CourseSelectionMenu
              courses={courses} 
              activeCourseProgress={activeCourseProgress}    
              allUserCourseProgresses={allUserCourseProgresses} 
              setActiveCourse={setActiveCourse}              
              startCourse={startCourse}
              startingLevels={startingLevels}
              isOpen={isCourseMenuOpen}
              onClose={() => setIsCourseMenuOpen(false)}
            />

            {/* Existing components */}
            <NotificationPanel/>
            <ProfileMenu/>
          </div>
        </header>
        <main className="wrapper flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}