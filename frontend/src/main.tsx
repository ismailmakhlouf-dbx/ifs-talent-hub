import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Build timestamp: 2026-01-20T13:45:00Z - Force cache bust
console.log('[IFS Talent Hub] Build: 20260120-1345')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
