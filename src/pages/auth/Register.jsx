import { Link } from 'react-router'

const Register = () => {
  return (
    <div className="flex flex-col items-center px-6 py-16 justify-center p-4">
      <div className="w-full max-w-7xl mx-auto mb-20 flex flex-col items-center justify-center gap-8">
        <h1 className='font-bold text-5xl text-white'>Create your account</h1>
        <p className='font-bold text-2xl text-gray-900'>Start creating your free account by selecting the account type that best matches you.</p>
      </div>
      <div className='flex flex-col lg:flex-row items-center justify-evenly mx-auto w-full max-w-7xl gap-12'>
        <div className='signup lg:w-1/2'>
          <div>
            <div className='flex justify-between pr-6'>
              <div className=' w-[90%]'>
                <h2>I'm a Student</h2>
                <p>Explore our courses and activies, plus:</p>
              </div>
            <img src="/student.png" alt="" className="h-auto object-contain"/>
            </div>
            <ul>
              <li>Save your projects and progress</li>
              <li>Join your teacher's classroom section</li>
              <li>Access WebbedSite free courses</li>
            </ul>
          </div>
          <Link to='student'>
            <button className='btn mt-8'>Sign up as a student</button>
          </Link>
        </div>
        <div className='signup lg:w-1/2'>
          <div className='flex justify-between pr-6'>
            <div className=' w-[90%]'>
              <h2>I'm a Teacher</h2>
              <p>All student account features, plus:</p>
            </div>
            <img src="/teacher.png" alt="" className="h-auto object-contain"/>
          </div>
          <ul>
            <li>Create classroom sections and assign materials</li>
            <li>Track student progress and give feedback</li>
            <li>Acces assessments and answer keys</li>
          </ul>
          <Link to="teacher">
            <button className='btn mt-8'>Sign up as a teacher</button>
          </Link>
        </div>
      </div>
      <a href='/login' className='mt-12 text-2xl font-bold text-blockly-light btn btn-secondary'>I already have an account</a>
    </div>
  )
}

export default Register