import React, { useEffect, useState } from 'react'

export default function Toc({ headers }) {
  const [current, setCurrent] = useState('')

  const lastHeaderSlug = headers.at(-1)?.slug ?? ''
  const firstHeaderSlug = headers.at(0)?.slug ?? ''

  useEffect(() => {
    if (headers.length === 0) return
    const headingObserver = new IntersectionObserver(
      (entries) => {
        if (
          window.innerHeight + window.pageYOffset >=
          document.body.offsetHeight
        ) {
          setCurrent(lastHeaderSlug)
        }

        if (window.pageYOffset === 0) {
          setCurrent(firstHeaderSlug)
        }

        for (const entry of entries) {
          if (entry.isIntersecting) {
            setCurrent(entry.target.id)
            break
          }
        }
      },
      {
        rootMargin: '-5% 0% -55% 0%',
        threshold: 1,
      }
    )

    document
      .querySelectorAll('.article :is(h2,h3,h4)')
      .forEach((h) => headingObserver.observe(h))

    return () => {
      headingObserver.disconnect()
    }
  }, [])

  return (
    <nav className="toc">
      <ul>
        {headers
          .filter(({ depth }) => depth >= 2 && depth <= 4)
          .map(({ depth, slug, text }) => (
            <li
              key={slug}
              className={`${current === slug ? 'current' : ''}`}
              data-depth={depth}
              ref={(e) => {
                if (e?.className === 'current') {
                  const toc = document.querySelector('.toc')
                  console.log(toc)
                  toc.scrollTop = e.offsetTop - toc.offsetHeight / 2
                }
              }}
            >
              <a href={`#${slug}`}>{text.replace(/^#/, '')}</a>
              {/* for remove # of header */}
            </li>
          ))}
      </ul>
    </nav>
  )
}
