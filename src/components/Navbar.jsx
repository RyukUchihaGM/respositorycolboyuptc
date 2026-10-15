import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './Navbar.css'

const links = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#nosotros', label: 'Nosotros' },
]

// Marca el link de la sección que está en pantalla
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [ids])

  return [active, setActive]
}

const sectionIds = links.map((l) => l.href.slice(1))

function Navbar() {
  const [active, setActive] = useActiveSection(sectionIds)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const linksRef = useRef(null)
  const panelRef = useRef(null)
  const [indicator, setIndicator] = useState(null)

  // Sombra al bajar de la parte superior
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Posición del fondo deslizante bajo el link activo
  useLayoutEffect(() => {
    const measure = () => {
      const el = linksRef.current?.querySelector(`[data-id="${active}"]`)
      if (!el) return setIndicator(null)
      setIndicator({ x: el.offsetLeft, w: el.offsetWidth })
    }
    measure()
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure)
    return () => window.removeEventListener('resize', measure)
  }, [active])

  // Cerrar el menú móvil con Escape o al pasar a escritorio
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    const mql = window.matchMedia('(min-width: 641px)')
    const onChange = () => { if (mql.matches) setOpen(false) }
    window.addEventListener('keydown', onKey)
    mql.addEventListener('change', onChange)
    return () => {
      window.removeEventListener('keydown', onKey)
      mql.removeEventListener('change', onChange)
    }
  }, [open])

  // Panel cerrado fuera del orden de tabulación (compatible con React 18 y 19)
  useEffect(() => {
    if (panelRef.current) panelRef.current.inert = !open
  }, [open])

  const select = (id) => {
    setActive(id)
    setOpen(false)
  }

  return (
    <header className="navbar" data-scrolled={scrolled} data-open={open}>
      <nav className="navbar__container" aria-label="Principal">
        <div className="navbar__row">
          <a href="#inicio" className="navbar__brand" onClick={() => select('inicio')}>
            <svg className="navbar__icon" viewBox="0 0 28 28" aria-hidden="true">
              {/* Parte trasera de la carpeta con pestaña */}
              <path className="navbar__icon-back" d="M3 7.5A2.5 2.5 0 0 1 5.5 5h5.3a2.5 2.5 0 0 1 1.8.75L14.4 7.5h8.1A2.5 2.5 0 0 1 25 10v11.5a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 3 21.5Z" />
              {/* Hoja que asoma */}
              <rect className="navbar__icon-paper" x="6" y="8.5" width="16" height="10" rx="1.5" />
              {/* Frente de la carpeta */}
              <path className="navbar__icon-front" d="M3 12.5A2.5 2.5 0 0 1 5.5 10h17a2.5 2.5 0 0 1 2.5 2.5v9a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 3 21.5Z" />
            </svg>
            <span className="navbar__name">Repositorio</span>
          </a>

          <div className="navbar__links" ref={linksRef}>
            {indicator && (
              <span
                className="navbar__indicator"
                aria-hidden="true"
                style={{ '--x': `${indicator.x}px`, '--w': `${indicator.w}px` }}
              />
            )}
            {links.map((l) => {
              const id = l.href.slice(1)
              return (
                <a
                  key={l.href}
                  href={l.href}
                  data-id={id}
                  className="navbar__link"
                  aria-current={active === id ? 'location' : undefined}
                  onClick={() => select(id)}
                >
                  {l.label}
                </a>
              )
            })}
          </div>

          <a href="#contacto" className="navbar__button" onClick={() => setOpen(false)}>
            Contáctanos
          </a>

          <button
            type="button"
            className="navbar__toggle"
            aria-expanded={open}
            aria-controls="navbar-menu"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="navbar__toggle-line" />
            <span className="navbar__toggle-line" />
          </button>
        </div>

        {/* Menú desplegable en móvil: la muesca crece hacia abajo */}
        <div className="navbar__panel" id="navbar-menu" ref={panelRef}>
          <div className="navbar__panel-inner">
            {links.map((l) => {
              const id = l.href.slice(1)
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className="navbar__panel-link"
                  aria-current={active === id ? 'location' : undefined}
                  onClick={() => select(id)}
                >
                  {l.label}
                </a>
              )
            })}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar