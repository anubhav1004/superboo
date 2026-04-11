import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { isDesktopApp } from './lib/desktop.ts'

if (typeof document !== "undefined") {
  document.body.classList.toggle("desktop-app", isDesktopApp());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
