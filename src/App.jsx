import { NavLink, Route, Routes, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { motion } from 'framer-motion'
import { Package, Database, LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import './App.css'
import ProductDataPage from './pages/ProductDataPage'
import ScannerPage from './pages/ScannerPage'
import AuthPage from './pages/AuthPage'

function App() {
  const { isAuthenticated, loading, user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <>
      <motion.nav 
        className="top-nav"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="nav-left">
          <div className="nav-brand">
            <Package className="brand-icon" />
            <span className="brand-text">DACP</span>
          </div>
          <div className="nav-links">
            <NavLink 
              to="/" 
              end 
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <Database className="nav-icon" />
              Scanner
            </NavLink>
            <NavLink 
              to="/product-data" 
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <Package className="nav-icon" />
              Product Data
            </NavLink>
          </div>
        </div>
        
        <div className="nav-right">
          <div className="user-info">
            <User className="user-icon" />
            <span>{user?.name || user?.email}</span>
          </div>
          <motion.button 
            onClick={logout} 
            className="logout-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="logout-icon" />
            Sign Out
          </motion.button>
          
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="menu-icon" /> : <Menu className="menu-icon" />}
          </button>
        </div>
      </motion.nav>
      
      {mobileMenuOpen && (
        <motion.div 
          className="mobile-menu"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <NavLink 
            to="/" 
            end 
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Database className="nav-icon" />
            Scanner
          </NavLink>
          <NavLink 
            to="/product-data" 
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Package className="nav-icon" />
            Product Data
          </NavLink>
        </motion.div>
      )}
      
      <motion.main 
        className="app"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Routes>
          <Route path="/" element={<ScannerPage />} />
          <Route path="/product-data" element={<ProductDataPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.main>
    </>
  )
}

export default App
