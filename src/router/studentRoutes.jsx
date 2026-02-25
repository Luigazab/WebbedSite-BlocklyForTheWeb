import StudentLayout from '../dashboards/student/StudentLayout'
import StudentHome from '../dashboards/student/pages/StudentHome'
import LessonPage from '../dashboards/student/pages/LessonPage'
import TutorialPage from '../dashboards/student/pages/TutorialPage'
import FeedbackPage from '../dashboards/student/pages/FeedbackPage'
import StudentClassrooms from '../dashboards/student/pages/Classrooms'
import StudentClassroomDetail from '../dashboards/student/pages/StudentClassroomDetail'
import ProjectsPage from '../components/shared/ProjectsPage'
import SettingsPage from '../components/shared/SettingsPage'
import ProfilePage from '../dashboards/student/pages/StudentProfile'
import Editor from '../dashboards/student/pages/Editor'
import EditorLayout from '../components/layout/EditorLayout'

export const studentRoutes = [
  {
    element: <StudentLayout />,
    children: [
      { index: true, element: <StudentHome /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'classrooms', element: <StudentClassrooms /> },
      { path: 'classrooms/:classroomId', element: <StudentClassroomDetail /> },
      { path: 'lessons', element: <LessonPage /> },
      { path: 'lessons/:lessonId', element: <LessonPage /> },
      { path: 'tutorials', element: <TutorialPage /> },
      { path: 'tutorials/:tutorialId', element: <TutorialPage /> },
      { path: 'feedback', element: <FeedbackPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ]
  },
  {
    element: <EditorLayout />,
    children: [
      { path: 'editor', element: <Editor /> },
      { path: 'editor/:id', element: <Editor /> },
    ]
  }
]