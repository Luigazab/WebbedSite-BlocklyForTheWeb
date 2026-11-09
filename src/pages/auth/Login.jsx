import { Link, useNavigate } from 'react-router'
import SignIn from '../../components/forms/SignIn'
import { Button } from '#components/ui/button'

const Login = () => {
  const navigate = useNavigate()
  return (
  <div className="items-center px-6 py-16 justify-center p-4">
    {/* <div className="w-full max-w-7xl mx-auto mb-10 md:mb-20 flex flex-col md:items-center justify-center md:gap-8">
      <h1 className='font-bold text-3xl md:text-5xl text-slate-900'>Login to your account</h1>
      <p className='font-bold text-xl md:text-2xl text-slate-600'>Continue to where you left off by signing into your registered account</p>
    </div> */}
    <div className="flex flex-col items-center justify-center mx-auto w-full max-w-7xl gap-5">
      <div className="signup border border-border">
          <div className='mb-2'>
            <h2>Log In </h2>
            <p>Sign in to your account</p>
          </div>
          <SignIn/>
          
      </div>
      <Button onClick={() => navigate('/register')} variant="primaryOutline">I don't have an account.</Button>
    </div>
  </div>
  )
}

export default Login