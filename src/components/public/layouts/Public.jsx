import { Outlet } from "react-router"
import Header from "../Header"
import SmallFooter from "../SmallFooter"

const Public = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header/>
      <div className="min-h-screen">
        <Outlet/>
      </div>
      <SmallFooter/>
    </div>
  )
}

export default Public