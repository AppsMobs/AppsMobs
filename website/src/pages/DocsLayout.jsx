import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'

export default function DocsLayout({ title, toc = [], children }){
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const nav = [
    { to: '/docs/introduction', label: 'Introduction' },
    { to: '/docs/getting-started', label: 'Getting started' },
    { to: '/docs/quickstart', label: 'Quickstart' },
    { to: '/docs/concepts', label: 'Concepts' },
    { to: '/docs/pricing', label: 'Pricing & licenses' },
    { to: '/docs/core', label: 'Core usage' },
    { to: '/docs/scripts', label: 'Python scripts' },
    { to: '/docs/playground', label: 'Playground' },
    { to: '/docs/referral-rewards', label: 'Referral & Rewards' }
  ]
  const currentIdx = Math.max(0, nav.findIndex(i => i.to === pathname))
  const prev = currentIdx > 0 ? nav[currentIdx - 1] : null
  const next = currentIdx < nav.length - 1 && currentIdx !== -1 ? nav[currentIdx + 1] : null

  const [activeId, setActiveId] = useState(toc?.[0]?.href?.slice(1) || '')
  const [showTop, setShowTop] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Search index for all documentation pages - Comprehensive keywords
  const searchIndex = useMemo(() => [
    // Introduction
    { page: 'Introduction', path: '/docs/introduction', keywords: ['introduction', 'overview', 'what is', 'what is appsmobs', 'features', 'key features', 'requirements', 'system requirements', 'architecture', 'bundled', 'tools', 'components', 'included', 'who is it for', 'beginners', 'power users', 'teams', 'local execution', 'privacy', 'security'] },
    // Getting Started
    { page: 'Getting Started', path: '/docs/getting-started', keywords: ['getting started', 'install', 'installation', 'setup', 'first run', 'usb debugging', 'enable debugging', 'connect', 'connection', 'pair', 'pairing', 'verify', 'troubleshooting', 'troubleshoot', 'license', 'activation', 'activate', 'device', 'android', 'windows', 'cable', 'usb', 'wifi', 'wireless', 'mirror', 'mirroring', 'screen', 'quick actions', 'first script', 'script'] },
    // Quickstart
    { page: 'Quickstart', path: '/docs/quickstart', keywords: ['quickstart', 'quick start', 'quick', 'fast', '5 minutes', 'rapid setup', 'install', 'enable debugging', 'connect device', 'verify connection', 'first action', 'launch', 'start', 'begin', 'run', 'open', 'beginner', 'tutorial'] },
    // Concepts
    { page: 'Concepts', path: '/docs/concepts', keywords: ['concepts', 'terminology', 'device', 'devices', 'connection', 'status', 'online', 'unauthorized', 'scrcpy', 'mirroring', 'screen mirroring', 'input forwarding', 'quick actions', 'scripts', 'automation', 'image detection', 'licensing', 'license', 'security', 'local execution', 'architecture', 'data flow', 'execution model'] },
    // Pricing
    { page: 'Pricing & Licenses', path: '/docs/pricing', keywords: ['pricing', 'price', 'cost', 'license', 'licenses', 'plans', 'plan', 'normal', 'pro', 'team', 'activation', 'activate', 'renewal', 'tokens', 'token', 'purchase', 'buy', 'subscription', 'cancel', 'revoke', 'reassign', 'offline', 'online', 'faq', 'refund'] },
    // Core
    { page: 'Core Usage', path: '/docs/core', keywords: ['core', 'core usage', 'dashboard', 'device list', 'devices', 'quick actions', 'multi device', 'multiple devices', 'device management', 'control', 'manage', 'connect', 'disconnect', 'status'] },
    // Scripts
    { page: 'Python Scripts', path: '/docs/scripts', keywords: ['scripts', 'script', 'python', 'automation', 'script structure', 'SCRIPT_INFO', 'images', 'img folder', 'image detection', 'template matching', 'confidence', 'region', 'examples', 'best practices', 'execution', 'run script', 'execute'] },
    // Playground - Functions (all 34 functions)
    { page: 'Playground - Click', path: '/docs/playground#click', keywords: ['click', 'single tap', 'tap', 'coordinate', 'coordinates', 'x y', 'position', 'pixel', 'pixels'] },
    { page: 'Playground - Double Click', path: '/docs/playground#doubleclick', keywords: ['doubleclick', 'double click', 'double tap', 'two taps'] },
    { page: 'Playground - Write', path: '/docs/playground#write', keywords: ['write', 'type', 'text', 'keyboard', 'input', 'enter text', 'fill form'] },
    { page: 'Playground - Swipe', path: '/docs/playground#swipe', keywords: ['swipe', 'custom swipe', 'scroll', 'drag', 'slide'] },
    { page: 'Playground - Back', path: '/docs/playground#back', keywords: ['back', 'back button', 'navigate', 'navigation', 'return', 'previous'] },
    { page: 'Playground - Home', path: '/docs/playground#home', keywords: ['home', 'home button', 'home screen', 'main screen'] },
    { page: 'Playground - Enter', path: '/docs/playground#enter', keywords: ['enter', 'entre', 'key', 'submit', 'confirm'] },
    { page: 'Playground - Switch', path: '/docs/playground#switch', keywords: ['switch', 'recent apps', 'app switcher', 'switch app', 'applications'] },
    { page: 'Playground - Sleep', path: '/docs/playground#sleep', keywords: ['sleep', 'wait', 'delay', 'time', 'pause', 'seconds'] },
    { page: 'Playground - Swipe Up', path: '/docs/playground#swipe-up', keywords: ['swipe up', 'upswipe', 'scroll up', 'upward'] },
    { page: 'Playground - Swipe Down', path: '/docs/playground#swipe-down', keywords: ['swipe down', 'downswipe', 'scroll down', 'downward'] },
    { page: 'Playground - Swipe Left', path: '/docs/playground#swipe-left', keywords: ['swipe left', 'leftswipe', 'scroll left', 'leftward'] },
    { page: 'Playground - Swipe Right', path: '/docs/playground#swipe-right', keywords: ['swipe right', 'rightswipe', 'scroll right', 'rightward'] },
    { page: 'Playground - Find', path: '/docs/playground#find', keywords: ['Find', 'find image', 'image detection', 'computer vision', 'infinite loop', 'loop', 'search', 'locate', 'detect'] },
    { page: 'Playground - Findd', path: '/docs/playground#findd', keywords: ['Findd', 'find once', 'find image once', 'single search'] },
    { page: 'Playground - Finddd', path: '/docs/playground#finddd', keywords: ['Finddd', 'find none', 'returns none'] },
    { page: 'Playground - Findtf', path: '/docs/playground#findtf', keywords: ['Findtf', 'find boolean', 'check image', 'exists', 'if exists', 'boolean'] },
    { page: 'Playground - Findtfmultiple', path: '/docs/playground#findtfmultiple', keywords: ['Findtfmultiple', 'find multiple', 'check multiple images', 'any image'] },
    { page: 'Playground - FindAllImages', path: '/docs/playground#findallimages', keywords: ['FindAllImages', 'find all', 'dictionary', 'all images', 'multiple'] },
    { page: 'Playground - Findmulti', path: '/docs/playground#findmulti', keywords: ['Findmulti', 'find one among many', 'one image'] },
    { page: 'Playground - FindPosClick', path: '/docs/playground#findposclick', keywords: ['FindPosClick', 'find and click', 'search click', 'infinite loop', 'wait and click'] },
    { page: 'Playground - FindPosClickSound', path: '/docs/playground#findposclicksound', keywords: ['FindPosClickSound', 'sound alert', 'alarm', 'notification', 'alert'] },
    { page: 'Playground - FindPosClickList', path: '/docs/playground#findposclicklist', keywords: ['FindPosClickList', 'find list', 'multiple images click', 'list click'] },
    { page: 'Playground - FindPosClickListLoop', path: '/docs/playground#findposclicklistloop', keywords: ['FindPosClickListLoop', 'find list loop', 'loop list'] },
    { page: 'Playground - Finddoubleclick', path: '/docs/playground#finddoubleclick', keywords: ['Finddoubleclick', 'double click image', 'double click find'] },
    { page: 'Playground - FindAndDoubleClick', path: '/docs/playground#findanddoubleclick', keywords: ['FindAndDoubleClick', 'double click multiple', 'multiple double click'] },
    { page: 'Playground - Random Delay', path: '/docs/playground#random-delay', keywords: ['random_delay', 'random wait', 'delay', 'random time', 'human behavior'] },
    { page: 'Playground - Wait For Image', path: '/docs/playground#wait-for-image', keywords: ['wait_for_image', 'wait image', 'timeout', 'wait for', 'appear'] },
    { page: 'Playground - Long Press', path: '/docs/playground#long-press', keywords: ['long_press', 'long press', 'hold', 'position', 'press and hold'] },
    { page: 'Playground - Long Press Image', path: '/docs/playground#long-press-image', keywords: ['long_press_image', 'long press image', 'hold image'] },
    { page: 'Playground - Screenshot', path: '/docs/playground#screenshot', keywords: ['screenshot', 'capture', 'screen', 'save screen', 'image capture'] },
    { page: 'Playground - Toggle Airplane Mode', path: '/docs/playground#toggle-airplane-mode', keywords: ['toggle_airplane_mode', 'airplane mode', 'network reset', 'wifi reset', 'connection reset'] },
    { page: 'Playground - Clear Cache', path: '/docs/playground#clear-cache', keywords: ['clear_cache', 'clear cache', 'app cache', 'package', 'package name'] },
    { page: 'Playground - Restart App', path: '/docs/playground#restart-app', keywords: ['restart_app', 'restart app', 'application', 'relaunch', 'reopen', 'launch app', 'start app'] },
    // Referral & Rewards
    { page: 'Referral & Rewards', path: '/docs/referral-rewards', keywords: ['referral', 'rewards', 'tokens', 'earning', 'earn', 'redeem', 'balance', 'dashboard', 'invite', 'invitation', 'free', 'license weeks'] },
  ], [])

  // Filter search results - More flexible matching
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase().trim()
    const queryWords = query.split(/\s+/).filter(w => w.length > 0)
    
    return searchIndex.filter(item => {
      const pageLower = item.page.toLowerCase()
      const allKeywords = item.keywords.join(' ').toLowerCase()
      const searchText = `${pageLower} ${allKeywords}`.toLowerCase()
      
      // Flexible matching: check if any query word matches anywhere in page name or keywords
      // This ensures even a single word like "launch" will find relevant results
      return queryWords.some(word => {
        return searchText.includes(word) ||
               pageLower.includes(word) ||
               item.keywords.some(kw => kw.toLowerCase().includes(word))
      })
    })
    .sort((a, b) => {
      // Sort by relevance: exact matches first, then partial matches
      const queryLower = query.toLowerCase()
      const aScore = a.page.toLowerCase().includes(queryLower) ? 2 : 
                    a.keywords.some(kw => kw.toLowerCase().includes(queryLower)) ? 1 : 0
      const bScore = b.page.toLowerCase().includes(queryLower) ? 2 : 
                    b.keywords.some(kw => kw.toLowerCase().includes(queryLower)) ? 1 : 0
      return bScore - aScore
    })
    .slice(0, 12) // Limit to 12 results
  }, [searchQuery, searchIndex])

  // Handle search result click
  const handleSearchResultClick = (path) => {
    setSearchQuery('')
    setShowSearchResults(false)
    navigate(path)
    // Scroll to hash after navigation if present
    setTimeout(() => {
      const hash = path.split('#')[1]
      if (hash) {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }, 100)
  }

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSearchResults && !e.target.closest('.doc-search-container')) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showSearchResults])

  // Add copy buttons to code blocks and observe headings for TOC highlight
  useEffect(() => {
    // Copy buttons
    const blocks = document.querySelectorAll('.doc-main .doc-code')
    blocks.forEach(block => {
      if (block.querySelector('.copy-btn')) return
      const button = document.createElement('button')
      button.className = 'copy-btn'
      button.textContent = 'Copy'
      button.addEventListener('click', () => {
        const code = block.querySelector('code')?.innerText || ''
        navigator.clipboard.writeText(code)
        button.textContent = 'Copied'
        setTimeout(() => { button.textContent = 'Copy' }, 1200)
      })
      block.appendChild(button)
    })

    // TOC active highlight
    const ids = toc.map(t => t.href.replace('#',''))
    const elements = ids.map(id => document.getElementById(id)).filter(Boolean)
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b)=> b.intersectionRatio - a.intersectionRatio)[0]
      if (visible?.target?.id) setActiveId(visible.target.id)
    }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] })
    elements.forEach(el => observer.observe(el))
    // Prism syntax highlight for dynamically rendered content
    try { (window).Prism && (window).Prism.highlightAll(); } catch (e) {}
    return () => observer.disconnect()
  }, [pathname, toc])

  // Sync URL hash with active section for nice deep-links
  useEffect(() => {
    if (!activeId) return
    const currentHash = window.location.hash.replace('#','')
    if (currentHash !== activeId) {
      window.history.replaceState(null, '', `#${activeId}`)
    }
  }, [activeId])

  // Enhance headings with anchor icons and set Back-to-top visibility
  useEffect(() => {
    const main = document.querySelector('.doc-main')
    if (!main) return
    const headings = main.querySelectorAll('h2, h3')
    headings.forEach(h => {
      if (h.querySelector('.anchor-link')) return
      if (!h.id) return
      const a = document.createElement('a')
      a.href = `#${h.id}`
      a.className = 'anchor-link'
      a.setAttribute('aria-label', 'Anchor link')
      h.appendChild(a)
    })
    const onScroll = () => setShowTop(window.scrollY > 400)
    onScroll();
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  return (
    <div className="container py-10 doc-layout">
      {/* Global Search Bar */}
      <div className="doc-search-container mb-8" style={{ gridColumn: '1 / -1' }}>
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search entire documentation... (e.g., 'click', 'image detection', 'pricing', 'setup')"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSearchResults(true)
            }}
            onFocus={() => searchQuery && setShowSearchResults(true)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-cyan/50 transition-all text-base"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-bg/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl max-h-96 overflow-y-auto">
              <div className="p-2">
                <div className="text-xs text-white/60 px-3 py-2 mb-1 border-b border-white/10">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </div>
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchResultClick(result.path)}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-lg transition-colors group"
                  >
                    <div className="font-semibold text-cyan group-hover:text-cyan-300 transition-colors">
                      {result.page}
                    </div>
                    <div className="text-sm text-white/60 mt-1">
                      {result.path}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {showSearchResults && searchQuery && searchResults.length === 0 && (
            <div className="absolute z-50 w-full mt-2 bg-bg/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl">
              <div className="p-4 text-center text-white/60">
                No results found for "{searchQuery}"
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="doc-sidebar">
        <div className="doc-sidebar-inner">
          <h2 className="doc-sidebar-title">Documentation</h2>
          {nav.map(item => (
            <Link key={item.to} to={item.to} className={pathname===item.to? 'text-white':'text-white/80 hover:text-white'}>
              {item.label}
            </Link>
          ))}
        </div>
      </aside>

      <main className="doc-main">
        <h1 className="doc-title">{title}</h1>
        {children}

        <div className="doc-pager">
          {prev ? (
            <Link to={prev.to} className="doc-prev">
              <span className="arrow">←</span>
              <span className="label">{prev.label}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={next.to} className="doc-next">
              <span className="label">{next.label}</span>
              <span className="arrow">→</span>
            </Link>
          ) : <span />}
        </div>
      </main>

      <aside className="doc-right">
        <div className="doc-right-inner">
          <p className="doc-right-title">On this page</p>
          {toc.map(link => (
            <a key={link.href} href={link.href} className={activeId === link.href.slice(1) ? 'active' : ''}>{link.label}</a>
          ))}
        </div>
      </aside>

      {showTop && (
        <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">↑</button>
      )}
    </div>
  )
}


