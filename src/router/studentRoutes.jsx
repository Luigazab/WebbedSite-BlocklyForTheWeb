import StudentLayout from '../dashboards/student/StudentLayout'
import StudentHome from '../dashboards/student/pages/StudentHome'
import LessonPage from '../dashboards/student/pages/LessonPage'
import TutorialPage from '../dashboards/student/pages/TutorialPage'
import BlocklyEditor from '../dashboards/student/pages/Editor'
import FeedbackPage from '../dashboards/student/pages/FeedbackPage'
import StudentProfile from '../dashboards/student/pages/StudentProfile'
import StudentClassrooms from '../dashboards/student/pages/Classrooms'
import StudentClassroomDetail from '../dashboards/student/pages/StudentClassroomDetail'

export const studentRoutes = [
  {
    element: <StudentLayout />,
    children: [
      { index: true, element: <StudentHome /> },
      { path: 'classrooms', element: <StudentClassrooms /> },
      { path: 'classrooms/:classroomId', element: <StudentClassroomDetail /> },
      { path: 'lessons', element: <LessonPage /> },
      { path: 'lessons/:lessonId', element: <LessonPage /> },
      { path: 'tutorials', element: <TutorialPage /> },
      { path: 'tutorials/:tutorialId', element: <TutorialPage /> },
      { path: 'editor', element: <BlocklyEditor /> },
      { path: 'feedback', element: <FeedbackPage /> },
      { path: 'profile', element: <StudentProfile /> },
    ]
  }
]