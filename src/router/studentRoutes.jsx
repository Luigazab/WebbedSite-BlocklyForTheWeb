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
import EditorLayout from '../components/layout/EditorLayout'
import BlockEditor from '../components/shared/BlockEditor'
import LearnPage from '../components/shared/LearnPage'
import LessonViewer from '../dashboards/student/pages/LessonViewer'
import Documentation from '../components/shared/Documentation'
import TutorialViewer from '../dashboards/student/pages/TutorialViewer'

export const studentRoutes = [
  {
    element: <StudentLayout />,
    children: [
      { index: true, element: <StudentHome /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'classrooms', element: <StudentClassrooms /> },
      { path: 'classrooms/:classroomId', element: <StudentClassroomDetail /> },
      { path: 'classrooms/:classroomId/lessons/:lessonId', element: <LessonViewer /> },
      { path: 'lessons/:lessonId', element: <LessonViewer /> },
      { path: 'learn', element: <LearnPage /> },
      { path: 'docs', element: <Documentation /> },
      { path: 'lessons', element: <LessonPage /> },
      { path: 'tutorials', element: <TutorialPage /> },
      { path: 'feedback', element: <FeedbackPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ]
  },
  {
    element: <EditorLayout />,
    children: [
      { path: 'editor', element: <BlockEditor /> },
      { path: 'editor/:id', element: <BlockEditor /> },
      { path: 'tutorials/:tutorialId', element: <TutorialViewer /> },
    ]
  }
]