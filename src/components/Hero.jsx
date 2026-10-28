import { useCallback, useEffect, useRef, useState } from 'react'
import { projects as allProjects } from '../data/projects.js'

// Solo los proyectos actuales: los de "antes" (etapa: 'antes') no se cuentan
const projects = allProjects.filter((p) => p.etapa !== 'antes')
import './Hero.css'

// Reemplaza estas rutas por tus imágenes (ej: import img1 from '../assets/img1.jpg')
// position (opcional): la parte de la foto que nunca se debe recortar.
//   'center' (por defecto), 'center 30%' (un poco arriba), 'left center', etc.
const slides = [
  { alt: 'Descripción de la imagen 1', src: 'https://scontent.fbog18-2.fna.fbcdn.net/v/t39.30808-6/474696062_2370749529956039_5633720331545667839_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1241&ctp=s2048x1241&_nc_cat=101&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=HzPs5L_ZPNkQ7kNvwEfKGdp&_nc_oc=Adqr9LR-EyplS-ho5PVO2lGIH4RlTjtf5ebfRqCAamllLSlFWWmbXFbxmU4HNyaMtQw&_nc_zt=23&_nc_ht=scontent.fbog18-2.fna&_nc_gid=MiYucWAVpxFYvPQqsJbSPQ&_nc_ss=7b289&oh=00_AQP1tG0t3p42JrVj3qlaanjtBvYubehFIvZruub3KJ5ufw&oe=6AD586A0' },
  { alt: 'Descripción de la imagen 2', src: 'https://www.uptc.edu.co/export/sites/default/universidad/modules/imag/2018/Sede_Centralx_UPTC__Ente_universitario_autoxnomox_de_caraxcter_nacionalx_estatal_y_puxblico._Fundada_en_1953_durante_la_presidencia_de_Gustavo_Rojas_Pinilla._Una_historia_de_presencia_institucional_y_tradici.JPG' },
  { alt: 'Descripción de la imagen 3', src: 'https://www.boyacaradio.com/imagenes/fotos_noticias/53142817_10157054584842937_1937542335151734784_o.jpg' },
]

const AUTOPLAY_MS = 6000
const SWIPE_THRESHOLD = 48

const pad = (n) => String(n).padStart(2, '0')

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return reduced
}

const Icon = {
  arrow: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  ),
  prev: (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.5 4.5 7 10l5.5 5.5" />
    </svg>
  ),
  next: (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.5 4.5 13 10l-5.5 5.5" />
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <rect x="3.5" y="2.5" width="3" height="11" rx="1" /><rect x="9.5" y="2.5" width="3" height="11" rx="1" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M5 3.2v9.6a.8.8 0 0 0 1.2.7l7.6-4.8a.8.8 0 0 0 0-1.4L6.2 2.5A.8.8 0 0 0 5 3.2Z" />
    </svg>
  ),
}

function Hero() {
  const [current, setCurrent] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const pointerStartX = useRef(null)

  const autoplay = !reducedMotion
  const playing = autoplay && !userPaused && !hovered && !pageHidden

  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [])
  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [])

  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const onPointerDown = (e) => { pointerStartX.current = e.clientX }
  const onPointerUp = (e) => {
    if (pointerStartX.current === null) return
    const dx = e.clientX - pointerStartX.current
    pointerStartX.current = null
    if (Math.abs(dx) < SWIPE_THRESHOLD) return
    dx < 0 ? next() : prev()
  }

  return (
    <section id="inicio" className="hero" aria-labelledby="hero-title">
      {/* Nombre gigante de lado a lado, como el del ejemplo */}
      {/* Título principal de la página (lo que Google toma como tema).
          El texto real va oculto a la vista y el SVG es solo el dibujo. */}
      <h1 className="hero__h1">
        <span className="hero__sr">Repositorio Colboy: proyectos web del Colegio de Boyacá</span>
        <svg className="hero__wordmark" viewBox="0 0 1000 118" preserveAspectRatio="none" aria-hidden="true">
          <text x="-4.12" y="115.4" textLength="1003.2" lengthAdjust="spacingAndGlyphs">REPOSITORIO COLBOY</text>
        </svg>
      </h1>

      <div className="hero__grid">
        <div className="hero__intro">
          <h2 id="hero-title" className="hero__title">Proyectos web<br />de clase</h2>
          <p className="hero__text">
            Páginas creadas por estudiantes del Colegio de Boyacá (Colboy) en Tunja. Ábrelas, navégalas y mira cómo están hechas.
          </p>
        </div>

        {/* Tarjeta amarilla: total + cinta con los nombres de los proyectos */}
        <a href="#proyectos" className="hero__stat" aria-label={`Ver los ${projects.length} proyectos publicados`}>
          <div className="hero__stat-top">
            <span className="hero__stat-num">{pad(projects.length)}</span>
            <span className="hero__stat-label">proyectos<br />publicados</span>
            <span className="hero__stat-go" aria-hidden="true">{Icon.arrow}</span>
          </div>
          <div className="hero__ticker" aria-hidden="true">
            {/* La lista va dos veces para que la cinta corra sin cortes */}
            <div className="hero__ticker-track">
              {[0, 1].map((copy) =>
                projects.map((p) => (
                  <span key={`${copy}-${p.title}`} className="hero__ticker-item">{p.title}</span>
                ))
              )}
            </div>
          </div>
        </a>

        <div
          className="hero__media"
          aria-roledescription="carrusel"
          aria-label="Fotos del colegio"
          data-playing={playing}
          style={{ '--hero-interval': `${AUTOPLAY_MS}ms` }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { pointerStartX.current = null }}
        >
          {slides.map((s, i) => (
            <figure
              key={s.src}
              className={`hero__slide${i === current ? ' is-active' : ''}`}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${slides.length}`}
              aria-hidden={i !== current}
            >
              <img
                src={s.src}
                alt={s.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                draggable="false"
                style={{ objectPosition: s.position ?? 'center' }}
              />
            </figure>
          ))}

          {/* Controles en una muesca verde recortada de la foto */}
          <div className="hero__controls">
            <span className="hero__count" aria-live={playing ? 'off' : 'polite'}>
              {pad(current + 1)}<span>/{pad(slides.length)}</span>
            </span>
            {autoplay && (
              <button
                type="button"
                className="hero__pause"
                onClick={() => setUserPaused((p) => !p)}
                aria-label={userPaused ? 'Reanudar fotos' : 'Pausar fotos'}
              >
                {userPaused ? Icon.play : Icon.pause}
              </button>
            )}
            <button type="button" className="round" onClick={prev} aria-label="Foto anterior">
              {Icon.prev}
            </button>
            <span className="hero__next">
              {autoplay && (
                <svg className="hero__ring" viewBox="0 0 60 60" aria-hidden="true">
                  <circle
                    key={current}
                    cx="30"
                    cy="30"
                    r="28"
                    pathLength="100"
                    onAnimationEnd={next}
                  />
                </svg>
              )}
              <button type="button" className="round" onClick={next} aria-label="Foto siguiente">
                {Icon.next}
              </button>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero