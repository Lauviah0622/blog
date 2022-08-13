import React, { useState, useEffect, useRef } from 'react'
import css from '~/utils/css'

export default function Hamburger({ links }) {
  const [open, setOpen] = useState(false)
  const [hide, setHide] = useState(false)

  const lastScrollTopRef = useRef(0)
  const tickRef = useRef(false)

  useEffect(() => {
    const scrollHandler = (e) => {
      if (!tickRef.current || !open) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY || document.documentElement.scrollTop
          setHide(scrollPos > lastScrollTopRef.current)
          lastScrollTopRef.current = scrollPos
          tickRef.Ref = false
        })

        tickRef.Ref = true
      }
    }
    document.addEventListener('scroll', scrollHandler)

    return () => {
      document.addEventListener('scroll', scrollHandler)
    }
  }, [])

  const path = window.location.pathname.replace('/', '')

  return (
    <div id="hamburger" className="only-mobile">
      <div
        className={css(
          'hamburger__icon',
          open && 'open',
          !open && hide && 'hide'
        )}
        onClick={() => {
          setOpen((s) => !s)
        }}
      >
        <div className="top" />
        <div className="mid" />
        <div className="btm" />
      </div>
      <div
        className={css(
          'hamburger__menu',
          'center',
          open && 'hamburger__menu--open'
        )}
        onClickCapture={(e) => {
          if (e.currentTarget !== e.target) return
          setOpen(false)
        }}
      >
        <div className="hamburger__menu--container">
          {Object.entries(links).map(([text, link]) => (
            <a
              href={link}
              key={text}
              className={css(
                window.location.pathname === link && 'current-link'
              )}
            >
              {text}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
