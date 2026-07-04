import { Dialog } from '@headlessui/react';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const CompleteSuccessModal = ({
  isOpen,
  onClose,
  onRemain,
  onSubmitToTopic,
  onSubmitToNext,
  title = "Lesson Completed!",
  message = "Congratulations! You've successfully completed this lesson."
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setProgress(100), 200);
    } else {
      setProgress(0);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-slate-200">
          <Dialog.Title className="text-2xl font-extrabold mb-4 text-center text-slate-600">
            {title}
          </Dialog.Title>

          {/* Progress Bar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (progress / 100) * 283}
                  className="transition-all! duration-1000! ease-out!"
                />
              </svg>
              <CheckCircle className="absolute inset-0 m-auto text-green-500 w-10 h-10" />
            </div>
            <p className="mt-2 text-sm text-slate-600 font-semibold">100% Complete</p>
          </div>

          <p className="mb-6 text-center text-slate-700">{message}</p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onRemain}
              className="w-full px-4 py-2 border border-yellow-500 text-yellow-600 rounded-lg 
                        bg-white hover:bg-blue-50 transition-colors font-semibold"
            >
              Remain Here
            </button>
            <button
              onClick={onSubmitToTopic}
              className="w-full px-4 py-2 border border-green-500 text-green-600 rounded-lg 
                        bg-white hover:bg-green-50 transition-colors font-semibold"
            >
              Submit & Go to Topic
            </button>
            <button
              onClick={onSubmitToNext}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg 
                        hover:bg-blue-600 transition-colors font-semibold shadow"
            >
              <ArrowRight size={18}/>
              Submit & Continue
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CompleteSuccessModal;