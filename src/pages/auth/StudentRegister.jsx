import { Link, useNavigate } from "react-router";
import SignUp from "../../components/forms/SignUp";
import { Button } from "#components/ui/button";

const StudentRegister = () => {
  const navigate = useNavigate()
  return (
    <div className="items-center px-6 py-16 justify-center p-4">
      <div className="flex flex-col items-center justify-center mx-auto w-full max-w-7xl gap-5">
        <div className="signup border border-border">
            <div className="flex mr-3">
                <div className="leading-tight w-[90%]">
                    <h2>Welcome to WebbedSite!</h2>
                    <p>Sign up with your email</p>
                </div>
                <img src="/student.png" alt="" className="h-auto object-contain" />
            </div>
           <SignUp role="student"/>
        </div>
        <Button onClick={() => navigate('/login')} variant="primaryOutline">I already have an account.</Button>
      </div>
    </div>
  );
};

export default StudentRegister;
