import { projects } from '../data/projects.js'
import './Footer.css'

const year = new Date().getFullYear()

const links = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#proyectos', label: 'Proyectos' },
  { href: '#nosotros', label: 'Autores' },
]

// Cursos sin repetir, en orden (10-1, 10-2, 11-1…)
const courses = [...new Set(projects.map((p) => p.course).filter(Boolean))].sort()

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Este texto es el que Google lee para entender de qué trata la página */}
        <div className="footer__about">
          {/* Franja con los colores del colegio */}
          <div className="footer__flag" aria-hidden="true">
            <span /><span /><span />
          </div>
          <p className="footer__brand">Repositorio Colboy</p>
          <p className="footer__text">
            El repositorio de proyectos web de los estudiantes del <strong>Colegio de Boyacá</strong> (Colboy)
            en Tunja. Aquí se publican las páginas hechas en clase con HTML, CSS y JavaScript,
            con el acompañamiento de la <strong>UPTC</strong> en la práctica pedagógica.
          </p>
        </div>

        <nav className="footer__col" aria-label="Secciones">
          <p className="footer__label">Secciones</p>
          {links.map((l) => (
            <a key={l.href} href={l.href} className="footer__link">{l.label}</a>
          ))}
        </nav>

        <div className="footer__col">
          <p className="footer__label">En cifras</p>
          <p className="footer__stat"><span>{String(projects.length).padStart(2, '0')}</span> proyectos</p>
          {courses.length > 0 && (
            <p className="footer__stat"><span>{String(courses.length).padStart(2, '0')}</span> {courses.length === 1 ? 'curso' : 'cursos'}</p>
          )}
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {year} Repositorio Colboy · Colegio de Boyacá · UPTC</p>
        <a href="#inicio" className="round footer__top" aria-label="Volver arriba">
          <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 15.5V4.5M4.5 10 10 4.5l5.5 5.5" />
          </svg>
        </a> 
      </div>
    </footer>
  )
}

export default Footer