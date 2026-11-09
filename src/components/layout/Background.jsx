import { Outlet } from 'react-router'

const Background = () => {
  return (
    <div className="min-h-screen z-12 bg-background bg-[url('/auth2_bg.avif')] dark:bg-[url('/auth_bg.jpg')] bg-repeat bg-scroll">
       <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50%"   // center horizontally
          cy="10%"   // center vertically
          r="60%"    // radius = half of viewport height/width
          fill="var(--background)"
        />
      </svg>
      <div className="relative h-full w-full">
        <main>
            <Outlet/>
        </main>
        </div>
    </div>
  )
}

export default Background
