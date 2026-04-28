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
import './ProductDataPage.css'

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
    <main className="app">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="header-icon">
            <Database className="database-icon" />
          </div>
          <div className="header-text">
            <h1>Product Data</h1>
            <p className="subtext">All product details are stored and shown in one place.</p>
          </div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            className="status-message error"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AlertCircle className="status-icon" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {!isAuthorized && (
          <motion.section 
            className="auth-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="panel-header">
              <div className="panel-title">
                <Shield className="panel-icon" />
                <h2>Admin Access</h2>
              </div>
            </div>
            <p className="panel-description">Enter the admin password to view and manage product data.</p>
            <form className="auth-form" onSubmit={handleAccessSubmit}>
              <div className="form-group">
                <label>
                  <Lock className="input-icon" />
                  Admin Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye className="toggle-icon" /> : <Unlock className="toggle-icon" />}
                  </button>
                </div>
              </div>
              <motion.button 
                type="submit" 
                className="submit-btn primary"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Unlock className="btn-icon" />
                Access Data
              </motion.button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isAuthorized && isLoading && (
          <motion.div 
            className="loading-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p>Loading product data...</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isAuthorized && !isLoading && products.length === 0 && !error && (
          <motion.section 
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="empty-icon">
              <Package className="empty-package" />
            </div>
            <h3>No Products Found</h3>
            <p>There are no products in the database yet. Create some products using the Scanner page.</p>
          </motion.section>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isAuthorized && !isLoading && products.length > 0 && (
          <motion.section 
            className="data-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="panel-header">
              <div className="panel-title">
                <Database className="panel-icon" />
                <h2>Centralized Product Records</h2>
              </div>
              <div className="panel-actions">
                <div className="product-count">
                  <Package className="count-icon" />
                  {filteredProducts.length} of {products.length} products
                </div>
                <motion.button 
                  className="export-btn"
                  onClick={exportToCSV}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="btn-icon" />
                  Export CSV
                </motion.button>
              </div>
            </div>
            
            <div className="filters-section">
              <div className="filter-group">
                <div className="filter-item">
                  <Search className="filter-icon" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="filter-item">
                  <Warehouse className="filter-icon" />
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Warehouses</option>
                    {getUniqueWarehouses().map(warehouse => (
                      <option key={warehouse} value={warehouse}>{warehouse}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-item">
                  <Box className="filter-icon" />
                  <select
                    value={selectedStockStatus}
                    onChange={(e) => setSelectedStockStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Stock Levels</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="table-container">
              <div className="table-wrap">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>
                        <div className="table-header">
                          <Database className="header-icon" />
                          Product ID
                        </div>
                      </th>
                      <th>
                        <div className="table-header">
                          <Package className="header-icon" />
                          Name
                        </div>
                      </th>
                      <th>
                        <div className="table-header">
                          <DollarSign className="header-icon" />
                          Price
                        </div>
                      </th>
                      <th>
                        <div className="table-header">
                          <Box className="header-icon" />
                          Stock
                        </div>
                      </th>
                      <th>
                        <div className="table-header">
                          <Warehouse className="header-icon" />
                          Warehouse
                        </div>
                      </th>
                      <th>
                        <div className="table-header">
                          <Truck className="header-icon" />
                          Supplier
                        </div>
                      </th>
                      <th>
                        <div className="table-header">
                          <Truck className="header-icon" />
                          Supplier Name
                        </div>
                      </th>
                      <th>
                        <div className="table-header">
                          <Calendar className="header-icon" />
                          Date
                        </div>
                      </th>
                      <th>
                        <div className="table-header">
                          <Activity className="header-icon" />
                          Action
                        </div>
                      </th>
                      <th>
                        <div className="table-header">
                          <FileText className="header-icon" />
                          Last Scanned
                        </div>
                      </th>
                      <th>
                        <div className="table-header">
                          <FileText className="header-icon" />
                          Logs
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((item, index) => (
                      <motion.tr 
                        key={item.productId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td><code className="product-id">{item.productId}</code></td>
                        <td className="product-name">{item.name}</td>
                        <td className="price">${item.price}</td>
                        <td>
                          <span className={`stock-badge ${item.stock > 10 ? 'in-stock' : item.stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
                            {item.stock} units
                          </span>
                        </td>
                        <td>{item.warehouse}</td>
                        <td>{item.supplier}</td>
                        <td>{item.supplierName}</td>
                        <td className="date">{item.date || 'N/A'}</td>
                        <td>{item.action || 'N/A'}</td>
                        <td className="date">{item.lastScanned}</td>
                        <td>
                          <span className="log-count">
                            <FileText className="log-icon" />
                            {Array.isArray(item.logs) ? item.logs.length : 0}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}

export default ProductDataPage
