import { Calendar, ChevronRight } from "lucide-react";
import LessonContent from "../../components/shared/LessonContent";


const LectureContent = ({ lesson }) => {
  return (
    <div className='space-y-4 max-w-2xl mx-auto py-6'>
      <h1 className='text-center font-bold text-4xl font-sans! border-b border-slate-400 pb-4'>{lesson.title}</h1>
      
      <div className="flex flex-wrap justify-between items-center gap-x-5 gap-y-2 py-2 text-sm text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>Posted {new Date(lesson.created_at).toLocaleDateString()}</span>
        </div>
        {lesson.author && (
          <div className="flex items-center gap-2">
            <img src={lesson.author.avatar_url || '/profile.svg'} className="w-6 h-6 rounded-full object-cover border border-gray-200" />
            <span className="font-bold text-gray-700">{lesson.author.username}</span>
          </div>
        )}
      </div>

      {lesson.lecture?.video_src && (
        <div className="w-full aspect-video border-2 p-2 border-slate-200 rounded-2xl shadow bg-white">
          <iframe className="w-full h-full rounded-2xl" src={lesson.lecture.video_src}
            title={lesson.title} frameBorder="0" allowFullScreen />
        </div>
      )}

      {lesson.lecture?.content && (
        <div className='rounded-2xl p-8 bg-white shadow my-2 border border-slate-200'>
          <div
            className="tiptap-content"
            dangerouslySetInnerHTML={{ __html: lesson.lecture.content}}
            />
        </div>
      )}

      {lesson.lecture?.file_url && (
        <details className="rounded-2xl bg-white shadow border border-slate-200">
          <summary className="cursor-pointer flex items-center justify-between font-semibold px-4 py-2 transition-colors group-open:bg-slate-200">
            <span className="p-4 font-bold tracking-widest">View Attached File</span>
            <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
          </summary>
          <div className="mt-4 w-full aspect-4/3 rounded-2xl shadow">
            <iframe src={lesson.lecture.file_url} className="w-full h-full rounded-2xl" frameBorder="0" />
          </div>
        </details>
      )}
    </div>
  );
};
export default LectureContent;