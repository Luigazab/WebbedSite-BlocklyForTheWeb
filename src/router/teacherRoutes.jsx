import { lazy } from 'react'
const SettingsPage = lazy(() => import('../components/shared/SettingsPage'))
const ReportsPage = lazy(() => import('../components/shared/ReportsPage'))
import { Navigate } from 'react-router'
const TeacherLayout = lazy(() => import('../dashboards/teacher/TeacherLayout'))
const TeacherHome = lazy(() => import('../dashboards/teacher/pages/TeacherHome'))
const TeacherClassrooms = lazy(() => import('../dashboards/teacher/pages/TeacherClassroom'))
// import FeedbackPage from '../dashboards/teacher/pages/FeedbackPage'
// import SettingsPage from '../components/shared/SettingsPage'
// import ProfilePage from '../components/shared/ProfilePage'
const EditorLayout = lazy(() => import('../components/layout/EditorLayout'))
const BlockEditor = lazy(() => import('../components/shared/BlockEditor'))
const ContentManagement = lazy(() => import('@/dashboards/teacher/pages/ContentManagement'))
const LecturePage = lazy(() => import('@/dashboards/teacher/pages/LecturePage'))
const QuizPage = lazy(() => import('@/dashboards/teacher/pages/QuizPage'))
const TutorialBuilderPage = lazy(() => import('../dashboards/teacher/pages/TutorialBuilderPage'))
const LaboratoryBuilderPage = lazy(() => import('@/dashboards/teacher/pages/LaboratoryBuilderPage'))
const ClassroomDetail = lazy(() => import('@/dashboards/teacher/pages/ClassroomDetail'))
const StudentsManagement = lazy(() => import('@/dashboards/teacher/pages/StudentsManagement'))
const GradesReport = lazy(() => import('@/dashboards/teacher/pages/GradesReport'))
const ProjectsPage = lazy(() => import('#components/shared/ProjectsPage'))
const ExercisePage = lazy(() => import('@/pages/editor/ExercisePage'))
const CoursesLibrary = lazy(() => import('@/dashboards/admin/pages/CoursesLibrary'))
const CourseDetail = lazy(() => import('@/dashboards/admin/pages/CourseDetail'))
const LessonPage = lazy(() => import('@/pages/app/LessonPage'))
const LessonLayout = lazy(() => import('../components/layout/LessonLayout'))
const LegacyLessonRedirect = lazy(() => import('../components/layout/LegacyLessonRedirect'))
export const teacherRoutes = [
  {
    element: <TeacherLayout />,
    children: [
      { path: 'courses', element: <CoursesLibrary readOnly /> },
      { path: 'courses/:id', element: <CourseDetail readOnly /> },
      { index: true,                                       element: <TeacherHome /> },
      { path: 'projects',                                  element: <ProjectsPage /> },
      { path: 'content',                                   element: <ContentManagement /> },
//       // Classrooms
      { path: 'classrooms',                                element: <TeacherClassrooms /> },
      { path: 'classrooms/:classroomId',                   element: <ClassroomDetail /> },
      { path: 'classrooms/classroomdetail/see',            element: <ClassroomDetail/> },
      { path: 'students', element: <Navigate to="/teacher/classrooms" replace /> },
      { path: 'grades', element: <Navigate to="/teacher/classrooms" replace /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'help', element: <ReportsPage /> },
      { path: 'profile', element: <Navigate to="/teacher/settings" replace /> },
//       // Misc
//       { path: 'feedback',                                  element: <FeedbackPage /> },
//       { path: 'profile',                                   element: <ProfilePage /> },
//       { path: 'settings',                                  element: <SettingsPage /> },
    ]
  },
  {
    element: <LessonLayout />,
    children: [
      { path: 'lessons/:id/:courseSlug/:slug', element: <LessonPage preview /> },
    ],
  },
  { path: 'courses/:id/view/:courseSlug/:slug', element: <LegacyLessonRedirect preview /> },
  {
    element: <EditorLayout />,
    children: [
      { path: 'editor',                                   element: <BlockEditor /> },
      { path: 'editor/:id',                               element: <BlockEditor /> },
    ]
  },
  { path: 'exercise',                                     element: <ExercisePage/> },
  { path: 'lecture/create',                               element: <LecturePage /> },
  { path: 'lecture/edit/:id',                             element: <LecturePage /> },
  { path: 'quiz/create',                                  element: <QuizPage /> },
  { path: 'quiz/edit/:id',                                element: <QuizPage /> },
  { path: 'tutorial/create',                              element: <TutorialBuilderPage /> },
  { path: 'tutorial/edit/:id',                            element: <TutorialBuilderPage /> },
  { path: 'laboratory/create',                            element: <LaboratoryBuilderPage /> },
  { path: 'laboratory/edit/:id',                          element: <LaboratoryBuilderPage /> },
]
