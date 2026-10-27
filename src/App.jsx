import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Process from './components/Process'
import Before from './components/Before'
import Projects from './components/Projects'
import Authors from './components/Authors'
import Footer from './components/Footer'
import './styles/theme.css'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Process />
        <Before />
        <Projects />
        <Authors/>
      </main>
      <Footer />
    </>
  )
}

export default App