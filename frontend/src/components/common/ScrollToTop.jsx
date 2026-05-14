// components/common/ScrollToTop.jsx
// 1) Router listener: scrolls to top on every route change
// 2) FAB button: appears after scrolling down, scrolls back to top

import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'

/**
 * ScrollToTopOnNavigate — place once inside <Router>, outside <Routes>.
 * Silently scrolls window to top on every path change.
 */
export const ScrollToTopOnNavigate = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

/**
 * ScrollToTopButton — floating "back to top" button shown after scrolling 300px.
 */
export const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <button
      onClick={scrollUp}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-40 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  )
}

/**
 * Default export: the combined component that does both —
 * route-change scroll + floating button.
 */
const ScrollToTop = () => (
  <>
    <ScrollToTopOnNavigate />
    <ScrollToTopButton />
  </>
)

export default ScrollToTop
