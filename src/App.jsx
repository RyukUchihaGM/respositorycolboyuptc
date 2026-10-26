import Navbar from './components/Navbar'
import Hero from './components/Hero'
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
        <Projects />
        <Authors/>
      </main>
      <Footer />
    </>
  )
}

export default App