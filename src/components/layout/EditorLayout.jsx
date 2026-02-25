import { Outlet } from 'react-router'

const EditorLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Outlet />
    </div>
  )
}

export default EditorLayout