import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, User, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'
import './AuthPage.css'

function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, signup } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (isLogin) {
        // Login
        if (!formData.email || !formData.password) {
          setError('Please enter both email and password')
          setIsSubmitting(false)
          return
        }
        const result = login(formData.email, formData.password)
        if (!result.success) {
          setError(result.error || 'Login failed')
        }
      } else {
        // Sign Up
        if (!formData.email || !formData.password || !formData.name) {
          setError('Please fill in all fields')
          setIsSubmitting(false)
          return
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setIsSubmitting(false)
          return
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters')
          setIsSubmitting(false)
          return
        }
        const result = signup(formData.email, formData.password, formData.name)
        if (!result.success) {
          setError(result.error || 'Sign up failed')
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }

    setIsSubmitting(false)
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <motion.div 
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="auth-header">
          <motion.div 
            className="auth-logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Package className="logo-icon" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            DACP
          </motion.h1>
          <motion.p 
            className="auth-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Product Scan & Inventory Management
          </motion.p>
        </div>

        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="auth-tabs">
            <motion.button 
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <User className="tab-icon" />
              Sign In
            </motion.button>
            <motion.button 
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <User className="tab-icon" />
              Sign Up
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form 
              key={isLogin ? 'login' : 'signup'}
              onSubmit={handleSubmit} 
              className="auth-form"
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {!isLogin && (
                <motion.div 
                  className="form-group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label htmlFor="name">
                    <User className="input-icon" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </motion.div>
              )}

              <motion.div 
                className="form-group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label htmlFor="email">
                  <Mail className="input-icon" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </motion.div>

              <motion.div 
                className="form-group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="password">
                  <Lock className="input-icon" />
                  Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="toggle-icon" /> : <Eye className="toggle-icon" />}
                  </button>
                </div>
              </motion.div>

              {!isLogin && (
                <motion.div 
                  className="form-group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="confirmPassword">
                    <Lock className="input-icon" />
                    Confirm Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="toggle-icon" /> : <Eye className="toggle-icon" />}
                    </button>
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="auth-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                type="submit" 
                className="auth-submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <motion.div 
                    className="spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="submit-icon" />
                  </>
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <motion.button 
                type="button" 
                onClick={toggleMode} 
                className="auth-link"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </motion.button>
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="auth-features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="feature-item">
            <Sparkles className="feature-icon" />
            <span>Smart Scanning</span>
          </div>
          <div className="feature-item">
            <Shield className="feature-icon" />
            <span>Secure Data</span>
          </div>
          <div className="feature-item">
            <Zap className="feature-icon" />
            <span>Fast Processing</span>
          </div>
        </motion.div>

        <motion.p 
          className="auth-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Demo: Use any email/password to sign in. Add "admin" to email for admin role.
        </motion.p>
      </motion.div>
    </div>
  )
}

export default AuthPage