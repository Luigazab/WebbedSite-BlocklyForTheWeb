import { 
  Sparkles, 
  School, 
  Users,
  Code2
} from 'lucide-react'
import SignIn from '../../components/forms/SignIn'

const Login = () => {
  return (
  <div className="items-center px-6 py-16 justify-center p-4">
    <div className="flex flex-col items-center justify-center mx-auto w-full max-w-7xl gap-5">
      <div className="signup">
          <div className='mb-2'>
            <h2>Log In </h2>
            <p className="pl-2">Sign in to your account</p>
          </div>
          <SignIn/>
          
      </div>
      <a href='/register' className='mt-12 text-2xl font-bold text-blockly-light btn btn-secondary'>I don't have an account.</a>
    </div>
  </div>
  )
}

export default Login