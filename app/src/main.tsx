import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { StoreProvider } from './lib/store'
import { ThemeProvider } from './lib/theme'
import { UIProvider } from './lib/uiContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <StoreProvider>
        <UIProvider>
          <App />
        </UIProvider>
      </StoreProvider>
    </ThemeProvider>
  </StrictMode>
)

// register network-first service worker (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
