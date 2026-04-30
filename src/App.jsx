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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Sticky Navbar */}
      <motion.nav 
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-lg"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                DACP
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink 
                to="/" 
                end 
                className={({ isActive }) => 
                  `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Database className="w-4 h-4" />
                Scanner
              </NavLink>
              <NavLink 
                to="/product-data" 
                className={({ isActive }) => 
                  `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Package className="w-4 h-4" />
                Product Data
              </NavLink>
            </div>
            
            {/* User Section */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">
                  {user?.name || user?.email}
                </span>
              </div>
              <motion.button 
                onClick={logout} 
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-500/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </motion.button>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-600" /> : <Menu className="w-6 h-6 text-slate-600" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden border-t border-slate-200 bg-white"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4 py-3 space-y-2">
              <NavLink 
                to="/" 
                end 
                className={({ isActive }) => 
                  `flex items-center gap-2 px-4 py-3 rounded-lg font-medium ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <Database className="w-5 h-5" />
                Scanner
              </NavLink>
              <NavLink 
                to="/product-data" 
                className={({ isActive }) => 
                  `flex items-center gap-2 px-4 py-3 rounded-lg font-medium ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package className="w-5 h-5" />
                Product Data
              </NavLink>
              <div className="flex items-center gap-2 px-4 py-3 text-slate-600">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">{user?.name || user?.email}</span>
              </div>
              <button 
                onClick={logout} 
                className="flex items-center gap-2 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </motion.nav>
      
      {/* Main Content */}
      <motion.main 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
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
    </div>
  )
}

export default App
