import { Outlet, useNavigate, useLocation } from "react-router"
import { useAuth } from "../../hooks/useAuth";
import { useCourses } from "../../hooks/useCourse";
import { useEffect } from "react";
import Loader from "./Loader";

const Background = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { allUserCourseProgresses, isLoadingProgress, fetchUserProgress } = useCourses(user?.id);
  
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
    <div className="min-h-screen z-12 bg-[url('/auth2_bg.avif')] bg-repeat bg-scroll">
       <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50%"   // center horizontally
          cy="10%"   // center vertically
          r="60%"    // radius = half of viewport height/width
          fill="white"
        />
      </svg>
      <div className="relative h-full w-full bg-black/1">
        <main>
            <Outlet/>
        </main>
        </div>
    </div>
  )
}

export default Background 