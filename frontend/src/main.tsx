import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Build timestamp: 2026-01-20T13:55:00Z - FX rate fix
console.log('[IFS Talent Hub] Build: 20260121-0300 HARDCODE-PROD')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
