import { useEffect, useState } from 'react'
import { callApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Database, 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  AlertCircle, 
  CheckCircle,
  Package,
  DollarSign,
  Box,
  Warehouse,
  Truck,
  Calendar,
  Activity,
  FileText,
  Lock,
  Unlock
} from 'lucide-react'

function ProductDataPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [adminPassword, setAdminPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')
  const [selectedStockStatus, setSelectedStockStatus] = useState('all')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!isAuthorized) return

    const load = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await callApi('/api/products', {
          headers: {
            'x-admin-password': adminPassword,
          },
        })
        setProducts(data)
        setFilteredProducts(data)
      } catch (loadError) {
        setProducts([])
        setFilteredProducts([])
        setError(loadError.message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [isAuthorized, adminPassword])

  useEffect(() => {
    let filtered = products

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by warehouse
    if (selectedWarehouse !== 'all') {
      filtered = filtered.filter(product => product.warehouse === selectedWarehouse)
    }

    // Filter by stock status
    if (selectedStockStatus !== 'all') {
      filtered = filtered.filter(product => {
        if (selectedStockStatus === 'in-stock') return product.stock > 10
        if (selectedStockStatus === 'low-stock') return product.stock > 0 && product.stock <= 10
        if (selectedStockStatus === 'out-of-stock') return product.stock === 0
        return true
      })
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedWarehouse, selectedStockStatus])

  const handleAccessSubmit = (event) => {
    event.preventDefault()
    if (!adminPassword.trim()) {
      setError('Enter admin password to access product data.')
      return
    }
    setIsAuthorized(true)
    setError('')
  }

  const getUniqueWarehouses = () => {
    const warehouses = [...new Set(products.map(p => p.warehouse).filter(Boolean))]
    return warehouses.sort()
  }

  const exportToCSV = () => {
    const headers = ['Product ID', 'Name', 'Price', 'Stock', 'Warehouse', 'Supplier', 'Supplier Name', 'Date', 'Action', 'Last Scanned']
    const csvData = filteredProducts.map(product => [
      product.productId,
      product.name,
      product.price,
      product.stock,
      product.warehouse,
      product.supplier,
      product.supplierName,
      product.date || 'N/A',
      product.action || 'N/A',
      product.lastScanned
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div 
        className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-8 text-white shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Product Data</h1>
            <p className="text-slate-300 mt-1">All product details are stored and shown in one place.</p>
          </div>
        </div>
      </motion.div>
      
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Admin Access Panel */}
      <AnimatePresence>
        {!isAuthorized && (
          <motion.section 
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-slate-100 rounded-xl mb-4">
                <Shield className="w-8 h-8 text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Admin Access</h2>
              <p className="text-slate-500 mt-2">Enter the admin password to view and manage product data.</p>
            </div>
            <form className="max-w-md mx-auto" onSubmit={handleAccessSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <motion.button 
                type="submit" 
                className="w-full px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-slate-600/30 flex items-center gap-2 justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Unlock className="w-5 h-5" />
                Access Data
              </motion.button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
      
      {/* Loading State */}
      <AnimatePresence>
        {isAuthorized && isLoading && (
          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading product data...</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Empty State */}
      <AnimatePresence>
        {isAuthorized && !isLoading && products.length === 0 && !error && (
          <motion.section 
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="inline-flex p-4 bg-slate-100 rounded-xl mb-4">
              <Package className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Products Found</h3>
            <p className="text-slate-500">There are no products in the database yet. Create some products using the Scanner page.</p>
          </motion.section>
        )}
      </AnimatePresence>
      
      {/* Data Panel */}
      <AnimatePresence>
        {isAuthorized && !isLoading && products.length > 0 && (
          <motion.section 
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Panel Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Database className="w-5 h-5 text-slate-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Centralized Product Records</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                    <Package className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">
                      {filteredProducts.length} of {products.length} products
                    </span>
                  </div>
                  <motion.button 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/30 flex items-center gap-2"
                    onClick={exportToCSV}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </motion.button>
                </div>
              </div>
            </div>
            
            {/* Filters */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-slate-400" />
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="all">All Warehouses</option>
                    {getUniqueWarehouses().map(warehouse => (
                      <option key={warehouse} value={warehouse}>{warehouse}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-slate-400" />
                  <select
                    value={selectedStockStatus}
                    onChange={(e) => setSelectedStockStatus(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="all">All Stock Levels</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Product ID
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Name
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Price
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4" />
                        Stock
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Warehouse className="w-4 h-4" />
                        Warehouse
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Supplier
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Supplier Name
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Action
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Last Scanned
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Logs
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((item, index) => (
                    <motion.tr 
                      key={item.productId}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                          {item.productId}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">${item.price}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          item.stock > 10 ? 'bg-green-100 text-green-700' : 
                          item.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.stock} units
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.warehouse}</td>
                      <td className="px-4 py-3 text-slate-600">{item.supplier}</td>
                      <td className="px-4 py-3 text-slate-600">{item.supplierName}</td>
                      <td className="px-4 py-3 text-slate-600">{item.date || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-600">{item.action || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-600">{item.lastScanned}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-sm text-slate-600">
                          <FileText className="w-3 h-3" />
                          {Array.isArray(item.logs) ? item.logs.length : 0}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProductDataPage
