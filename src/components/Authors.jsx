import { useState } from 'react'
import './Authors.css'
import fotoFernando from '../assets/authors/fernando.jpeg'
// Cuando tengas las otras fotos en src/assets/authors/, quita las dos barras (//)
// de estas líneas y de las líneas "photo" de abajo. Revisa que la extensión coincida.
// import fotoRosa from '../assets/authors/rosa.jpeg'
// import fotoAdriana from '../assets/authors/adriana.jpeg'

const authors = [
  {
    name: 'Fernando Espinosa',
    role: 'Docente en formación',
    org: 'UPTC',
    photo: fotoFernando,
  },
  {
    name: 'Rosa Elena Arévalo',
    role: 'Docente directora de práctica',
    org: 'Colegio de Boyacá',
    // photo: fotoRosa,
  },
  {
    name: 'Adriana Sandoval',
    role: 'Docente directora',
    org: 'UPTC',
    // photo: fotoAdriana,
  },
]

// Iniciales del primer nombre y el último apellido: "Rosa Elena Arévalo" → "RA"
const initialsOf = (name) => {
  const words = name.split(/\s+/).filter(Boolean)
  const picks = words.length > 1 ? [words[0], words[words.length - 1]] : words
  return picks.map((w) => w[0].toUpperCase()).join('')
}

const pad = (n) => String(n).padStart(2, '0')

function Authors() {
  const [active, setActive] = useState(0)

  return (
    <section id="nosotros" className="authors" aria-labelledby="authors-title">
      <div className="authors__inner">
        <header className="authors__header">
          <h2 id="authors-title" className="authors__title">Autores del proyecto</h2>
        </header>

        {/* Acordeón de retratos: el elegido se expande */}
        <ul className="authors__panels">
          {authors.map((a, i) => {
            const isActive = i === active
            return (
              <li
                key={a.name}
                className={`portrait${isActive ? ' is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
              >
                <button
                  type="button"
                  className="portrait__trigger"
                  aria-expanded={isActive}
                  aria-label={`${a.name}, ${a.role}, ${a.org}`}
                  onClick={() => setActive(i)}
                  onFocus={() => setActive(i)}
                />

                <div className="portrait__media" aria-hidden="true">
                  {a.photo ? (
                    <>
                      {/* Fondo: la misma foto desenfocada para rellenar el espacio */}
                      <img className="portrait__bg" src={a.photo} alt="" loading="lazy" decoding="async" />
                      {/* Foto completa */}
                      <img className="portrait__photo" src={a.photo} alt="" loading="lazy" decoding="async" />
                    </>
                  ) : (
                    <span className="portrait__initials">{initialsOf(a.name)}</span>
                  )}
                </div>

                <span className="portrait__num" aria-hidden="true">{pad(i + 1)}</span>

                {/* Nombre vertical cuando está cerrado */}
                <span className="portrait__label" aria-hidden="true">{a.name}</span>

                {/* Ficha en una muesca blanca cuando está abierto */}
                <div className="portrait__info" aria-hidden={!isActive}>
                  <span className="portrait__org">{a.org}</span>
                  <h3 className="portrait__name">{a.name}</h3>
                  <p className="portrait__role">{a.role}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export default Authors