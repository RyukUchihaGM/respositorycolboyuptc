// Pasos del proceso que se muestran debajo del hero.
// guide: ruta del PDF dentro de public/  (ej: '/guias/guia-1.pdf'). null = "Guía pronto".
// chips: lo que se trabajó, se muestra como etiquetas de código.
// reto: el reto o la entrega de la clase.
// short: resumen de una línea que se ve en la pestaña.

export const steps = [
  {
    id: 'clase-1',
    phase: 'fundamentos',
    label: 'Clase 1',
    short: 'Carpeta del proyecto, index.html y etiquetas semánticas.',
    title: 'Estructura con HTML',
    meta: 'Guía 1 · Grado décimo · 2 horas',
    text: 'Cada estudiante creó la carpeta de su proyecto, con subcarpetas para imágenes y estilos, y escribió en Sublime Text la estructura básica de su index.html. Con eso armó una página sencilla usando las etiquetas semánticas de HTML.',
    chips: ['<header>', '<nav>', '<ul> <li>', '<main>', '<section>', '<article>', '<footer>'],
    reto: 'Agregar imágenes, textos, botones, listas, video y audio. Para la siguiente clase: crear estilo.css y cambiar colores, fuentes, tamaños y márgenes.',
    guide: '/guias/guia-1.pdf',
  },
  {
    id: 'clase-2',
    phase: 'fundamentos',
    label: 'Clase 2',
    short: 'Segunda página con galería de imágenes y Flexbox.',
    title: 'Galería con CSS',
    meta: 'Guía 2 · Grado décimo · 2 horas',
    text: 'La página creció con una segunda página, pag2.html, que tiene una galería de imágenes y su propia hoja de estilos. Con Flexbox se organizaron las fotos y se agregaron efectos suaves al pasar el mouse.',
    chips: ['display: flex', 'flex-wrap', 'gap', 'justify-content', 'object-fit', 'border-radius', 'transition', '::after', ':hover'],
    reto: 'Tomar pantallazos del proceso de cambio de la página y entregarlos. Elegir los videos para la siguiente galería.',
    guide: '/guias/guia-2.pdf',
  },
  {
    id: 'clase-3',
    phase: 'fundamentos',
    label: 'Clase 3',
    short: 'Galería de videos y formulario de contacto.',
    title: 'Videos y contacto',
    meta: 'Guía 3 · Grado décimo · 2 horas',
    text: 'Se sumaron dos páginas más: una galería de videos insertados con iframe y un formulario de contacto que envía los mensajes con Formspree. Así quedó un sitio completo con varias páginas enlazadas.',
    chips: ['<iframe>', '<form>', 'action', 'method="POST"', 'id', 'estilosV.css'],
    reto: 'Entregar el sitio completo funcionando: inicio, galería de imágenes, galería de videos y formulario de contacto.',
    guide: '/guias/guia-3.pdf',
  },
  {
    id: 'figma',
    phase: 'ia',
    label: 'Paso 4',
    short: 'Un prompt con estructura para diseñar en Figma IA.',
    title: 'Diseño con Figma IA',
    meta: 'Diseño · Tema libre',
    text: 'Cada estudiante eligió un tema de su preferencia y escribió un prompt con una estructura clara para que Figma IA generara el diseño de su página web. Toca los ejemplos para ver cómo queda.',
    // Las 6 partes del prompt. En la plantilla, lo que va entre [ ] lo cambia cada estudiante.
    prompt: ['Tema', 'Público', 'Secciones', 'Estilo', 'Colores', 'Incluye'],
    examples: [
      {
        name: 'Plantilla',
        values: [
          'una página web sobre [tu tema]',
          'dirigida a [quién la va a usar]',
          'inicio, información, galería y contacto',
          '[moderno, minimalista, divertido…]',
          '[2 o 3 colores principales]',
          'menú, botones e imágenes de ejemplo',
        ],
      },
      {
        name: 'Tienda',
        values: [
          'una tienda de celulares y accesorios llamada MobileStore',
          'jóvenes que buscan celulares a buen precio',
          'inicio, catálogo, ofertas y contacto',
          'moderno y tecnológico',
          'negro, azul eléctrico y blanco',
          'tarjetas de productos con precio y botón de comprar',
        ],
      },
      {
        name: 'Restaurante',
        values: [
          'un restaurante de comida típica llamado Sombra & Sabor',
          'familias y turistas que visitan Tunja',
          'inicio, menú, galería de platos y reservas',
          'cálido y acogedor',
          'café, crema y verde oliva',
          'fotos de los platos, horarios y botón de reservar',
        ],
      },
      {
        name: 'Videojuego',
        values: [
          'una wiki del videojuego Terraria llamada TerraWiki',
          'jugadores que quieren aprender del juego',
          'inicio, personajes, objetos, jefes y guías',
          'pixel art y divertido',
          'verde, café tierra y azul cielo',
          'buscador, tarjetas con imágenes y menú',
        ],
      },
    ],
    expect: [
      'Un prompt completo, con sus seis partes',
      'Un diseño con todas las secciones de la página',
      'Capturas del diseño listas para el siguiente paso',
    ],
  },
  {
    id: 'codigo',
    phase: 'ia',
    label: 'Paso 5',
    short: 'Fotos del diseño, código con IA y toque personal.',
    title: 'Del diseño al código',
    meta: 'Código · Uso pedagógico de la IA',
    text: 'Con fotos del diseño, la IA generó el HTML, el CSS y hasta el JavaScript. Luego, con lo aprendido en las tres clases, cada estudiante cambió las etiquetas, los textos y las imágenes para hacer la página suya.',
    flow: ['Foto del diseño', 'La IA genera el código', 'El estudiante lo ajusta'],
    // Muestra cifras y algunos proyectos reales (salen de projects.js)
    results: true,
    // Lo que se esperaba con toda la implementación (se muestra a la derecha)
    outcomes: [
      ['Entender antes de automatizar', 'Primero las bases de HTML y CSS, para saber leer lo que la IA propone.'],
      ['La IA como apoyo, no como reemplazo', 'Usarla para diseñar y generar código, y luego revisarlo con criterio.'],
      ['Código propio', 'Cambiar etiquetas, textos, imágenes y colores hasta que la página sea suya.'],
      ['Publicar y compartir', 'Cada página en línea en Netlify y su código en GitHub.'],
    ],
  },
]

// Nota que aparece debajo de las pestañas
export const credit = 'Guías de la docente Rosa Elena Arévalo · Colegio de Boyacá'

export const phases = {
  fundamentos: 'Fundamentos de HTML y CSS',
  ia: 'Diseño y código con IA',
}