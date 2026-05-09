import StudentLayout from '../dashboards/student/StudentLayout'
import StudentHome from '../dashboards/student/pages/StudentHome'
import FeedbackPage from '../dashboards/student/pages/FeedbackPage'
import StudentClassrooms from '../dashboards/student/pages/Classrooms'
import StudentClassroomDetail from '../dashboards/student/pages/StudentClassroomDetail'
import ProjectsPage from '../components/shared/ProjectsPage'
import SettingsPage from '../components/shared/SettingsPage'
import ProfilePage from '../components/shared/ProfilePage'
import EditorLayout from '../components/layout/EditorLayout'
import BlockEditor from '../components/shared/BlockEditor'
import LearnPage from '../components/shared/LearnPage'
// import LessonViewer from '../dashboards/student/pages/LessonViewer'
import Documentation from '../components/shared/Documentation'
import TutorialViewer from '../dashboards/student/pages/TutorialViewer'
import TopicViewer from '../dashboards/student/pages/TopicViewer'
import QuizAssessment from '../dashboards/student/pages/QuizAssessment'
import QuizResult from '../dashboards/student/pages/QuizResult'
import Loader from '../components/layout/Loader'
import CourseSelection from '../dashboards/student/pages/CourseSelection'
import WelcomeOnboarding from '../dashboards/student/pages/WelcomeOnboarding'
import Background from '../components/layout/Background'
import Course from '../pages/app/Course'
import LearnLayout from '../pages/app/LearnLayout'
import TopicsPage from '../pages/app/TopicsPage'
import LecturePage from '../pages/app/LecturePage'
import LessonPage from '../pages/app/LessonPage'



export const studentRoutes = [
  {
    element: <StudentLayout />,
    children: [
      { index: true,                                        element: <StudentHome />              },
      { path: 'projects',                                   element: <ProjectsPage />             },
      { path: 'classrooms',                                 element: <StudentClassrooms />        },
      { path: 'classrooms/:classroomId',                    element: <StudentClassroomDetail />   },
      // { path: 'classrooms/:classroomId/lessons/:lessonId',  element: <LessonViewer />             },
      // { path: 'lessons/:lessonId',                          element: <LessonViewer />             },
      { path: 'quiz',                                       element: <QuizAssessment />           },
      { path: 'quiz/result',                                element: <QuizResult />               },
      { path: 'docs',                                       element: <Documentation />            },
      { path: 'lessons',                                    element: <LessonPage />               },
      { path: 'feedback',                                   element: <FeedbackPage />             },
      { path: 'profile',                                    element: <ProfilePage />              },
      { path: 'settings',                                   element: <SettingsPage />             },
    ]
  },
  {
    element: <LearnLayout/>,
    children: [
      { path: 'learn',                                      element: <Course />                   },
      { path: 'learn/:courseSlug',                          element: <TopicsPage />               },
      { path: 'learn/:courseSlug/:slug',                    element: <LessonPage />              },
      { path: 'learn/:courseSlug/quiz-:slug',               element: <QuizAssessment />              },
      { path: 'lessonviewer',                               element: <LecturePage />              },
    ]
  },
  {
    element: <Background />,
    children: [
      { path: 'loader',                                     element: <Loader />                   },
      { path: 'course-select',                              element: <CourseSelection />          },
      { path: 'welcome',                                    element: <WelcomeOnboarding />        },
    ]
  },
  {
    element: <EditorLayout />,
    children: [
      { path: 'editor',                                     element: <BlockEditor />              },
      { path: 'editor/:id',                                 element: <BlockEditor />              },
      { path: 'learn/:courseSlug/tutorial-:slug',element: <TutorialViewer />           },
      { path: 'learn/:courseSlug/lab-:slug',     element: <TutorialViewer />           },
    ]
  }
]