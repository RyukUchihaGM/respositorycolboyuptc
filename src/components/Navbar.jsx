import { useEffect, useRef, useState } from 'react'
import './Navbar.css'

const links = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#proyectos', label: 'Proyectos' },
  { href: '#nosotros', label: 'Nosotros' },
]

const Arrow = (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 11 11 5M6 5h5v5" />
  </svg>
)

function Navbar() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  // Escape cierra el menú móvil; también se cierra al pasar a escritorio
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    const mql = window.matchMedia('(min-width: 861px)')
    const onChange = () => { if (mql.matches) setOpen(false) }
    window.addEventListener('keydown', onKey)
    mql.addEventListener('change', onChange)
    return () => {
      window.removeEventListener('keydown', onKey)
      mql.removeEventListener('change', onChange)
    }
  }, [open])

  // Menú cerrado fuera del orden de tabulación
  useEffect(() => {
    if (panelRef.current) panelRef.current.inert = !open
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className="nav" data-open={open}>
      <a href="#inicio" className="nav__brand" onClick={close}>
        <svg className="nav__logo" viewBox="0 0 28 28" aria-hidden="true">
          <path fill="var(--c-red)" d="M3 7.5A2.5 2.5 0 0 1 5.5 5h5.3a2.5 2.5 0 0 1 1.8.75L14.4 7.5h8.1A2.5 2.5 0 0 1 25 10v11.5a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 3 21.5Z" />
          <rect fill="#ffffff" x="6" y="8.5" width="16" height="10" rx="1.5" />
          <path fill="var(--c-green-2)" d="M3 12.5A2.5 2.5 0 0 1 5.5 10h17a2.5 2.5 0 0 1 2.5 2.5v9a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 3 21.5Z" />
        </svg>
        <span className="nav__name">Repositorio<br />Colboy</span>
      </a>

      <nav className="nav__bar" aria-label="Principal">
        <ul className="nav__links">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="nav__link">{l.label}</a>
            </li>
          ))}
        </ul>

        <a href="#proyectos" className="pill nav__cta">
          Explorar proyectos
          <span className="pill__icon">{Arrow}</span>
        </a>

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="nav__toggle-line" />
          <span className="nav__toggle-line" />
        </button>
      </nav>

      {/* Menú en celular */}
      <div className="nav__panel" id="nav-menu" ref={panelRef}>
        {links.map((l) => (
          <a key={l.href} href={l.href} className="nav__panel-link" onClick={close}>
            {l.label}
          </a>
        ))}
        <a href="#proyectos" className="pill nav__panel-cta" onClick={close}>
          Explorar proyectos
          <span className="pill__icon">{Arrow}</span>
        </a>
      </div>
    </header>
  )
}

export default Navbar