import { ChevronRightCircleIcon, Lock, X } from 'lucide-react';
import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router';
import { Dialog, Transition } from '@headlessui/react';
import { useAuth } from '../../hooks/useAuth';
import { useCourses } from '../../hooks/useCourse';
import { useLevels } from '../../hooks/useLevel';
const Course = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    courses,
    allUserCourseProgresses,
    startCourse,
    fetchCourses,
  } = useCourses(user?.id);
  const { startingLevels, fetchLevels } = useLevels(user?.id);

  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [selectedCourseForLevel, setSelectedCourseForLevel] = useState(null);
  const [selectedLevelKey, setSelectedLevelKey] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
      fetchLevels();
    }
  }, [user?.id, fetchCourses, fetchLevels]);

  const hasUserStartedCourse = (courseId) => {
    return allUserCourseProgresses && allUserCourseProgresses.some(up => up.active_course === courseId);
  };

  const handleLockedCourseClick = (course) => {
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
      alert('Invalid level selection');
      return;
    }

    try {
      await startCourse(
        selectedCourseForLevel.id,
        selectedLevel.level,
        selectedLevel.xp_required
      );
      setIsLevelModalOpen(false);
      navigate(`/student/learn/${selectedCourseForLevel.slug}`);
    } catch (err) {
      console.error('Error starting course:', err);
      alert('Something went wrong starting the course.');
    }
  };

  const CourseCard = ({ course }) => {
    const isStarted = hasUserStartedCourse(course.id);

    const content = (
      <div
        className="relative bg-contain bg-no-repeat rounded-2xl shadow border border-slate-200 group hover:ring-offset-4 ring-offset-slate-200"
        style={{
          backgroundImage: `url(${course.image_src})`,
        }}
      >
        <div
          className="relative h-32 rounded-t-2xl flex p-8 overflow-hidden border"
          style={{
            backgroundColor: `${course.color}99`,
            borderColor: course.color,
          }}
        ></div>
        <div className="bg-white w-full rounded-b-2xl p-4 flex justify-between items-center">
          <div>
            <h2 className="font-extrabold tracking-widest text-slate-600 text-xl">{course.title}</h2>
            <p className="font-bold tracking-wide text-slate-400 ">{course.description}</p>
          </div>
          <ChevronRightCircleIcon className="group-hover:fill-slate-300 group-hover:text-emerald-700 w-6 h-6 group-hover:animate-bounce transition-all! ease-in-out" />
        </div>

        {!isStarted && (
          <div className="absolute inset-0 bg-gray-800/70 flex flex-col items-center justify-center text-white p-4 rounded-2xl">
            <Lock size={32} className="mb-2" />
            <span className="font-bold text-lg text-center">Start New Course</span>
            <p className="text-sm text-center mt-1">Click to begin your journey!</p>
          </div>
        )}
      </div>
    );

    if (isStarted) {
      return (
        <Link to={`/student/learn/${course.slug}`}>
          {content}
        </Link>
      );
    }

    return (
      <div className="cursor-pointer" onClick={() => handleLockedCourseClick(course)}>
        {content}
      </div>
    );
  };
  return (
    <>
      <div className="max-w-4xl mx-auto min-h-full flex flex-col p-6 gap-8">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Level Selection Modal */}
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
  )
}

export default Course