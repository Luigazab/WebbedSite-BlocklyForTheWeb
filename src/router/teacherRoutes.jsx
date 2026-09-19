import TeacherLayout from '../dashboards/teacher/TeacherLayout'
import TeacherHome from '../dashboards/teacher/pages/TeacherHome'
import TeacherClassrooms from '../dashboards/teacher/pages/TeacherClassroom'
// import FeedbackPage from '../dashboards/teacher/pages/FeedbackPage'
// import SettingsPage from '../components/shared/SettingsPage'
// import ProfilePage from '../components/shared/ProfilePage'
import EditorLayout from '../components/layout/EditorLayout'
import BlockEditor from '../components/shared/BlockEditor'
import ContentManagement from '@/dashboards/teacher/pages/ContentManagement'
import LecturePage from '@/dashboards/teacher/pages/LecturePage'
import QuizPage from '@/dashboards/teacher/pages/QuizPage'
import TutorialBuilderPage from '../dashboards/teacher/pages/TutorialBuilderPage'
import LaboratoryBuilderPage from '@/dashboards/teacher/pages/LaboratoryBuilderPage'
import ClassroomDetail from '@/dashboards/teacher/pages/ClassroomDetail'
import StudentsManagement from '@/dashboards/teacher/pages/StudentsManagement'
import GradesReport from '@/dashboards/teacher/pages/GradesReport'
import ProjectsPage from '#components/shared/ProjectsPage'
import ExercisePage from '@/pages/editor/ExercisePage'

export const teacherRoutes = [
  {
    element: <TeacherLayout />,
    children: [
      { index: true,                                       element: <TeacherHome /> },
      { path: 'projects',                                  element: <ProjectsPage /> },
      { path: 'content',                                   element: <ContentManagement /> },
//       // Classrooms
      { path: 'classrooms',                                element: <TeacherClassrooms /> },
      { path: 'classrooms/:classroomId',                   element: <ClassroomDetail /> },
      { path: 'classrooms/classroomdetail/see',            element: <ClassroomDetail/> },
      { path: 'students',                                  element: <StudentsManagement/> },
      { path: 'grades',                                    element: <GradesReport/> },
//       // Misc
//       { path: 'feedback',                                  element: <FeedbackPage /> },
//       { path: 'profile',                                   element: <ProfilePage /> },
//       { path: 'settings',                                  element: <SettingsPage /> },
    ]
  },
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
