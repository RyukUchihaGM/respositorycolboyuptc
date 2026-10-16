import { useEffect, useMemo, useRef, useState } from 'react'
import { projects as rawProjects } from '../data/projects.js'
import './Projects.css'

const ALL = 'Todos'
const PREVIEW_WIDTH = 1280 // ancho "de escritorio" con el que se dibuja la vista previa
const PREVIEW_HEIGHT = 800

// Permisos del iframe: deja usar la página (scripts, formularios, alertas)
// pero no le permite redirigir tu sitio.
const SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals'

// Tamaños de pantalla para revisar cada página en el modal
const DEVICES = [
  { id: 'desktop', label: 'Escritorio', width: '100%' },
  { id: 'tablet', label: 'Tablet', width: '820px' },
  { id: 'mobile', label: 'Celular', width: '390px' },
]

const AVATAR_COLORS = ['#0b7a3e', '#c8102e', '#1d3fd8', '#8a5a00', '#5b3cc4']

/* ---------- Utilidades ---------- */

// Si el enlace no trae https:// el navegador lo trata como una ruta de TU sitio
const normalizeUrl = (url) => (/^https?:\/\//i.test(url) ? url : `https://${url.replace(/^\/+/, '')}`)

const domainOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

// Minúsculas y sin tildes, para que "galeria" encuentre "Galería"
const fold = (text = '') => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// author puede ser un nombre ('Laura Gómez') o una lista (['Laura Gómez', 'Andrés Pérez'])
const toList = (value) => (Array.isArray(value) ? value : [value]).filter(Boolean)

const projects = rawProjects.map((p) => {
  const url = normalizeUrl(p.url)
  return { ...p, url, domain: domainOf(url), authors: toList(p.authors ?? p.author) }
})

/* ---------- Íconos ---------- */

const Icon = {
  search: (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" /><path d="m13.2 13.2 3.3 3.3" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m7 6-4 4 4 4M13 6l4 4-4 4" />
    </svg>
  ),
  external: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3.5h6.5V10M12.5 3.5 4 12" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  ),
  prev: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3.5 5.5 8l4.5 4.5" />
    </svg>
  ),
  next: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  ),
  desktop: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1.75" y="2.75" width="12.5" height="8.5" rx="1.5" /><path d="M5.5 13.75h5M8 11.25v2.5" />
    </svg>
  ),
  tablet: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="1.75" width="10" height="12.5" rx="1.5" /><path d="M7 12h2" />
    </svg>
  ),
  mobile: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4.5" y="1.75" width="7" height="12.5" rx="1.5" /><path d="M7.25 12h1.5" />
    </svg>
  ),
}

/* ---------- Avatar con iniciales del estudiante ---------- */

function Avatar({ name = '' }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return (
    <span className="project__avatar" style={{ '--c': AVATAR_COLORS[hash % AVATAR_COLORS.length] }} aria-hidden="true">
      {initials}
    </span>
  )
}

/* ---------- Vista previa en vivo, escalada al tamaño de la tarjeta ---------- */

function LivePreview({ project }) {
  const boxRef = useRef(null)
  const [scale, setScale] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / PREVIEW_WIDTH))
    ro.observe(box)
    return () => ro.disconnect()
  }, [])

  if (project.image) {
    return (
      <span className="project__shot" ref={boxRef} data-loaded="true">
        <img src={project.image} alt="" loading="lazy" decoding="async" />
      </span>
    )
  }

  return (
    <span className="project__shot" ref={boxRef} data-loaded={loaded}>
      <span className="project__loading" aria-hidden="true" />
      {scale > 0 && (
        <iframe
          className="project__iframe"
          src={project.url}
          title={`Vista previa de ${project.title}`}
          loading="lazy"
          scrolling="no"
          tabIndex={-1}
          aria-hidden="true"
          sandbox={SANDBOX}
          onLoad={() => setLoaded(true)}
          style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT, scale: String(scale) }}
        />
      )}
    </span>
  )
}

/* ---------- Tarjeta ---------- */

function ProjectCard({ project, onOpen }) {
  return (
    <li className="project">
      <div className="project__top">
        <div className="project__who">
          <div className="project__people" data-count={project.authors.length}>
            <span className="project__avatars" aria-hidden="true">
              {project.authors.map((name) => (
                <Avatar key={name} name={name} />
              ))}
            </span>
            <span className="project__names">
              {project.authors.map((name, i) => (
                <span key={name} className="project__author">
                  {name}
                  {/* "y" solo para lectores de pantalla; en pantalla cada nombre va en su línea */}
                  {i < project.authors.length - 1 && <span className="projects__sr"> y </span>}
                </span>
              ))}
            </span>
          </div>
          <ul className="project__tags" aria-label="Tecnologías">
            {project.tags.map((t) => (
              <li key={t} className="project__tag">{t}</li>
            ))}
          </ul>
        </div>

        {/* Muesca blanca con el botón de código (siempre visible) */}
        <div className="project__tab">
          {project.repo ? (
            <a
              className="round round--card"
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              aria-label={`Ver el código de ${project.title} en GitHub`}
              title="Ver código en GitHub"
            >
              {Icon.code}
            </a>
          ) : (
            <span
              className="round round--card is-disabled"
              role="img"
              aria-label="Código no disponible todavía"
              title="Código no disponible todavía"
            >
              {Icon.code}
            </span>
          )}
        </div>
      </div>

      <h3 className="project__title">
        {/* El botón se estira sobre toda la tarjeta: cualquier clic la abre */}
        <button type="button" className="project__open" onClick={() => onOpen(project)}>
          {project.title}
        </button>
      </h3>
      <p className="project__desc">{project.description}</p>

      <div className="project__frame">
        <div className="project__bar" aria-hidden="true">
          <span className="project__dots"><i /><i /><i /></span>
          <span className="project__domain">{project.domain}</span>
        </div>
        <LivePreview project={project} />
      </div>
    </li>
  )
}

