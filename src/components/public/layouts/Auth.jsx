import { Outlet } from "react-router"
import Header from "../Header"
import Footer from "../Footer"

const Auth = () => {
  return (
    <div className="min-h-screen bg-muted">
        <Header/>
        <main>
            <Outlet/>
        </main>
        <Footer/>
    </div>
  )
}

export default Auth