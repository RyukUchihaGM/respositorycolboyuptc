import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { steps, phases, credit } from '../data/proceso.js'
import { projects } from '../data/projects.js'
import './Process.css'

/* ---------- PDF: se dibuja con pdf.js (se carga solo cuando hace falta) ---------- */

const pdfCache = new Map()

function loadPdf(src) {
  if (!pdfCache.has(src)) {
    const job = (async () => {
      const [pdfjs, worker] = await Promise.all([
        import('pdfjs-dist'),
        import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
      ])
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default
      // verbosity: 0 = sin avisos en la consola (los PDF hechos en Word
      // traen fuentes con detalles que pdf.js reporta, pero se ven bien)
      return pdfjs.getDocument({ url: src, verbosity: 0 }).promise
    })()
    job.catch(() => pdfCache.delete(src)) // si falla, se puede reintentar
    pdfCache.set(src, job)
  }
  return pdfCache.get(src)
}

// Hook: devuelve el documento PDF (o el error)
function usePdf(src) {
  const [state, setState] = useState({ doc: null, error: false })
  useEffect(() => {
    let alive = true
    setState({ doc: null, error: false })
    loadPdf(src)
      .then((doc) => alive && setState({ doc, error: false }))
      .catch(() => alive && setState({ doc: null, error: true }))
    return () => { alive = false }
  }, [src])
  return state
}

// Ancho disponible de un elemento
function useWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}

// Dibuja una página del PDF en un canvas del ancho indicado
function PdfPage({ doc, number, width, onReady }) {
  const canvasRef = useRef(null)
  const [ratio, setRatio] = useState(11 / 8.5) // carta, hasta saber el tamaño real

  useEffect(() => {
    if (!doc || !width) return
    let task
    let alive = true
    doc.getPage(number).then((page) => {
      if (!alive) return
      const base = page.getViewport({ scale: 1 })
      setRatio(base.height / base.width)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const viewport = page.getViewport({ scale: (width / base.width) * dpr })
      const canvas = canvasRef.current
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      task = page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport })
      task.promise.then(() => alive && onReady?.()).catch(() => {})
    })
    return () => {
      alive = false
      task?.cancel()
    }
  }, [doc, number, width, onReady])

  return (
    <canvas
      ref={canvasRef}
      className="pdf-page"
      style={{ aspectRatio: `1 / ${ratio}` }}
      aria-label={`Página ${number}`}
      role="img"
    />
  )
}

const pad = (n) => String(n).padStart(2, '0')

const Icon = {
  check: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" /><path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  ),
  expand: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" />
    </svg>
  ),
  download: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" />
    </svg>
  ),
  flag: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 14V2.5M3.5 3h8l-1.8 3 1.8 3h-8" />
    </svg>
  ),
}

/* ---------- Visor a pantalla completa: todas las páginas una debajo de otra ---------- */

function GuideViewer({ step, onClose }) {
  const ref = useRef(null)
  const { doc, error } = usePdf(step.guide)
  const [stageRef, width] = useWidth()

  useEffect(() => {
    ref.current?.showModal()
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = '' }
  }, [])

  return (
    <dialog ref={ref} className="guide-viewer" onClose={onClose} onClick={(e) => { if (e.target === ref.current) ref.current.close() }}>
      <div className="guide-viewer__window">
        <header className="guide-viewer__bar">
          <span className="guide-viewer__tag">{step.label}</span>
          <h3 className="guide-viewer__title">Guía · {step.title}</h3>
          {doc && <span className="guide-viewer__pages">{doc.numPages} págs.</span>}
          <a className="guide-viewer__btn" href={step.guide} download aria-label="Descargar la guía">
            {Icon.download}
          </a>
          <button type="button" className="guide-viewer__btn" onClick={() => ref.current.close()} aria-label="Cerrar guía">
            {Icon.close}
          </button>
        </header>
        <div className="guide-viewer__stage">
          <div className="guide-viewer__pagesbox" ref={stageRef}>
            {error && <p className="guide-viewer__msg">No se pudo abrir la guía.</p>}
            {doc && width > 0 &&
              Array.from({ length: doc.numPages }, (_, i) => (
                <PdfPage key={i} doc={doc} number={i + 1} width={width} />
              ))}
          </div>
        </div>
      </div>
    </dialog>
  )
}

