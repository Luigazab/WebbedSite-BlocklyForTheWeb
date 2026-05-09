import { Calendar, ChevronRight, Clock, ArrowLeft, CheckCircle } from 'lucide-react'
import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import LessonContent from '../../components/shared/LessonContent'
import { useLesson } from '../../hooks/useLesson'
import Loader from '../../components/layout/Loader'

const LecturePage = () => {
  const { lesson, navigation, isLoading, error } = useLesson();
  const navigate = useNavigate();
  const { courseSlug } = useParams();

  useEffect(() => {
    if (!lesson) return;
    const typeToPath = {
      lecture: 'lecture',
      quiz: 'quiz',
      tutorial: 'tutorial',
      laboratory: 'lab'
    };
    const expectedPrefix = typeToPath[lesson.type];
    if (lesson.type !== 'lecture'){
      navigate(`/student/learn/${courseSlug}/${expectedPrefix}-${lesson.slug}`);
    }
  }, [lesson]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">Error loading lesson: {error.message}</div>;
  }

  if (!lesson) {
    return <div className="text-center p-8">Lesson not found.</div>;
  }

  const handleFinishLesson = () => {
    // TODO: Add logic to mark the lesson as complete
    if (navigation.next) {
      navigate(navigation.next);
    } else {
      // If no next lesson, navigate back to the main topics page for the course
      navigate(`/student/learn/${courseSlug}`);
    }
  };
  
  const handlePreviousLesson = () => {
    if (navigation.previous) {
      navigate(navigation.previous);
    }
  };

  return (
    <div className='relative'>
      <div className='flex sticky top-0 justify-between items-baseline border-b bg-white border-slate-200 px-4 py-2'>
        <h2 className='font-bold tracking-widest text-xl text-slate-500'>{lesson.topic.title}</h2>
        <h2 className='font-semibold tracking-tight text-xs text-slate-400 uppercase truncate max-w-md'>{lesson.topic.description}</h2>
      </div>
      <div className='p-4 flex flex-col gap-4 justify-between max-w-5xl mx-auto'>
        <div className='space-y-4'>
          <div className='relative'>
            <h1 className='text-center font-bold text-4xl font-sans! border-b border-slate-400 pb-4'>{lesson.title}</h1>
          </div>
          <div className="flex flex-wrap justify-between items-center gap-x-5 gap-y-2 py-2 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Posted {new Date(lesson.created_at).toLocaleDateString()}</span>
            </div>
            {lesson.author && (
              <div className="flex items-center gap-2"> 
                <img src={lesson.author.avatar_url || '/profile.svg'} alt={lesson.author.username} className="w-6 h-6 rounded-full object-cover border border-gray-200" />
                <span className="font-bold text-gray-700">{lesson.author.username}</span>
              </div>
            )}
          </div>
          {lesson.lecture.video_src && (
            <div className="w-full aspect-video border-2 p-2 border-slate-200 rounded-2xl shadow bg-white">
              <iframe 
                className="w-full h-full rounded-2xl" 
                src={lesson.lecture.video_src} 
                title={lesson.title}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen>
              </iframe>
            </div>
          )}

          {lesson.lecture.content && (
            <div className='rounded-2xl p-8 bg-white shadow my-2 border border-slate-200'>
              <LessonContent content={lesson.lecture.content}/>
            </div>
          )}

          {lesson.lecture.file_url && (
            <details className="rounded-2xl bg-white shadow border border-slate-200">
              <summary className="rounded-2xl cursor-pointer flex items-center justify-between font-semibold px-4 py-2 transition-colors group-open:bg-slate-200">
                <span className="p-4 font-bold tracking-widest">View Attached File</span>
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="mt-4 w-full aspect-4/3 rounded-2xl shadow">
                <iframe
                  src={lesson.lecture.file_url}
                  className="w-full h-full rounded-2xl"
                  title="Attached File Viewer"
                  frameBorder="0"
                ></iframe>
              </div>
            </details>
          )}
        </div>
        <div className='flex justify-between font-bold mt-8'>
          <button 
            onClick={handlePreviousLesson}
            disabled={!navigation.previous}
            className='btn px-10 text-md btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <ArrowLeft />
            Previous
          </button>
          <button 
            onClick={handleFinishLesson}
            className='btn px-10 text-md btn-primary flex items-center gap-2'
          >
            {navigation.next ? 'Next Lesson' : 'Finish Topic'}
            {navigation.next ? <ChevronRight /> : <CheckCircle />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LecturePage