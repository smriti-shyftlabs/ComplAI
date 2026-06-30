import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/globals.css'
import { initDB } from './db/initDB'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'

// Boot the in-memory database and seed all collections before rendering
initDB()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
