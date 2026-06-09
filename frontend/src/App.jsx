import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PatrimonioProvider } from './context/PatrimonioContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'

// Páginas
import HomePage from './pages/HomePage/HomePage'
import LoginPage from './pages/LoginPage/LoginPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import AboutPage from './pages/AboutPage/AboutPage'
import FaqPage from './pages/FaqPage/FaqPage'
import ContactPage from './pages/ContactPage/ContactPage'
import BienDetailPage from './pages/BienDetailPage/BienDetailPage'
import InformeFormPage from './pages/InformeFormPage/InformeFormPage'
import InformeEditPage from './pages/InformeEditPage/InformeEditPage'
import BienFormPage from './pages/BienFormPage/BienFormPage'
import BienEditPage from './pages/BienEditPage/BienEditPage'
import ChatPage from './pages/ChatPage/ChatPage'


function App() {
  return (
    <AuthProvider>
      <PatrimonioProvider>
        <ScrollToTop />
        <Navbar />
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/bien/:id/editar" element={
          <ProtectedRoute requiredRole="admin"><BienEditPage /></ProtectedRoute>
           } />
          

          {/* Bien — nuevo ANTES que :id */}
          <Route path="/bien/nuevo" element={
            <ProtectedRoute requiredRole="admin"><BienFormPage /></ProtectedRoute>
          } />
          <Route path="/bien/:id" element={<BienDetailPage />} />

          {/* Informes */}
          <Route path="/informe/nuevo" element={<ProtectedRoute><InformeFormPage /></ProtectedRoute>} />
          <Route path="/informe/:id/editar" element={<ProtectedRoute><InformeEditPage /></ProtectedRoute>} />

          {/* Chat IA */}
          <Route path="/chat" element={<ChatPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </PatrimonioProvider>
    </AuthProvider>
  )
}

export default App