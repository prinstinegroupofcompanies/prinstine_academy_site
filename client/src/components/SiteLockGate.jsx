import { useEffect, useState } from 'react'
import {
  canBypassMaintenance,
  isSiteLive,
  MAINTENANCE_LOAD_MS,
  PRIMARY_DEVELOPER,
} from '../config/siteAccess'

function MaintenanceLoading() {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const timer = window.setInterval(() => {
      setElapsed(Date.now() - start)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const minutes = Math.floor(elapsed / 60000)
  const seconds = Math.floor((elapsed % 60000) / 1000)

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 h-12 w-12 animate-spin rounded-full border-4 border-blue-300/30 border-t-blue-200" />
      <h1 className="text-2xl font-semibold text-white md:text-3xl">
        Loading Prinstine Academy
      </h1>
      <p className="mt-3 max-w-md text-sm text-blue-100 md:text-base">
        The site is in maintenance lockdown. Visitors will see this screen until the public launch flag is enabled.
      </p>
      <p className="mt-3 max-w-lg text-sm text-blue-100 md:text-base">
        Approved local development requires a Primary Developer authorization key. Contact {PRIMARY_DEVELOPER.name} at {PRIMARY_DEVELOPER.email} before use.
      </p>
      <p className="mt-6 font-mono text-sm text-slate-300">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
    </div>
  )
}

function MaintenanceUnavailable() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-white">Not Found</h1>
      <p className="mt-3 max-w-lg text-sm text-blue-100 md:text-base">
        This site is temporarily unavailable. Public access remains locked until SITE_LIVE is enabled.
      </p>
      <p className="mt-3 max-w-lg text-sm text-blue-100 md:text-base">
        Approved local development requires Primary Developer authorization. Contact {PRIMARY_DEVELOPER.name} at {PRIMARY_DEVELOPER.email}.
      </p>
    </div>
  )
}

export default function SiteLockGate({ children }) {
  const live = isSiteLive()
  const developerAuthorized = canBypassMaintenance()
  const allowAccess = live || developerAuthorized
  const [phase, setPhase] = useState(allowAccess ? 'live' : 'loading')

  useEffect(() => {
    if (allowAccess) return undefined
    const timer = window.setTimeout(() => setPhase('unavailable'), MAINTENANCE_LOAD_MS)
    return () => window.clearTimeout(timer)
  }, [allowAccess])

  if (allowAccess) return children

  if (phase === 'loading') {
    return <MaintenanceLoading />
  }

  if (phase === 'unavailable') {
    return <MaintenanceUnavailable />
  }

  return children
}
