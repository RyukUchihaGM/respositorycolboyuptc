import { useEffect, useMemo, useRef, useState } from 'react'
import { projects as rawProjects } from '../data/Projects.js'
import './Projects.css'

const ALL = 'Todos'

// Si el enlace no trae https:// el navegador lo trata como una ruta de TU sitio,
// así que se lo agregamos automáticamente.
const normalizeUrl = (url) => (/^https?:\/\//i.test(url) ? url : `https://${url.replace(/^\/+/, '')}`)
const projects = rawProjects.map((p) => ({ ...p, url: normalizeUrl(p.url) }))
const PREVIEW_WIDTH = 1280 // ancho "de escritorio" con el que se renderiza la vista previa
const PREVIEW_HEIGHT = 800

// Permisos del iframe: deja usar la página (scripts, formularios, alertas)
// pero no le permite redirigir tu sitio.
const SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals'

/* ---------- Vista previa en vivo, escalada al tamaño de la tarjeta ---------- */

function LivePreview({ project }) {
  const boxRef = useRef(null)
  const [scale, setScale] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / PREVIEW_WIDTH)
    })
    ro.observe(box)
    return () => ro.disconnect()
  }, [])

  if (project.image) {
    return (
      <span className="project__shot" ref={boxRef}>
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

/* ---------- Modal con la página completa ---------- */

function PageModal({ project, onClose }) {
  const dialogRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    // Evita que la página de fondo haga scroll mientras el modal está abierto
    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prevOverflow
    }
  }, [])

  // Clic en el fondo oscuro (fuera de la ventana) cierra el modal
  const handleClick = (e) => {
    if (e.target === dialogRef.current) dialogRef.current.close()
  }

  return (
    <dialog
      ref={dialogRef}
      className="page-modal"
      aria-labelledby="page-modal-title"
      onClose={onClose}
      onClick={handleClick}
    >
      <div className="page-modal__window">
        <header className="page-modal__bar">
          <div className="page-modal__info">
            <h3 id="page-modal-title" className="page-modal__title">{project.title}</h3>
            <span className="page-modal__url">{project.url.replace(/^https?:\/\//, '')}</span>
          </div>

          <div className="page-modal__actions">
            <a className="page-modal__btn" href={project.url} target="_blank" rel="noreferrer">
              <span className="page-modal__btn-label">Abrir en pestaña nueva</span>
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3.5h6.5V10M12.5 3.5 4 12" />
              </svg>
            </a>
            <button
              type="button"
              className="page-modal__btn page-modal__btn--icon"
              onClick={() => dialogRef.current.close()}
              aria-label="Cerrar"
              autoFocus
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        </header>

        <div className="page-modal__viewport" data-loaded={loaded}>
          <p className="page-modal__status" role="status">Cargando página…</p>
          <iframe
            className="page-modal__iframe"
            src={project.url}
            title={project.title}
            sandbox={SANDBOX}
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>
    </dialog>
  )
}

/* ---------- Sección ---------- */

function Projects() {
  const [filter, setFilter] = useState(ALL)
  const [openProject, setOpenProject] = useState(null)

  const tags = useMemo(() => {
    const counts = new Map()
    projects.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)))
    return [[ALL, projects.length], ...counts]
  }, [])

  const visible = filter === ALL ? projects : projects.filter((p) => p.tags.includes(filter))

  return (
    <section id="proyectos" className="projects" aria-labelledby="projects-title">
      <div className="projects__inner">
        <header className="projects__header">
          <h2 id="projects-title" className="projects__title">Proyectos</h2>
          <p className="projects__intro">
            Páginas web hechas en clase. Ábrelas aquí mismo para navegarlas o revisa su código.
          </p>
        </header>

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

        <ul className="projects__grid" aria-live="polite">
          {visible.map((p) => (
            <li key={`${p.title}-${p.url}`} className="project">
              <button
                type="button"
                className="project__frame"
                onClick={() => setOpenProject(p)}
                tabIndex={-1}
                aria-hidden="true"
              >
                <span className="project__bar">
                  <span /><span /><span />
                </span>
                <LivePreview project={p} />
              </button>

              <div className="project__body">
                <h3 className="project__title">{p.title}</h3>
                <p className="project__desc">{p.description}</p>
                <p className="project__author">{p.author}</p>

                <ul className="project__tags" aria-label="Tecnologías">
                  {p.tags.map((t) => (
                    <li key={t} className="project__tag">{t}</li>
                  ))}
                </ul>
              </div>

              <div className="project__actions">
                <button
                  type="button"
                  className="project__btn project__btn--primary"
                  onClick={() => setOpenProject(p)}
                >
                  Ver página
                </button>
                {p.repo && (
                  <a className="project__btn" href={p.repo} target="_blank" rel="noreferrer">
                    Código
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {openProject && (
        <PageModal
          key={openProject.url}
          project={openProject}
          onClose={() => setOpenProject(null)}
        />
      )}
    </section>
  )
}

export default Projects