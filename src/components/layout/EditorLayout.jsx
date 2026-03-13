import { Outlet } from 'react-router'
import { TourProvider } from '../tour/TourProvider'

const EditorLayout = () => {
  return (
    <TourProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </TourProvider>
  )
}

export default EditorLayout