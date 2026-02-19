import Header from '../../components/public/Header'
import Hero from '../../components/public/Hero'
import Features from '../../components/public/Features'
import Stats from '../../components/public/Stats'
import WhyBlockly from '../../components/public/WhyBlockly'
import CTA from '../../components/public/CTA'
import Footer from '../../components/public/Footer'

const LandingPage = () => {
  return (
    <div className='min-h-screen '>
      <Header />
      <main>
        <Hero />
        <Features />
        <Stats />
        <WhyBlockly />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage;