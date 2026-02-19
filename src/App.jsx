// import { Route, Routes } from 'react-router'
// import LandingPage from './pages/public/LandingPage'
// import Login from './pages/auth/Login'
// import Register from './pages/auth/Register'
// import Auth from './components/public/layouts/Auth'
// import StudentRegister from './pages/auth/StudentRegister'
// import TeacherRegister from './pages/auth/TeacherRegister'
// import Lessons from './pages/public/Lessons'
// import Documentations from './pages/public/Documentations'
// import Public from './components/public/layouts/Public'
// import TryEditor from './pages/public/TryEditor'
// import Home from './pages/student/home'
// import Dashboard from './components/app/layout/Dashboard'
import { useEffect } from 'react'
import Router from './router'
import Toast from './components/ui/Toast'
import { useAuthStore } from './store/authStore'

export default function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [])

  return (
    <>
      <Router />
      <Toast />  {/* lives outside the router so it renders on every page */}
    </>
  )
}

// const App = () => {
//   return (
//     <>
//       <Routes>
//         <Route index element={<LandingPage/>}/>
//         <Route element={<Auth/>}>
//           <Route path="login" element={<Login/>} />
//           <Route path="register" element={<Register/>} />
//           <Route path="register/student" element={<StudentRegister/>} />
//           <Route path="register/teacher" element={<TeacherRegister/>} />
//         </Route>
//         <Route element={<Public/>}>
//           <Route path="lesson" element={<Lessons/>}/>
//           <Route path="documentary" element={<Documentations/>}/>
//           <Route path="try-editor" element={<TryEditor/>}/>
//         </Route>
//         <Route element={<Dashboard/>}>
//           <Route path="home" element={<Home/>}/>
//         </Route>
//       </Routes>
//     </>
//   )
// }
