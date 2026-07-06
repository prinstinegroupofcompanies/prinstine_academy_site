import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './admin/components/ToastProvider'
import './index.css'
import App from './App.jsx'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'
import SiteLockGate from './components/SiteLockGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AppErrorBoundary>
        <BrowserRouter>
          <SiteLockGate>
            <App />
          </SiteLockGate>
        </BrowserRouter>
      </AppErrorBoundary>
    </ToastProvider>
  </StrictMode>,
)
