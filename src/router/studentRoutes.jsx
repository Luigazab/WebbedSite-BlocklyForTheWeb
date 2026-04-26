import StudentLayout from '../dashboards/student/StudentLayout'
import StudentHome from '../dashboards/student/pages/StudentHome'
import LessonPage from '../dashboards/student/pages/LessonPage'
import FeedbackPage from '../dashboards/student/pages/FeedbackPage'
import StudentClassrooms from '../dashboards/student/pages/Classrooms'
import StudentClassroomDetail from '../dashboards/student/pages/StudentClassroomDetail'
import ProjectsPage from '../components/shared/ProjectsPage'
import SettingsPage from '../components/shared/SettingsPage'
import ProfilePage from '../components/shared/ProfilePage'
import EditorLayout from '../components/layout/EditorLayout'
import BlockEditor from '../components/shared/BlockEditor'
import LearnPage from '../components/shared/LearnPage'
import LessonViewer from '../dashboards/student/pages/LessonViewer'
import Documentation from '../components/shared/Documentation'
import TutorialViewer from '../dashboards/student/pages/TutorialViewer'
import TopicViewer from '../dashboards/student/pages/TopicViewer'
import QuizAssessment from '../dashboards/student/pages/QuizAssessment'
import QuizResult from '../dashboards/student/pages/QuizResult'

export const studentRoutes = [
  {
    element: <StudentLayout />,
    children: [
      { index: true,                                        element: <StudentHome />              },
      { path: 'projects',                                   element: <ProjectsPage />             },
      { path: 'classrooms',                                 element: <StudentClassrooms />        },
      { path: 'classrooms/:classroomId',                    element: <StudentClassroomDetail />   },
      { path: 'classrooms/:classroomId/lessons/:lessonId',  element: <LessonViewer />             },
      { path: 'lessons/:lessonId',                          element: <LessonViewer />             },
      { path: 'quiz',                                       element: <QuizAssessment />           },
      { path: 'quiz/result',                                element: <QuizResult />           },
      { path: 'learn',                                      element: <LearnPage />                },
      { path: 'learn/:topicId',                             element: <TopicViewer />              },
      { path: 'docs',                                       element: <Documentation />            },
      { path: 'lessons',                                    element: <LessonPage />               },
      { path: 'feedback',                                   element: <FeedbackPage />             },
      { path: 'profile',                                    element: <ProfilePage />              },
      { path: 'settings',                                   element: <SettingsPage />             },
    ]
  },
  {
    element: <EditorLayout />,
    children: [
      { path: 'editor',                                     element: <BlockEditor />              },
      { path: 'editor/:id',                                 element: <BlockEditor />              },
      { path: 'tutorials/:tutorialId',                      element: <TutorialViewer />           },
    ]
  }
]