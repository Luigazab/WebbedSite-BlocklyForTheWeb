import React from 'react';
import { useNavigate } from 'react-router';

export default function WelcomeOnboarding() {
  const navigate = useNavigate();
  const username = "Student"; 

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold text-slate-800">
          Hello {username}, welcome to WebbedSite!
        </h1>
        <p className="text-xl text-slate-600">
          Your journey to learning web languages in a fun and interactive way begins here.
        </p>
        <button
          onClick={() => navigate('/student/course-select')}
          className="btn mt-8 px-8 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}