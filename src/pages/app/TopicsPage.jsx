import { ArrowBigLeft, ChevronLeft, History, NotebookText } from 'lucide-react'
import React from 'react'
import { useParams, Link } from 'react-router';
import LessonButton from './LessonButton'
import { useAuth } from '../../hooks/useAuth';
import { useTopics } from '../../hooks/useTopics';
import Loader from '../../components/layout/Loader';
import { useAuthStore } from '../../store/authStore';


const TopicsPage = () => {
  const { courseSlug } = useParams();
  const { user } = useAuth();
  const { course, topics, userProgress, isLoading, error } = useTopics(courseSlug, user?.id);
  const profile = useAuthStore((state) => state.profile)

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">Error loading course data: {error.message}</div>;
  }

  const xpPercentage = userProgress && userProgress.total_xp
    ? (userProgress.current_xp / userProgress.total_xp) * 100
    : 0;

  let globalLessonIndex = 0;

  const LessonWrapper = ({ children, lesson, topicSlug }) => {
    if (lesson.status === 'locked') {
      return <div className="cursor-not-allowed">{children}</div>;
    }
    return (
      <Link to={`/student/learn/${courseSlug}/${lesson.slug}`}>
        {children}
      </Link>
    );
  };

  return (
    <div className='max-w-7xl mx-auto min-h-full flex flex-col py-6'>
      
      <div className='flex-1 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4'>
        <div className='px-6 space-y-4'>
          {topics.map(topic => (
            <details id={topic.slug} key={topic.id} open className=''>
              <summary className='bg-emerald-500 rounded-2xl text-white p-6 flex justify-between items-center shadow-lg cursor-pointer hover:bg-emerald-400 transition-all!'>
                <div className='space-y-2'>
                  <h2 className='font-extrabold tracking-wide text-2xl'>{topic.title}</h2>
                  <p className='font-semibold'>{topic.description}</p>
                </div>
                {/* You can add logic here to find the current lesson and link to it */}
                <button className='hidden xl:flex items-center gap-2 px-6 py-2 rounded-lg border-2 shadow-[0_3px_0px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 font-bold hover:shadow-[0_5px_0px_rgba(0,0,0,0.15)] hover:bg-white/5 active:bg-black/5 active:shadow-[0_3px_0px_rgba(0,0,0,0.15)] active:translate-y-0 transition-all! border-emerald-600 '>
                  <NotebookText/>
                  Continue
                </button>
              </summary>
              <div className='flex flex-col items-center justify-center space-y-8 py-4'>
                {topic.lessons.map(lesson => {
                  const lessonIndex = globalLessonIndex++;
                  return (
                    <LessonWrapper key={lesson.id} lesson={lesson} topicSlug={topic.slug}>
                      <LessonButton 
                        type={lesson.type} 
                        title={lesson.title} 
                        index={lessonIndex}
                        status={lesson.status}
                      />
                    </LessonWrapper>
                  )
                })}
              </div>
            </details>
          ))}
        </div>

        {/* Sidebar */}
        <div className='space-y-6 px-6 sticky top-0 h-fit'>
          <div className="w-full flex justify-end">
            <button className='flex items-center gap-2 px-4 py-3 rounded-full bg-white shadow border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors!'>
              <History/> History
            </button>
          </div>
          {userProgress && (
            <div className='bg-white shadow border border-slate-200 flex flex-row p-4 pb-6 rounded-2xl gap-4'>
              <img src={profile?.avatar_url || "/profile.svg"} alt="User profile" height={50} width={50} className="rounded-full object-cover border-2 border-slate-300"/>
              <div className="flex-1 flex flex-col gap-3">
                <div className='flex flex-row justify-between items-baseline'>
                  <h4 className='font-bold text-xl leading-6'>Level {userProgress.current_level}</h4>
                  <p className='text-sm text-slate-500'><span className='font-bold uppercase text-slate-700'>{userProgress.current_xp}</span> XP</p>
                </div>
                <div className='relative h-fit'>
                  <div className='h-4 bg-slate-200 rounded-full overflow-hidden'>
                    <div className='h-full bg-emerald-400 rounded-full' style={{ width: `${xpPercentage}%` }}/>
                  </div>
                </div>
              </div>
            </div>
          )}

          {course && (
            <div className='flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow'>
              <img src={course.image_src || "/html_logo.png"} alt={course.title} width={100} />
              <h2 className='font-bold text-2xl leading-6'>{course.title}</h2>
              <p className='text-center text-sm text-slate-600'>{course.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopicsPage