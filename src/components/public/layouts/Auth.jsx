import { Outlet } from "react-router"
import Header from "../Header"
import Footer from "../Footer"

const Auth = () => {
  return (
    <div className="min-h-screen bg-slate-50">
        <Header/>
        <main>
            <Outlet/>
        </main>
        <Footer/>
    </div>
  )
}

export default Auth