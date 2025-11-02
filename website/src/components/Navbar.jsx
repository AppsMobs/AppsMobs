import { Link, NavLink, useNavigate } from 'react-router-dom'
import { DOCS_URL } from '../config'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Navbar(){
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [tokens, setTokens] = useState(0)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Charger les jetons si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated) {
      loadTokens()
    }
  }, [isAuthenticated])

  const loadTokens = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/api/my-tokens`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setTokens(data.tokens?.tokens || 0)
      }
    } catch (err) {
      console.error('Error loading tokens:', err)
    }
  }

  const handleLogout = () => {
    logout()
    setShowProfileMenu(false)
    window.location.href = '/'
  }

  const getInitials = (email) => {
    if (!email) return 'U'
    const parts = email.split('@')
    if (parts[0].length > 0) {
      return parts[0].charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <header className="sticky top-0 z-50 bg-bg/70 backdrop-blur border-b border-white/10">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <img src="/assets/Logo.png" alt="AppsMobs" className="w-6 h-6" />
          <span className="font-bold text-cyan">AppsMobs</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <NavLink to="/" className={({isActive})=>isActive? 'text-cyan':'text-white/80 hover:text-white'}>Home</NavLink>
          <NavLink to="/download" className={({isActive})=>isActive? 'text-cyan':'text-white/80 hover:text-white'}>Download</NavLink>
          <NavLink to="/about" className={({isActive})=>isActive? 'text-cyan':'text-white/80 hover:text-white'}>About</NavLink>
          <a href={DOCS_URL} target="_blank" rel="noreferrer" className={'text-white/80 hover:text-white'}>Documentation</a>
          <NavLink to="/faq" className={({isActive})=>isActive? 'text-cyan':'text-white/80 hover:text-white'}>FAQ</NavLink>
          <NavLink to="/shop" className={({isActive})=>isActive? 'text-cyan':'text-white/80 hover:text-white'}>Shop</NavLink>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Affichage des jetons */}
              <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
                <img src="/assets/token.png" alt="Tokens" className="w-4 h-4" />
                <span className="text-white text-sm font-semibold">{tokens}</span>
                <span className="text-white/60 text-xs">tokens</span>
              </div>

              {/* Dropdown de profil */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white font-semibold text-sm transition-all"
                  aria-label="Profile menu"
                >
                  {getInitials(user?.email)}
                </button>

                {showProfileMenu && (
                  <>
                    {/* Overlay pour fermer le menu en cliquant ailleurs */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    {/* Menu dropdown */}
                    <div className="absolute right-0 mt-2 w-56 bg-bg border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                      {/* Header du menu */}
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-white font-semibold text-sm truncate">
                          {user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-white/60 text-xs truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>

                      {/* Options du menu */}
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Dashboard
                        </Link>
                        <Link
                          to="/download"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download App
                        </Link>
                        <div className="border-t border-white/10 my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors text-left"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              <NavLink to="/login" className={({isActive})=>isActive? 'text-cyan':'text-white/80 hover:text-white'}>Login</NavLink>
              <NavLink to="/register" className={({isActive})=>isActive? 'text-cyan':'text-white/80 hover:text-white'}>Register</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

