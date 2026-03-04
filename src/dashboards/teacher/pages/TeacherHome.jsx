import PageWrapper from '../../../components/layout/PageWrapper'
import { ChartArea, ChevronLeftCircle, ChevronRightCircle, Edit, Presentation } from 'lucide-react'

const TeacherHome = () => {
  return (
    <PageWrapper>
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6'>
        <div className='row-span-9 grid grid-rows-5 space-y-4 items-center justify-center'>
          <div >
            <h1 className='text-2xl font-bold text-slate-800'>Teacher Dashboard</h1>
            <p className='text-sm text-slate-500'>Overview of class activities</p>
          </div>
          <div className='row-span-4 space-y-4 bg-white rounded-md shadow px-4 py-4'>
            <h2 className='text-xl font-bold text-slate-700'>Quick Actions</h2>
            <hr  className='text-slate-300'/>
            <button className="w-full btn btn-primary px-4 py-2 flex gap-2">
              <Edit/>
              <span>Create Projects</span>
            </button>
            <button className="w-full btn btn-secondary px-4 py-2 flex gap-2">
              <Presentation/>
              <span>Write Lessons</span>
            </button>
            <button className="w-full btn btn-lead px-4 py-2 flex gap-2">
              <ChartArea/>
              <span>View Reports</span>
            </button>
          </div>
          <div className='row-span-4 space-y-4 bg-white rounded-md shadow px-4 py-4'>
            <h2 className='text-xl font-bold text-slate-700'>Quick Actions</h2>
            <hr  className='text-slate-300'/>
            <button className="btn btn-primary px-4 py-2 flex gap-2">
              <Edit/>
              <span>Create Assignments</span>
            </button>
            <button className="btn btn-secondary px-4 py-2 flex gap-2">
              <Presentation/>
              <span>Create Assignments</span>
            </button>
            <button className="btn btn-lead px-4 py-2 flex gap-2">
              <ChartArea/>
              <span>Create Assignments</span>
            </button>
          </div>
        </div>
        <div className='col-span-2 row-span-1 flex items-center gap-2 bg-white shadow px-4 py-2 rounded-xl'>
          <ChevronLeftCircle/>
          <div className='w-full space-y-2 flex flex-col justify-between'>
            <h2 className='text-xl font-bold text-slate-700'>Classroom Overview <span>(Class ICT A)</span></h2>
            <hr  className='text-slate-300'/>
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-purple-300 p-4 py-2 rounded-md shadow border border-purple-300 bg-[url("/student.png")] bg-contain bg-no-repeat bg-bottom-right'>
                <h4 className='font-bold text-3xl'>20</h4>
                <p>students</p>
              </div>
              <div className='bg-orange-100 p-4 py-2 rounded-md shadow border border-orange-300 bg-[url("/lab_icon.png")] bg-contain bg-no-repeat bg-bottom-right'>
                <h4 className='font-bold text-3xl'>8/10</h4>
                <p>assignments pending</p>
              </div>
            </div>
            <span className='flex justify-end font-bold text-slate-600 hover:underline'><a href="#">View Classroom</a></span>
          </div>
          <ChevronRightCircle/>
        </div>
        <div 
            data-tour="hero-banner"
            className="col-span-3 bg-blockly-dark/80 rounded-2xl text-white bg-[url('/home_bg.jpg')] bg-cover bg-center shadow-lg"
          >
          <div className="flex flex-col md:flex-row items-center justify-start gap-20 p-4 md:p-8 md:px-8 bg-purple-950/80 rounded-2xl bg-[url('/teacher_home_illustration.png')] bg-size-[60%] bg-no-repeat bg-bottom-right">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Welcome to <span className="bg-blockly-green px-2 rounded">WebbedSite</span>
              </h2>
              <p className="mb-6 text-white max-w-xs">
                Kickstart your web development journey with fun, interactive building blocks! 
                Learn the essentials of HTML, CSS, and JavaScript in a playful, hands-on way that makes coding click.
              </p>
              <button className="btn btn-accent">Get Started</button>
            </div>
          </div>
        </div>
        <div className="col-span-3 row-span-8 space-y-4">
          <div>
            <h2 className='text-2xl font-bold'>Student Engagement</h2>
            <div className='w-full space-y-2 flex flex-col justify-between  bg-white rounded-md shadow p-8 py-4'>
              <h2 className='text-xl font-bold text-slate-700'>Classroom Overview <span>(Class ICT A)</span></h2>
              <hr  className='text-slate-300'/>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-purple-300 p-4 py-2 rounded-md shadow border border-purple-300 bg-[url("/student.png")] bg-contain bg-no-repeat bg-bottom-right'>
                  <h4 className='font-bold text-3xl'>20</h4>
                  <p>students</p>
                </div>
                <div className='bg-orange-100 p-4 py-2 rounded-md shadow border border-orange-300 bg-[url("/lab_icon.png")] bg-contain bg-no-repeat bg-bottom-right'>
                  <h4 className='font-bold text-3xl'>8/10</h4>
                  <p>assignments pending</p>
                </div>
              </div>
              <span className='flex justify-end font-bold text-slate-600 hover:underline'><a href="#">View Classroom</a></span>
            </div>
          </div>
          <div>
            <div className='w-full space-y-2 flex flex-col justify-between  bg-white rounded-md shadow p-8 py-4'>
              <h2 className='text-xl font-bold text-slate-700'>Classroom Overview <span>(Class ICT A)</span></h2>
              <hr  className='text-slate-300'/>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-purple-300 p-4 py-2 rounded-md shadow border border-purple-300 bg-[url("/student.png")] bg-contain bg-no-repeat bg-bottom-right'>
                  <h4 className='font-bold text-3xl'>20</h4>
                  <p>students</p>
                </div>
                <div className='bg-orange-100 p-4 py-2 rounded-md shadow border border-orange-300 bg-[url("/lab_icon.png")] bg-contain bg-no-repeat bg-bottom-right'>
                  <h4 className='font-bold text-3xl'>8/10</h4>
                  <p>assignments pending</p>
                </div>
              </div>
              <span className='flex justify-end font-bold text-slate-600 hover:underline'><a href="#">View Classroom</a></span>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

export default TeacherHome

// -------------------------------------------------
// [Top Bar]
// - Welcome message ("Welcome back, Ms. Smith!")
// - Notifications icon | Profile dropdown

// -------------------------------------------------
// [Section 1: Classroom Overview]
// - Card grid: Each classroom shows
//    - Class name
//    - # of students
//    - # of assignments pending
//    - Quick link: "View Classroom"

// -------------------------------------------------
// [Section 2: Quick Actions]
// - Horizontal buttons:
//    [Create Assignment] [Write Lesson] [View Reports]

// -------------------------------------------------
// [Section 3: Upcoming Tasks]
// - Calendar widget (month view)
// - Sidebar list: "Next 7 days"
//    - Assignment deadlines
//    - Scheduled lessons/quizzes

// -------------------------------------------------
// [Section 4: Student Engagement Snapshot]
// - Pie chart: Completion Rate
// - Trend indicator: "Engagement ↓ 10% this week"
// - Clickable segments → drill down to student list

// -------------------------------------------------
// [Section 5: Action Needed]
// - Table:
//    Student | Section | Missing Assignments | Quick Action (Message / Assign Help)

// -------------------------------------------------
// [Section 6: Communication]
// - Announcements feed (broadcast messages)
// - Inbox preview (last 5 messages)
// - Button: "Go to Full Inbox"

// -------------------------------------------------
// [Footer]
// - Settings | Help | Contact Support
