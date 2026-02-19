import PageWrapper from "./PageWrapper"

const Loader = () => {
  return (
    <PageWrapper>
      <div className="flex flex-col min-h-screen items-center justify-center">
          <img src="/puzzle.svg" alt="" className='animate-pulse h-60 w-auto'/>
          <h1 className="animate-pulse">Loading with efforts...</h1>
      </div>
    </PageWrapper>
  )
}

export default Loader