/* ---------- Guía en PDF dentro del panel ---------- */

function GuideDoc({ step, onExpand }) {
  const { doc, error } = usePdf(step.guide)
  const [page, setPage] = useState(1)
  const [ready, setReady] = useState(false)
  const [boxRef, width] = useWidth()
  const total = doc?.numPages ?? 0

  useEffect(() => { setPage(1); setReady(false) }, [step.guide])

  const go = (n) => { setReady(false); setPage(n) }
  const markReady = useCallback(() => setReady(true), [])

  return (
    <figure className="proc-doc">
      <button
        type="button"
        className="proc-doc__sheet"
        ref={boxRef}
        onClick={onExpand}
        disabled={!doc}
        data-ready={ready}
        aria-label={`Abrir completa la guía de la ${step.label}`}
      >
        {error ? (
          <span className="proc-doc__msg">
            No se encontró la guía.<br />
            <small>Revisa que exista <code>public{step.guide}</code></small>
          </span>
        ) : (
          <>
            <span className="proc-doc__loading" aria-hidden="true" />
            {doc && width > 0 && <PdfPage doc={doc} number={page} width={width} onReady={markReady} />}
            <span className="proc-doc__hint" aria-hidden="true">{Icon.expand} Ver completa</span>
          </>
        )}
      </button>

      {/* Controles debajo de la hoja */}
      <figcaption className="proc-doc__bar">
        <button type="button" className="proc-doc__btn" onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Página anterior">
          <span className="process__flip">{Icon.arrow}</span>
        </button>
        <span className="proc-doc__pages" aria-live="polite">
          {total ? <><b>{pad(page)}</b> / {pad(total)}</> : '··'}
        </span>
        <button type="button" className="proc-doc__btn" onClick={() => go(page + 1)} disabled={!total || page >= total} aria-label="Página siguiente">
          {Icon.arrow}
        </button>
        {/* Puntos: una marca por página */}
        {total > 0 && (
          <span className="proc-doc__dots" aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
              <i key={i} className={i + 1 === page ? 'is-on' : ''} />
            ))}
          </span>
        )}
        <button type="button" className="proc-doc__full" onClick={onExpand} disabled={!doc} aria-label="Ver la guía completa">
          {Icon.expand} Completa
        </button>
      </figcaption>
    </figure>
  )
}

