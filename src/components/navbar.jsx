"use client"

import { useRef, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { BookOpen, ChevronDown, LogOut, LayoutDashboard, Shield, User, Menu, X, Upload } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/contexts/auth-context'
import { useClickOutside } from '@/lib/hooks'
import { cn } from '@/lib/utils'

const PUBLIC_LINKS = [
  { label: 'Catalogue', to: '/' },
]

const AUTH_LINKS = [
  { label: 'Mes contributions', to: '/mes-contributions' },
  { label: 'Favoris',           to: '/favoris' },
  { label: 'Historique',        to: '/historique' },
]

function MenuItem({ icon: Icon, label, to, onClick, destructive }) {
  const cls = cn(
    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors outline-none',
    destructive
      ? 'text-destructive hover:bg-destructive/10'
      : 'text-popover-foreground hover:bg-muted',
  )
  if (to) return (
    <Link to={to} className={cls} onClick={onClick}>
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </Link>
  )
  return (
    <button type="button" role="menuitem" className={cls} onClick={onClick}>
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </button>
  )
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export function Navbar() {
  const { user, isAdmin, isModerator, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef(null)

  useClickOutside(menuRef, () => setMenuOpen(false))

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
    navigate('/connexion', { replace: true })
  }

  const userInitials = initials(user?.name)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-5" aria-hidden="true" />
          </span>
          <span className="text-[0.95rem] leading-tight font-semibold text-foreground">
            Bibliothèque
            <span className="block text-xs font-normal text-muted-foreground">Digitale</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          {PUBLIC_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {link.label}
            </NavLink>
          ))}
          {user && AUTH_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {link.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-1.5 rounded-lg p-1 pr-2 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-400 text-sm font-semibold text-primary-foreground">
                {userInitials}
              </span>
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
              >
                <div className="border-b border-border px-3 py-2">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email ?? user?.name}</p>
                </div>
                {isAdmin && (
                  <>
                    <MenuItem icon={LayoutDashboard} label="Tableau de bord" to="/admin" onClick={() => setMenuOpen(false)} />
                    <MenuItem icon={Shield} label="Modération" to="/admin/moderation" onClick={() => setMenuOpen(false)} />
                    <MenuItem icon={User} label="Utilisateurs" to="/admin/utilisateurs" onClick={() => setMenuOpen(false)} />
                    <MenuItem icon={BookOpen} label="Catégories" to="/admin/categories" onClick={() => setMenuOpen(false)} />
                    <div className="my-1 h-px bg-border" />
                  </>
                )}
                {isModerator && !isAdmin && (
                  <>
                    <MenuItem icon={Shield} label="Modération" to="/admin/moderation" onClick={() => setMenuOpen(false)} />
                    <MenuItem icon={BookOpen} label="Catégories" to="/admin/categories" onClick={() => setMenuOpen(false)} />
                    <div className="my-1 h-px bg-border" />
                  </>
                )}
                <MenuItem icon={Upload} label="Soumettre un document" to="/contribuer" onClick={() => setMenuOpen(false)} />
                <div className="my-1 h-px bg-border" />
                <MenuItem icon={LogOut} label="Se déconnecter" destructive onClick={handleLogout} />
              </div>
            )}
          </div>

          {/* Mobile burger */}
          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 md:hidden"
          >
            {mobileOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav aria-label="Navigation mobile" className="border-t border-border px-4 py-2 md:hidden">
          {PUBLIC_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {link.label}
            </NavLink>
          ))}
          {user && AUTH_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {link.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn('block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
            >Admin</NavLink>
          )}
          {isModerator && !isAdmin && (
            <NavLink to="/admin/moderation" onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn('block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
            >Modération</NavLink>
          )}
        </nav>
      )}
    </header>
  )
}
