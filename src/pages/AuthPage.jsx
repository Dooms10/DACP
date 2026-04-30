import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, User, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        className="w-full max-w-md relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <motion.div 
            className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg shadow-blue-500/30 mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Package className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            className="text-4xl font-bold text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            DACP
          </motion.h1>
          <motion.p 
            className="text-slate-400 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Product Scan & Inventory Management
          </motion.p>
        </div>

        {/* Auth Card */}
        <motion.div 
          className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <motion.button 
              className={`flex-1 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                isLogin 
                  ? 'bg-white/10 text-white border-b-2 border-blue-500' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setIsLogin(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <User className="w-4 h-4" />
              Sign In
            </motion.button>
            <motion.button 
              className={`flex-1 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                !isLogin 
                  ? 'bg-white/10 text-white border-b-2 border-blue-500' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setIsLogin(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <User className="w-4 h-4" />
              Sign Up
            </motion.button>
          </div>

          {/* Form */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.form 
                key={isLogin ? 'login' : 'signup'}
                onSubmit={handleSubmit} 
                className="space-y-4"
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </motion.div>
                )}

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      required
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Lock className="w-4 h-4 inline mr-1" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button 
                  type="submit" 
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-slate-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <motion.button 
                  type="button" 
                  onClick={toggleMode} 
                  className="ml-2 text-blue-400 hover:text-blue-300 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </motion.button>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div 
          className="flex justify-center gap-6 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Smart Scanning</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Shield className="w-4 h-4" />
            <span>Secure Data</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Zap className="w-4 h-4" />
            <span>Fast Processing</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AuthPage
          Demo: Use any email/password to sign in. Add "admin" to email for admin role.
        </motion.p>
      </motion.div>
    </div>
  )
}

export default AuthPage