function PromptCard({ step }) {
  const [ex, setEx] = useState(0)
  const [copied, setCopied] = useState(false)
  const example = step.examples[ex]
  const isTemplate = ex === 0

  const text = step.prompt
    .map((k, i) => `${k}: ${example.values[i]}`)
    .join('\n')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Diseña una página web.\n${text}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* sin permiso para copiar: no pasa nada */ }
  }

  return (
    <div className="proc-prompt">
      <div className="proc-prompt__bar">
        <span className="proc-prompt__dot" />
        <span>Prompt para Figma IA</span>
        <button type="button" className="proc-prompt__copy" onClick={copy}>
          {copied ? Icon.check : Icon.copy}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      {/* Ejemplos: cambian los valores del prompt */}
      <div className="proc-prompt__examples" role="group" aria-label="Ejemplos de prompt">
        {step.examples.map((e, i) => (
          <button
            key={e.name}
            type="button"
            className="proc-prompt__ex"
            aria-pressed={i === ex}
            onClick={() => setEx(i)}
          >
            {e.name}
          </button>
        ))}
      </div>

      <dl className="proc-prompt__body" key={ex}>
        {step.prompt.map((k, i) => (
          <div key={k} className="proc-prompt__row" style={{ '--i': i }}>
            <dt>{k}</dt>
            <dd>
              {isTemplate
                ? example.values[i].split(/(\[[^\]]+\])/).map((part, n) =>
                    part.startsWith('[') ? <mark key={n}>{part}</mark> : part)
                : <span className="proc-prompt__val">{example.values[i]}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <p className="proc-prompt__foot">
        {isTemplate
          ? 'Lo que va entre corchetes lo cambia cada estudiante.'
          : 'Ejemplo de cómo queda el prompt con un tema real.'}
      </p>
    </div>
  )
}

/* ---------- Paso 5: cifras del proyecto ---------- */

const PLACEHOLDER = 'nombre del estudiante'
const toList = (v) => (Array.isArray(v) ? v : [v]).filter(Boolean)

// Solo los proyectos actuales (los de "antes" van aparte)
const current = projects.filter((p) => p.etapa !== 'antes')
const students = new Set(
  current.flatMap((p) => toList(p.authors ?? p.author)).filter((n) => n.trim().toLowerCase() !== PLACEHOLDER)
)
const courses = new Set(current.map((p) => p.course).filter(Boolean))

function Results() {
  const stats = [
    [current.length, current.length === 1 ? 'página publicada' : 'páginas publicadas'],
    [students.size, students.size === 1 ? 'estudiante' : 'estudiantes'],
    [courses.size, courses.size === 1 ? 'curso' : 'cursos'],
  ]

  return (
    <div className="proc-results">
      <ul className="proc-results__stats">
        {stats.map(([n, label]) => (
          <li key={label}>
            <b>{pad(n)}</b>
            <span>{label}</span>
          </li>
        ))}
      </ul>

    </div>
  )
}

function OutcomeCard({ step }) {
  return (
    <div className="proc-out">
      <p className="proc-out__kicker">Lo que se esperaba con esta implementación</p>
      <ol className="proc-out__list">
        {step.outcomes.map(([title, text], i) => (
          <li key={title} className="proc-out__item" style={{ '--i': i }}>
            <span className="proc-out__n">{pad(i + 1)}</span>
            <span className="proc-out__body">
              <strong>{title}</strong>
              <span>{text}</span>
            </span>
          </li>
        ))}
      </ol>
      <a href="#proyectos" className="pill proc-out__cta">
        Ver los proyectos
        <span className="pill__icon">{Icon.arrow}</span>
      </a>
    </div>
  )
}

/* ---------- Sección ---------- */

function Process() {
  const [active, setActive] = useState(0)
  const [viewing, setViewing] = useState(null)
  const tabsRef = useRef([])
  const step = steps[active]

  const onKey = (e) => {
    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (!dir) return
    e.preventDefault()
    const next = (active + dir + steps.length) % steps.length
    setActive(next)
    tabsRef.current[next]?.focus()
  }

  return (
    <section id="proceso" className="process" aria-labelledby="process-title">
      <div className="process__inner">
        <header className="process__header">
          <h2 id="process-title" className="process__title">Así se construyó</h2>
          <p className="process__lead">
            De las primeras etiquetas a una página propia: tres clases de fundamentos y dos pasos con inteligencia artificial.
          </p>
        </header>

        <div className="process__body" data-phase={step.phase} data-active={active} data-last={active === steps.length - 1}>
          {/* Pestañas tipo carpeta: la elegida se une con el panel */}
          <div className="process__tabs" role="tablist" aria-label="Pasos del proceso" aria-orientation="vertical" onKeyDown={onKey}>
            {steps.map((s, i) => (
              <Fragment key={s.id}>
                {(i === 0 || steps[i - 1].phase !== s.phase) && (
                  <p className="process__group" data-phase={s.phase}>{phases[s.phase]}</p>
                )}
                <button
                  ref={(el) => { tabsRef.current[i] = el }}
                  type="button"
                  role="tab"
                  id={`proc-tab-${s.id}`}
                  aria-selected={i === active}
                  aria-controls="proc-panel"
                  tabIndex={i === active ? 0 : -1}
                  className={`process__tab${i < active ? ' is-done' : ''}`}
                  data-phase={s.phase}
                  onClick={() => setActive(i)}
                >
                  {/* Línea que une los pasos */}
                  <span className="process__line process__line--top" aria-hidden="true" />
                  <span className="process__line process__line--bottom" aria-hidden="true" />
                  <span className="process__node" aria-hidden="true">
                    {i < active ? Icon.check : pad(i + 1)}
                  </span>
                  <span className="process__tab-text">
                    <span className="process__tab-label">{s.label}</span>
                    <span className="process__tab-title">{s.title}</span>
                    <span className="process__tab-short">{s.short}</span>
                  </span>
                </button>
              </Fragment>
            ))}

            {/* Avance */}
            <div className="process__progress" aria-hidden="true">
              <div className="process__progress-top">
                <span>Avance</span>
                <b>{pad(active + 1)}<small> / {pad(steps.length)}</small></b>
              </div>
              <span className="process__bar">
                <i style={{ width: `${((active + 1) / steps.length) * 100}%` }} />
              </span>
              <p className="process__credit">{credit}</p>
            </div>
          </div>

          {/* Panel */}
          <div
            key={step.id}
            id="proc-panel"
            className="process__panel"
            role="tabpanel"
            aria-labelledby={`proc-tab-${step.id}`}
            data-phase={step.phase}
          >
            <div className="process__copy">
              <p className="process__meta">{step.meta}</p>
              <h3 className="process__step-title">
                <span className="process__big-num" aria-hidden="true">{pad(active + 1)}</span>
                {step.title}
              </h3>
              <p className="process__text">{step.text}</p>

              {step.chips && (
                <ul className="process__chips" aria-label="Lo que se trabajó">
                  {step.chips.map((c) => <li key={c}><code>{c}</code></li>)}
                </ul>
              )}

              {step.reto && (
                <div className="process__reto">
                  <span className="process__reto-icon">{Icon.flag}</span>
                  <p><strong>Reto de la clase.</strong> {step.reto}</p>
                </div>
              )}

              {step.flow && (
                <ol className="process__flow">
                  {step.flow.map((f, i) => <li key={f}><span>{i + 1}</span>{f}</li>)}
                </ol>
              )}

              {step.results && <Results />}

              {step.expect && (
                <div className="process__expect">
                  <p className="process__expect-title">Lo que se espera</p>
                  <ul>
                    {step.expect.map((e) => <li key={e}>{Icon.check}{e}</li>)}
                  </ul>
                </div>
              )}

              <div className="process__nav">
                <button type="button" className="process__arrow" onClick={() => setActive((a) => a - 1)} disabled={active === 0} aria-label="Paso anterior">
                  <span className="process__flip">{Icon.arrow}</span>
                </button>
                {active < steps.length - 1 ? (
                  <button type="button" className="process__arrow process__arrow--next" onClick={() => setActive((a) => a + 1)}>
                    Siguiente: {steps[active + 1].label}
                    {Icon.arrow}
                  </button>
                ) : (
                  <button type="button" className="process__arrow process__arrow--text" onClick={() => setActive(0)}>
                    Volver al inicio
                  </button>
                )}
              </div>
            </div>

            <div className="process__visual">
              {step.guide && <GuideDoc step={step} onExpand={() => setViewing(step)} />}
              {step.prompt && <PromptCard step={step} />}
              {step.outcomes && <OutcomeCard step={step} />}
            </div>
          </div>
        </div>
      </div>

      {viewing && <GuideViewer step={viewing} onClose={() => setViewing(null)} />}
    </section>
  )
}

export default Process