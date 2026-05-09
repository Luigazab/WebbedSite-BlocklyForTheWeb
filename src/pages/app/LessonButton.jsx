import React from 'react'
import {
  Check,
  Star,
  BookOpen,
  FileQuestionMark,
  PencilRuler,
  FlaskConical
} from 'lucide-react'

// Map lesson types to their corresponding icons
const lessonIcons = {
  lecture: BookOpen,
  quiz: FileQuestionMark,
  tutorial: PencilRuler,
  laboratory: FlaskConical
}

const LessonButton = ({ 
  title, 
  type, // New prop for lesson type
  status = 'locked',
  index = 0 
}) => {
  const cycle = index % 8;
  const offsets = [0, 40, 80, 40, 0, -40, -80, -40];
  const marginLeft = offsets[cycle];

  const Icon = lessonIcons[type] || Star

  const getStatusStyles = () => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500 border-emerald-600 text-white shadow-[0_5px_0px_rgba(5,150,105,1)] hover:bg-emerald-400';
      case 'current':
        return 'bg-emerald-400 border-emerald-500 text-white shadow-[0_5px_0px_rgba(16,185,129,1)] hover:-translate-y-[3px] hover:shadow-[0_8px_0px_rgba(16,185,129,1)] hover:bg-emerald-300 transition-all!';
      case 'locked':
      default:
        return 'bg-slate-200 border-slate-300 text-slate-400 shadow-[0_5px_0px_rgba(203,213,225,1)] cursor-not-allowed fill-slate-200 stroke-slate-400';
    }
  };

  return (
    <div 
      className='flex flex-col items-center gap-2'
      style={{ transform: `translateX(${marginLeft}px)` }}
    >
      <div className='relative'>
        <button
          disabled={status === 'locked'}
          className={`
            w-16 h-16 rounded-full border-b-4 flex items-center justify-center transition-all! active:translate-y-1 active:shadow-none
            ${getStatusStyles()}
          `}
        >
          <Icon size={28} />
        </button>
        
        {status === 'completed' && (
          <div className='absolute -top-1 -right-1 bg-emerald-100 border-2 border-white rounded-full p-1 text-emerald-600'>
            <Check size={12} strokeWidth={4} />
          </div>
        )}
        {status === 'current' && (
          <div className="relative">
            <div className='absolute -top-28 -left-2.5 px-3 py-2.5 border-2 font-bold uppercase text-green-600 bg-white rounded-xl tracking-wide z-10 animate-bounce  `'>
              Start
              <div className='absolute left-1/2 -bottom-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-x-1/2'/>
            </div>
          </div>
        )}
      </div>
      <span className={`font-bold text-sm ${status === 'locked' ? 'text-slate-400' : 'text-slate-700'}`}>
        {title}
      </span>
    </div>
  )
}

export default LessonButton