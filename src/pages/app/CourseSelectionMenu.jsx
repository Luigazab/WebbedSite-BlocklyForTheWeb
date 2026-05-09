import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronRightCircleIcon, Lock, X } from 'lucide-react';
import { useNavigate } from 'react-router';

const CourseSelectionMenu = ({
  courses,
  activeCourseProgress, // The user's currently active course progress object for the UI
  allUserCourseProgresses, // Array of all user_progress entries for the user
  setActiveCourse, // Function to switch the active course in the UI
  startCourse,  // Function to start a course
  startingLevels, // Levels data from useLevels
  onClose,      // Function to close the main menu
  isOpen,       // Is the main menu open?
}) => {
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [selectedCourseForLevel, setSelectedCourseForLevel] = useState(null);
  const [selectedLevelKey, setSelectedLevelKey] = useState(""); // Key for the selected level (e.g., 'beginner')
  const navigate = useNavigate();

  const handleCourseClick = (course) => {
    if (isCourseCurrentlyActive(course.id)) {
      onClose();
      return;
    }

    if (hasUserStartedCourse(course.id)) {
      setActiveCourse(course.id);
      navigate(`/student/learn/${course.slug}`, { replace: true });
      onClose();
      return;
    }

    setSelectedCourseForLevel(course);
    setIsLevelModalOpen(true);
  };

  const handleLevelSelect = (levelKey) => {
    setSelectedLevelKey(levelKey);
  };

  const handleStartCourseWithLevel = async () => {
    if (!selectedCourseForLevel || !selectedLevelKey) return;

    const selectedLevel = startingLevels[selectedLevelKey];
    if (!selectedLevel) {
      alert("Invalid level selection");
      return;
    }

    try {
      await startCourse(
        selectedCourseForLevel.id,
        selectedLevel.level,
        selectedLevel.xp_required
      );
      setIsLevelModalOpen(false);
      onClose(); 
    } catch (err) {
      console.error("Error starting course:", err);
      alert("Something went wrong starting the course.");
    }
  };
  const hasUserStartedCourse = (courseId) => {
    return allUserCourseProgresses && allUserCourseProgresses.some(up => up.active_course === courseId);
  };
  const isCourseCurrentlyActive = (courseId) => {
    return activeCourseProgress && activeCourseProgress.active_course === courseId;
  };

  return (
    <>
      {/* Main Course Selection Pop-up */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                  >
                    Select Your Course
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={onClose}
                    >
                      <X size={18} />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className={`relative flex rounded-lg overflow-hidden shadow-md cursor-pointer transition-all duration-200
                          ${!isCourseCurrentlyActive(course.id) ? 'hover:shadow-lg' : 'cursor-default'}
                        `}
                        onClick={() => handleCourseClick(course)}
                      >
                        {/* Left half: Course Color */}
                        <div
                          className="w-1/2 p-4 flex items-center justify-center"
                          style={{ backgroundColor: `${course.color}` }}
                        >
                          <img
                            src={course.image_src}
                            alt={course.title}
                            className="w-24 h-24 object-contain"
                          />
                        </div>

                        {/* Right half: Content */}
                        <div className="w-1/2 p-4 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-lg text-gray-800">
                              {course.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {course.description}
                            </p>
                          </div>
                          {/* Optional: Add a button or indicator for active course */}
                          {isCourseCurrentlyActive(course.id) && (
                            <span className="mt-2 text-xs font-semibold text-blue-600">
                              (Current Course)
                            </span>
                          )}
                          {hasUserStartedCourse(course.id) && !isCourseCurrentlyActive(course.id) && (
                            <div className="mt-2 flex items-center gap-2 text-slate-500">
                              <ChevronRightCircleIcon className="w-5 h-5" />
                              <span className="text-xs font-semibold">Switch to this course</span>
                            </div>
                          )}
                        </div>

                        {/* Locked Overlay */}
                        {!hasUserStartedCourse(course.id) && (
                          <div className="absolute inset-0 bg-gray-800/70 flex flex-col items-center justify-center text-white p-4">
                            <Lock size={32} className="mb-2" />
                            <span className="font-bold text-lg text-center">
                              Start New Course
                            </span>
                            <p className="text-sm text-center mt-1">
                              Start your learning journey!
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Level Selection Modal (similar to CourseSelection.jsx) */}
      <Transition appear show={isLevelModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[60]" onClose={() => setIsLevelModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                  >
                    Select Your Starting Level for {selectedCourseForLevel?.title}
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setIsLevelModalOpen(false)}
                    >
                      <X size={18} />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4 space-y-4">
                    <div className="flex space-x-3">
                      {Object.entries(startingLevels).map(([key, lvlObj]) => (
                        <label
                          key={key}
                          className="flex-1 flex flex-col items-center cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="level"
                            value={key}
                            checked={selectedLevelKey === key}
                            onChange={() => handleLevelSelect(key)}
                            className="hidden peer"
                          />
                          <span className={`capitalize px-4 py-3 font-bold text-center w-full rounded-lg border border-slate-200 bg-white shadow transition-all
                            peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 hover:bg-slate-100`}>
                            {key}
                          </span>
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleStartCourseWithLevel}
                      disabled={!selectedLevelKey}
                      className="w-full btn px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Start Course
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default CourseSelectionMenu;