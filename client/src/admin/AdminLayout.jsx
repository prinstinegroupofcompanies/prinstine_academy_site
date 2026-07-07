import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { adminLogin, getSession, logout } from '../services/admin/authService'
import usePageMeta from '../hooks/usePageMeta'
import { adminRoutes } from './adminRoutes'

const navItems = adminRoutes.map(({ to, label, end }) => ({ to, label, end }))

export default function AdminLayout() {
  const location = useLocation()
  const didInitSession = useRef(false)
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState(
    import.meta.env.DEV ? 'admin@prinstineacademy.org' : '',
  )
  const [password, setPassword] = useState(
    import.meta.env.DEV ? 'Admin@PrinstineAcademy2026' : '',
  )
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAuthenticated = useMemo(() => Boolean(user), [user])
  const activeSection = useMemo(
    () => navItems.find((item) => item.to === location.pathname)?.label || 'Overview',
    [location.pathname]
  )
  usePageMeta({
    title: isAuthenticated ? 'Admin Panel' : 'Admin Login',
    description: 'Administrative interface for Prinstine Academy.',
    noindex: true,
  })

  async function refreshSession() {
    try {
      const current = await getSession()
      setUser(current)
      setAuthError('')
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (didInitSession.current) return
    didInitSession.current = true
    refreshSession()
  }, [])

  async function handleLogin(event) {
    event.preventDefault()
    setAuthError('')
    setSubmitting(true)
    try {
      const data = await adminLogin(email, password)
      // Prefer user from login response so we do not depend on a second request
      // (global API timeout was aborting /auth/me on slow networks).
      const nextUser = data?.user ?? (await getSession())
      setUser(nextUser ?? null)
      setAuthError('')
    } catch (e) {
      const status = e?.response?.status
      const msg =
        e?.response?.data?.error?.message ||
        (status === 404
          ? 'API endpoint not found. Check that the Render backend is deployed and the Vercel proxy is routing /api correctly.'
          : status === 401
            ? 'Invalid email or password.'
            : e?.code === 'ECONNABORTED'
              ? 'The backend request timed out. Check the Render service and the /api proxy route.'
              : e?.message === 'Network Error'
                ? 'Could not reach the backend. Verify the Render deployment is running and the Vercel /api proxy is configured correctly.'
                : 'Login failed')
      setAuthError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  function handleLogout() {
    if (!confirmLeaveIfDirty()) return
    logout()
    setUser(null)
  }

  const confirmLeaveIfDirty = useCallback(() => {
    if (!window.__adminHasUnsavedChanges) return true
    return window.confirm(
      'You have unsaved changes. Are you sure you want to leave this page?'
    )
  }, [])

  useEffect(() => {
    function onPopState() {
      if (confirmLeaveIfDirty()) return
      // Restore current history entry when user cancels back/forward navigation.
      window.history.go(1)
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [confirmLeaveIfDirty])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  if (loading) {
    return <section className="glass-card p-6">Checking admin session...</section>
  }

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-md space-y-4 rounded-2xl border border-blue-200/20 bg-white/5 p-6 shadow-soft md:p-8">
        <h1 className="text-2xl font-semibold text-white">Admin Login</h1>
        <p className="text-sm text-slate-300">
          Sign in to access analytics and management dashboards.
        </p>
        <form onSubmit={handleLogin} className="grid gap-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
          />
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        {authError ? (
          <p className="rounded-lg border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {authError}
          </p>
        ) : null}
        <p className="text-sm text-slate-400">Use your admin credentials to continue.</p>
      </section>
    )
  }

  if (String(user?.role || '').toLowerCase() !== 'admin') {
    return (
      <section className="mx-auto max-w-lg space-y-4 glass-card p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-white">Admin Access Required</h1>
        <p className="text-sm text-slate-300">
          Your account is signed in but does not have admin permissions for this dashboard.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/" className="btn-outline">
            Back to site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-rose-300/40 bg-rose-500/20 px-3 py-1.5 text-sm text-rose-100 hover:bg-rose-500/30"
          >
            Logout
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-blue-200/20 bg-white/5 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
            <p className="text-sm text-slate-300">Signed in as {user.email}</p>
            <p className="mt-1 text-xs text-amber-300">
              Analysis/view mode is active for monitoring and reporting.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10 lg:hidden"
            >
              {sidebarOpen ? 'Hide Sections' : 'Sections'}
            </button>
            <Link
              to="/"
              onClick={(e) => {
                if (!confirmLeaveIfDirty()) e.preventDefault()
              }}
              className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
            >
              Back to site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-rose-300/40 bg-rose-500/20 px-3 py-1.5 text-sm text-rose-100 hover:bg-rose-500/30"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-wide text-blue-200">Current Section</p>
            <p className="mt-1 text-sm font-semibold text-white">{activeSection}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-wide text-blue-200">Role</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {String(user.role || 'admin')}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-wide text-blue-200">Routes Connected</p>
            <p className="mt-1 text-sm font-semibold text-white">{navItems.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside
          className={[
            'rounded-2xl border border-blue-200/20 bg-white/5 p-3 lg:sticky lg:top-24 lg:block lg:h-fit',
            sidebarOpen ? 'block' : 'hidden lg:block',
          ].join(' ')}
        >
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-blue-200">
            Dashboard Sections
          </p>
          <nav className="grid gap-1" aria-label="Admin sections">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={(e) => {
                  if (!confirmLeaveIfDirty()) e.preventDefault()
                }}
                className={({ isActive }) =>
                  [
                    'rounded-xl px-3 py-2.5 text-sm transition',
                    isActive
                      ? 'bg-cyan-400/20 text-cyan-100'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-blue-200/20 bg-white/5 p-4 md:p-6"
        >
          <Outlet />
        </motion.div>
      </div>
    </section>
  )
}
