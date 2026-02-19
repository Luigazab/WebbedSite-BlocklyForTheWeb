import TeacherLayout from '../dashboards/teacher/TeacherLayout'
import TeacherHome from '../dashboards/teacher/pages/TeacherHome'
import CreateLesson from '../dashboards/teacher/pages/CreateLesson'
import CreateTutorial from '../dashboards/teacher/pages/CreateTutorial'
import Classrooms from '../dashboards/teacher/pages/Classrooms'
import StudentPerformance from '../dashboards/teacher/pages/StudentPerformance'
import FeedbackPage from '../dashboards/teacher/pages/FeedbackPage'
import TeacherProfile from '../dashboards/teacher/pages/TeacherProfile'
import ClassroomDetail from '../dashboards/teacher/pages/ClassroomDetail'
import Lessons from '../dashboards/teacher/pages/Lessons'

export const teacherRoutes = [
  {
    element: <TeacherLayout />,
    children: [
      { index: true, element: <TeacherHome /> },
      { path: 'lessons', element: <Lessons /> },
      { path: 'lessons/create', element: <CreateLesson /> },
      { path: 'lessons/:lessonId/edit', element: <CreateLesson /> },  // reuse for edit
      { path: 'tutorials/create', element: <CreateTutorial /> },
      { path: 'tutorials/:tutorialId/edit', element: <CreateTutorial /> },
      { path: 'classrooms', element: <Classrooms /> },
      { path: 'classrooms/:classroomId', element: <ClassroomDetail /> },
      { path: 'classrooms/:classroomId/performance', element: <StudentPerformance /> },
      { path: 'feedback', element: <FeedbackPage /> },
      { path: 'profile', element: <TeacherProfile /> },
    ]
  }
]