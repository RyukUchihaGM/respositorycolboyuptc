import { useState } from 'react'
import { projects as rawProjects } from '../data/projects.js'
import { LivePreview, PageModal } from './Projects'
import './Before.css'

// "El punto de partida": las primeras páginas, antes del acompañamiento.
// Salen de projects.js: los proyectos con  etapa: 'antes'  (máximo 3).

const normalizeUrl = (url) => (/^https?:\/\//i.test(url) ? url : `https://${url.replace(/^\/+/, '')}`)
const domainOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
const toList = (value) => (Array.isArray(value) ? value : [value]).filter(Boolean)

const earlyProjects = rawProjects
  .filter((p) => p.etapa === 'antes')
  .slice(0, 3)
  .map((p) => {
    const url = normalizeUrl(p.url)
    return { ...p, url, domain: domainOf(url), authors: toList(p.authors ?? p.author) }
  })

function Before() {
  const [open, setOpen] = useState(null)
  const list = earlyProjects

  // Sin páginas de "antes", la sección no aparece
  if (!list.length) return null

  return (
    <section id="antes" className="before" aria-labelledby="early-title">
      <div className="before__inner">
        <div className="early">
          <div className="early__intro">
            <p className="early__kicker">Antes del acompañamiento</p>
            <h2 id="early-title" className="early__title">El punto<br />de partida</h2>
            <p className="early__text">
              Las primeras páginas de los estudiantes. Desde aquí se les acompañó con conocimientos
              de HTML y CSS para que comprendieran cómo se estructura una página web.
            </p>

            {/* Lo que aprendieron, dicho en código */}
            <div className="early__code" aria-hidden="true">
              <span className="early__line"><span className="c-tag">&lt;header&gt;</span><span className="c-note">título y menú</span></span>
              <span className="early__line"><span className="c-tag">&lt;main&gt;</span><span className="c-note">contenido</span></span>
              <span className="early__line early__line--in"><span className="c-tag">&lt;section&gt;</span><span className="c-note">partes</span></span>
              <span className="early__line"><span className="c-tag">&lt;footer&gt;</span><span className="c-note">cierre</span></span>
            </div>
          </div>

          <ul className="early__desk" data-count={list.length}>
            {list.map((p, i) => (
              <li key={`${p.title}-${p.url}`} className="early__item" style={{ '--i': i }}>
                <button
                  type="button"
                  className="early__open"
                  onClick={() => setOpen(i)}
                  aria-label={`Ver ${p.title}, de ${p.authors.join(' y ')}`}
                />
                <div className="early__window" aria-hidden="true">
                  <span className="early__bar">
                    <span className="early__dots"><i /><i /><i /></span>
                    <span className="early__domain">{p.domain}</span>
                  </span>
                  <LivePreview project={p} />
                </div>
                <div className="early__label" aria-hidden="true">
                  <span className="early__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="early__meta">
                    <span className="early__name">{p.title}</span>
                    <span className="early__author">{p.authors.join(' · ')}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {open !== null && list[open] && (
        <PageModal list={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </section>
  )
}

export default Before