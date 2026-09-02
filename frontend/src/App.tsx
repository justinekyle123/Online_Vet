import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/auth-context'
import { DashboardPage, HomePage, LoginPage, MyPetsPage, RegisterPage } from './pages'
import './App.css'

/** `/` shows the dashboard to signed-in users and the landing page to guests. */
function RootGate() {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <DashboardPage /> : <HomePage />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootGate />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pets" element={<MyPetsPage />} />
          {/* Placeholder sidebar links point at future pages — send unmatched paths home for now. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App