import { useCallback } from 'react';
import { courseService } from '../services/courseService';
import { useCourseStore } from '../store/courseStore';

export const useCourses = (userId) => {
  const {
    activeCourseProgress, // The currently selected course progress for the UI
    allUserCourseProgresses, // Array of all user_progress entries for the user
    courses,
    isLoadingProgress,
    setActiveCourseProgress,
    setAllUserCourseProgresses,
    setCourses,
    setIsLoadingProgress
  } = useCourseStore();

  const fetchUserProgress = useCallback(async () => {
    if (!userId) {
      setAllUserCourseProgresses([]);
      setActiveCourseProgress(null);
      setIsLoadingProgress(false);
      return;
    }
    setIsLoadingProgress(true);
    try {
      const allProgress = await courseService.getAllUserProgress(userId);
      setAllUserCourseProgresses(allProgress);

      // If there's no active course set in the store yet,
      // or if the previously active course is no longer in allProgress,
      // default to the first available progress entry.
      if (
        !activeCourseProgress ||
        !allProgress.some(p => p.active_course === activeCourseProgress.active_course)
      ) {
        setActiveCourseProgress(allProgress.length > 0 ? allProgress[0] : null);
      }
    } catch (error) {
      console.error("Failed to fetch user progress:", error);
      setAllUserCourseProgresses([]);
      setActiveCourseProgress(null);
    } finally {
      setIsLoadingProgress(false);
    }
  }, [userId, activeCourseProgress, setActiveCourseProgress, setAllUserCourseProgresses, setIsLoadingProgress]);

  const fetchCourses = useCallback(async () => {
    try {
      const availableCourses = await courseService.getCourses();
      setCourses(availableCourses);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  }, [setCourses]);

  // Function to set the active course for the UI
  const setActiveCourse = useCallback((courseId) => {
    const selectedProgress = allUserCourseProgresses.find(p => p.active_course === courseId);
    if (selectedProgress) {
      setActiveCourseProgress(selectedProgress);
    } else {
      console.warn(`Attempted to set active course with ID ${courseId}, but no progress found in current state.`);
      // Optionally, you might want to re-fetch it or handle this as an error state.
    }
  }, [allUserCourseProgresses, setActiveCourseProgress]);

  const startCourse = async (courseId, level, xp) => {
    try {
      const newProgress = await courseService.initializeUserProgress(
        userId,
        courseId,
        level,
        xp
      );

      // Update allUserCourseProgresses: find and replace if exists, otherwise add
      setAllUserCourseProgresses(prev => {
        const existingIndex = prev.findIndex(p => p.active_course === courseId);
        if (existingIndex !== -1) {
          const newArr = [...prev];
          newArr[existingIndex] = newProgress;
          return newArr;
        }
        return [...prev, newProgress];
      });

      setActiveCourseProgress(newProgress); // Set the newly started/updated course as active
      return newProgress;
    } catch (error) {
      console.error("Failed to initialize or update course progress:", error);
      throw error;
    }
  };

  return {
    activeCourseProgress,
    allUserCourseProgresses,
    courses,
    isLoadingProgress,
    fetchUserProgress,
    fetchCourses, // All available courses
    startCourse, // Handles creating/updating progress and setting active
    setActiveCourse // Handles switching active course if already started
  };
};