import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './contexts/LanguageContext.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { YearProvider } from './contexts/YearContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <YearProvider>
          <App />
        </YearProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
