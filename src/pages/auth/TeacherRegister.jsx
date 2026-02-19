import SignUp from "../../components/forms/SignUp";

const TeacherRegister = () => {


  return (
    <div className="items-center px-6 py-16 md:py-30 justify-center p-4">
      <div className="flex flex-col lg:flex-row items-center justify-evenly mx-auto w-full max-w-7xl gap-12">
        <div className="signup">
            <div className="flex mr-3">
                <div className="leading-tight w-[90%]">
                    <h2>Welcome to WebbedSite!</h2>
                    <p className="pl-6">Sign up with your email</p>
                </div>
                <img src="/teacher.png" alt="" className="h-auto object-contain" />
            </div>
           <SignUp role="teacher"/>
        </div>
      </div>
    </div>
  );
};

export default TeacherRegister;
