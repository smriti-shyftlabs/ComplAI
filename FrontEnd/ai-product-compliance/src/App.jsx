import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import AuthPage from './pages/Auth/AuthPage'
import Dashboard from './pages/Dashboard/Dashboard'
import AddProduct from './pages/Products/AddProduct'
import ComplianceReport from './pages/Compliance/ComplianceReport'
import Approval from './pages/Approval/Approval'
import AuditTrail from './pages/Audit/AuditTrail'
import PublishedProducts from './pages/Published/PublishedProducts'
import Analytics from './pages/Analytics/Analytics'
import Settings from './pages/Settings/Settings'

function PrivateRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<AddProduct />} />
        <Route path="/compliance" element={<ComplianceReport />} />
        <Route path="/approval" element={<Approval />} />
        <Route path="/audit" element={<AuditTrail />} />
        <Route path="/published" element={<PublishedProducts />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  )
}

function App() {
  const { currentUser } = useAuth()

  if (!currentUser) return <AuthPage />

  return (
    <Routes>
      <Route path="/*" element={<PrivateRoutes />} />
    </Routes>
  )
}

export default App
