import PageWrapper from "./PageWrapper"

const Loader = () => {
  return (
    <PageWrapper>
      {/* <div className="flex flex-col min-h-screen items-center justify-center">
          <img src="/4blocks.svg" alt="" className='animate-pulse h-[50vh] w-auto'/>
      </div> */}
      <div className="relative min-h-screen flex flex-col items-center justify-center">
        {/* Centered GIF */}
        <img
          src="/animated_logo.gif"
          alt="Loader background"
          className="w-auto h-52 object-contain -translate-x-4"
        />

        {/* Overlay text */}
        <h1 className="absolute text-white text-shadow-lg text-7xl font-extrabold flex -translate-y-8">
          <span className="animate-bounce  text-amber-400" style={{animationDelay:"0s"}}>{`<`}</span>
          <span className="animate-bounce  " style={{animationDelay:"0.1s"}}>W</span>
          <span className="animate-bounce  " style={{animationDelay:"0.2s"}}>e</span>
          <span className="animate-bounce  " style={{animationDelay:"0.3s"}}>b</span>
          <span className="animate-bounce  " style={{animationDelay:"0.4s"}}>b</span>
          <span className="animate-bounce  " style={{animationDelay:"0.5s"}}>e</span>
          <span className="animate-bounce  " style={{animationDelay:"0.6s"}}>d</span>
          <span className="animate-bounce   text-amber-400" style={{animationDelay:"0.7s"}}>S</span>
          <span className="animate-bounce   text-amber-400" style={{animationDelay:"0.8s"}}>i</span>
          <span className="animate-bounce   text-amber-400" style={{animationDelay:"0.9s"}}>t</span>
          <span className="animate-bounce   text-amber-400" style={{animationDelay:"1s"}}>e</span>
          <span className="animate-bounce   text-amber-400" style={{animationDelay:"1.1s"}}>{`/`}</span>
          <span className="animate-bounce   text-amber-400" style={{animationDelay:"1.2s"}}>{`>`}</span>
        </h1>
        <h2 className="animate-pulse text-4xl font-bold text-amber-600 pt-8">Loading with efforts...</h2>
      </div>
    </PageWrapper>
  )
}

export default Loader