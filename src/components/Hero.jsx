import { useCallback, useEffect, useRef, useState } from 'react'
import './Hero.css'

// Reemplaza estas rutas por tus imágenes (ej: import img1 from '../assets/img1.jpg')
// position (opcional): la parte de la foto que nunca se debe recortar en pantallas angostas.
//   'center' (por defecto), 'center 30%' (un poco arriba), 'left center', '70% 50%', etc.
const slides = [
  { alt: 'Descripción de la imagen 1', src: 'https://scontent.fbog18-2.fna.fbcdn.net/v/t39.30808-6/474696062_2370749529956039_5633720331545667839_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1241&ctp=s2048x1241&_nc_cat=101&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=HzPs5L_ZPNkQ7kNvwEfKGdp&_nc_oc=Adqr9LR-EyplS-ho5PVO2lGIH4RlTjtf5ebfRqCAamllLSlFWWmbXFbxmU4HNyaMtQw&_nc_zt=23&_nc_ht=scontent.fbog18-2.fna&_nc_gid=MiYucWAVpxFYvPQqsJbSPQ&_nc_ss=7b289&oh=00_AQP1tG0t3p42JrVj3qlaanjtBvYubehFIvZruub3KJ5ufw&oe=6AD586A0' },
  { alt: 'Descripción de la imagen 2', src: 'https://www.uptc.edu.co/export/sites/default/universidad/modules/imag/2018/Sede_Centralx_UPTC__Ente_universitario_autoxnomox_de_caraxcter_nacionalx_estatal_y_puxblico._Fundada_en_1953_durante_la_presidencia_de_Gustavo_Rojas_Pinilla._Una_historia_de_presencia_institucional_y_tradici.JPG' },
  { alt: 'Descripción de la imagen 3', src: 'https://www.boyacaradio.com/imagenes/fotos_noticias/53142817_10157054584842937_1937542335151734784_o.jpg' },
]

const AUTOPLAY_MS = 6000
const SWIPE_THRESHOLD = 48

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

function Hero() {
  const [current, setCurrent] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [overDots, setOverDots] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const pointerStartX = useRef(null)

  const autoplay = !reducedMotion
  const playing = autoplay && !userPaused && !overDots && !pageHidden

  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [])
  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [])

  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prev() }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); next() }
  }

  const handlePointerDown = (e) => { pointerStartX.current = e.clientX }
  const handlePointerUp = (e) => {
    if (pointerStartX.current === null) return
    const dx = e.clientX - pointerStartX.current
    pointerStartX.current = null
    if (Math.abs(dx) < SWIPE_THRESHOLD) return
    dx < 0 ? next() : prev()
  }

  // Clic en el punto activo: pausa / reanuda. Clic en otro: va a esa imagen.
  const handleDot = (i) => {
    if (i === current) {
      if (autoplay) setUserPaused((p) => !p)
    } else {
      setCurrent(i)
    }
  }

  return (
    <section
      id="inicio"
      className="hero"
      aria-roledescription="carrusel"
      aria-label="Galería de imágenes"
      tabIndex={0}
      data-playing={playing}
      data-paused={userPaused}
      style={{ '--hero-interval': `${AUTOPLAY_MS}ms` }}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { pointerStartX.current = null }}
    >
      <div className="hero__media" aria-live={playing ? 'off' : 'polite'}>
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
      </div>

      <div className="hero__shade" aria-hidden="true" />

      <nav
        className="hero__dots"
        aria-label="Seleccionar imagen"
        onMouseEnter={() => setOverDots(true)}
        onMouseLeave={() => setOverDots(false)}
        onFocus={() => setOverDots(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOverDots(false) }}
      >
        {slides.map((s, i) => {
          const active = i === current
          const label = active
            ? autoplay
              ? userPaused ? `Imagen ${i + 1}, reanudar presentación` : `Imagen ${i + 1}, pausar presentación`
              : `Imagen ${i + 1}`
            : `Ir a la imagen ${i + 1}`
          return (
            <button
              key={s.src}
              type="button"
              className={`hero__dot${active ? ' is-active' : ''}`}
              aria-label={label}
              aria-current={active ? 'true' : undefined}
              onClick={() => handleDot(i)}
            >
              <svg className="hero__ring" viewBox="0 0 32 32" aria-hidden="true">
                <circle className="hero__ring-track" cx="16" cy="16" r="12" pathLength="100" />
                <circle
                  className={`hero__ring-progress${active && autoplay ? ' is-timer' : ''}`}
                  cx="16"
                  cy="16"
                  r="12"
                  pathLength="100"
                  onAnimationEnd={active && autoplay ? next : undefined}
                />
              </svg>
              <span className="hero__dot-core" />
            </button>
          )
        })}
      </nav>
    </section>
  )
}

export default Hero