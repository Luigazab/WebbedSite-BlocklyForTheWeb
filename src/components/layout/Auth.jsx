import { Outlet } from "react-router"
import Header from "./Header"
import Footer from "./Footer"

const Auth = () => {
  return (
    <div className="min-h-screen z-12 bg-[url('/auth2_bg.avif')] bg-repeat bg-scroll">
       <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50%"   // center horizontally
          cy="10%"   // center vertically
          r="60%"    // radius = half of viewport height/width
          fill="white"
        />
      </svg>
      <div className="relative h-full w-full bg-black/1">
        <Header/>
        <main>
            <Outlet/>
        </main>
        </div>
        {/* <Footer/> */}
    </div>
  )
}

export default Auth