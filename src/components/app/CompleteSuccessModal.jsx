
import { Dialog } from '@headlessui/react';
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
      setProgress(100);
    } else {
      setProgress(0);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
          <Dialog.Title className="text-xl font-bold mb-4 text-center">
            {title}
          </Dialog.Title>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center mt-2 text-sm text-gray-600">100% Complete</p>
          </div>

          <p className="mb-6 text-center text-gray-700">{message}</p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onRemain}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Remain Here
            </button>
            <button
              onClick={onSubmitToTopic}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Submit and Go to Topic
            </button>
            <button
              onClick={onSubmitToNext}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
            >
              Submit and Continue to Next Lesson
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CompleteSuccessModal;