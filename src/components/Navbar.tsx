import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Search, Shield } from 'lucide-react'

const links = [
  { to: '/search', label: 'Archive' },
  { to: '/villains', label: 'Villains' },
  { to: '/compare', label: 'Compare' },
  { to: '/teams', label: 'Affiliations' },
  { to: '/random', label: 'Roulette' },
  { to: '/favorites', label: 'My File' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search')
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-mist-100 text-ink-800 border-b-4 border-hero-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Shield className="text-hero-red" size={24} strokeWidth={2.5} />
          <span className="font-display text-2xl tracking-wide leading-none">
            Registry <span className="text-hero-red">Division</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive ? 'text-hero-gold' : 'text-ink-700 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="hidden lg:flex items-center ml-auto relative">
          <Search size={15} className="absolute left-3 text-mist-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the registry..."
            className="w-56 xl:w-72 bg-ink-800 text-mist-100 border-2 border-ink-800 rounded-none pl-9 pr-4 py-2 text-sm placeholder:text-mist-500 focus:outline-none focus:border-hero-blue transition-colors"
          />
        </form>

        <Link
          to="/search"
          className="hidden lg:inline-flex items-center px-4 py-2 bg-hero-red text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
        >
          Enlist a Search
        </Link>

        <button
          className="lg:hidden ml-auto p-2 text-ink-800"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t-2 border-ink-800 bg-mist-100 px-4 py-4 flex flex-col gap-2">
          <form onSubmit={submitSearch} className="relative mb-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the registry..."
              className="w-full bg-ink-800 text-mist-100 border-2 border-ink-800 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-hero-blue"
            />
          </form>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-bold uppercase tracking-wider ${isActive ? 'text-hero-gold' : 'text-ink-700'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
