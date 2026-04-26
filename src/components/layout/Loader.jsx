import PageWrapper from "./PageWrapper"

const Loader = () => {
  return (
    <PageWrapper>
      <div className="flex flex-col min-h-screen items-center justify-center">
          <img src="/4blocks.svg" alt="" className='animate-pulse h-[50vh] w-auto'/>
          <h1 className="animate-pulse text-4xl font-bold text-amber-600">Loading with efforts...</h1>
      </div>
    </PageWrapper>
  )
}

export default Loader