import TeacherLayout from '../dashboards/teacher/TeacherLayout'
import TeacherHome from '../dashboards/teacher/pages/TeacherHome'
import CreateLesson from '../dashboards/teacher/pages/CreateLesson'
import CreateTutorial from '../dashboards/teacher/pages/CreateTutorial'
import Classrooms from '../dashboards/teacher/pages/Classrooms'
import StudentPerformance from '../dashboards/teacher/pages/StudentPerformance'
import FeedbackPage from '../dashboards/teacher/pages/FeedbackPage'
import ClassroomDetail from '../dashboards/teacher/pages/ClassroomDetail'
import Lessons from '../dashboards/teacher/pages/Lessons'
import ProjectsPage from '../components/shared/ProjectsPage'
import LearnPage from '../components/shared/LearnPage'
import SettingsPage from '../components/shared/SettingsPage'
import ProfilePage from '../dashboards/teacher/pages/TeacherProfile'
import EditorLayout from '../components/layout/EditorLayout'
import BlockEditor from '../components/shared/BlockEditor'

export const teacherRoutes = [
  {
    element: <TeacherLayout />,
    children: [
      { index: true, element: <TeacherHome /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'learn', element: <LearnPage /> },
      { path: 'lessons', element: <Lessons /> },
      { path: 'lessons/create', element: <CreateLesson /> },
      { path: 'lessons/:lessonId/edit', element: <CreateLesson /> }, 
      { path: 'tutorials/create', element: <CreateTutorial /> },
      { path: 'tutorials/:tutorialId/edit', element: <CreateTutorial /> },
      { path: 'classrooms', element: <Classrooms /> },
      { path: 'classrooms/:classroomId', element: <ClassroomDetail /> },
      { path: 'classrooms/:classroomId/performance', element: <StudentPerformance /> },
      { path: 'performance', element: <StudentPerformance /> },
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
    ]
  }
]