/* ---------- Modal con la página completa ---------- */

function ModalFrame({ project }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="page-modal__frame" data-loaded={loaded}>
      <p className="page-modal__status" role="status">Cargando página…</p>
      <iframe
        className="page-modal__iframe"
        src={project.url}
        title={project.title}
        sandbox={SANDBOX}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

function PageModal({ list, index, onIndex, onClose }) {
  const dialogRef = useRef(null)
  const [device, setDevice] = useState('desktop')
  const project = list[index]
  const width = DEVICES.find((d) => d.id === device).width

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prevOverflow
    }
  }, [])

  const close = () => dialogRef.current.close()
  const go = (step) => onIndex((index + step + list.length) % list.length)

  return (
    <dialog
      ref={dialogRef}
      className="page-modal"
      aria-labelledby="page-modal-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === dialogRef.current) close() }}
    >
      <div className="page-modal__window">
        <header className="page-modal__bar">
          <div className="page-modal__info">
            <h3 id="page-modal-title" className="page-modal__title">{project.title}</h3>
            <span className="page-modal__url">{project.domain}</span>
          </div>

          <div className="page-modal__devices" role="radiogroup" aria-label="Tamaño de pantalla">
            {DEVICES.map((d) => (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={device === d.id}
                className="page-modal__device"
                onClick={() => setDevice(d.id)}
              >
                {Icon[d.id]}
                <span>{d.label}</span>
              </button>
            ))}
          </div>

          <div className="page-modal__actions">
            {list.length > 1 && (
              <div className="page-modal__pager">
                <button type="button" className="page-modal__btn page-modal__btn--icon" onClick={() => go(-1)} aria-label="Proyecto anterior">
                  {Icon.prev}
                </button>
                <span className="page-modal__count" aria-live="polite">
                  {index + 1} / {list.length}
                </span>
                <button type="button" className="page-modal__btn page-modal__btn--icon" onClick={() => go(1)} aria-label="Proyecto siguiente">
                  {Icon.next}
                </button>
              </div>
            )}
            <a className="page-modal__btn page-modal__btn--icon" href={project.url} target="_blank" rel="noreferrer" aria-label="Abrir en pestaña nueva" title="Abrir en pestaña nueva">
              {Icon.external}
            </a>
            <button type="button" className="page-modal__btn page-modal__btn--icon" onClick={close} aria-label="Cerrar" autoFocus>
              {Icon.close}
            </button>
          </div>
        </header>

        <div className="page-modal__stage" data-device={device}>
          <div className="page-modal__screen" style={{ '--device-w': width }}>
            <ModalFrame key={project.url + index} project={project} />
          </div>
        </div>
      </div>
    </dialog>
  )
}

/* ---------- Sección ---------- */

function Projects() {
  const [filter, setFilter] = useState(ALL)
  const [query, setQuery] = useState('')
  const [openIndex, setOpenIndex] = useState(null)

  const tags = useMemo(() => {
    const counts = new Map()
    projects.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)))
    return [[ALL, projects.length], ...counts]
  }, [])

  const visible = useMemo(() => {
    const q = fold(query.trim())
    return projects.filter((p) => {
      if (filter !== ALL && !p.tags.includes(filter)) return false
      if (!q) return true
      return fold(`${p.title} ${p.authors.join(' ')} ${p.description}`).includes(q)
    })
  }, [filter, query])

  const reset = () => {
    setFilter(ALL)
    setQuery('')
  }

  return (
    <section id="proyectos" className="projects" aria-labelledby="projects-title">
      <div className="projects__inner">
        <header className="projects__header">
          <h2 id="projects-title" className="projects__title">Explora los proyectos</h2>
          <label className="projects__search">
            {Icon.search}
            <span className="projects__sr">Buscar proyecto</span>
            <input
              type="search"
              placeholder="Buscar por nombre o estudiante"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </header>

        <div className="projects__toolbar">
          <div className="projects__filters" role="group" aria-label="Filtrar por tecnología">
            {tags.map(([tag, count]) => (
              <button
                key={tag}
                type="button"
                className="projects__chip"
                aria-pressed={filter === tag}
                onClick={() => setFilter(tag)}
              >
                {tag}
                <span className="projects__chip-count">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {visible.length > 0 ? (
          <ul className="projects__grid">
            {visible.map((p, i) => (
              <ProjectCard key={`${p.title}-${p.url}`} project={p} onOpen={() => setOpenIndex(i)} />
            ))}
          </ul>
        ) : (
          <div className="projects__empty" role="status">
            <p>Ningún proyecto coincide con la búsqueda.</p>
            <button type="button" className="projects__chip" onClick={reset}>Ver todos los proyectos</button>
          </div>
        )}
      </div>

      {openIndex !== null && visible[openIndex] && (
        <PageModal
          list={visible}
          index={openIndex}
          onIndex={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  )
}

export default Projects