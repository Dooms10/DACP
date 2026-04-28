import { BrowserMultiFormatReader } from '@zxing/browser'
import { useEffect, useRef, useState } from 'react'
import { callApi } from '../api'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  Camera, 
  CameraOff, 
  Search, 
  Plus, 
  Edit3, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  X,
  Zap,
  Barcode,
  Warehouse,
  Truck,
  DollarSign,
  Box
} from 'lucide-react'
import './ScannerPage.css'

function ScannerPage() {
  const [productId, setProductId] = useState('')
  const [product, setProduct] = useState(null)
  const [status, setStatus] = useState('idle')
  const [scanningCamera, setScanningCamera] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const videoRef = useRef(null)
  const scannerRef = useRef(null)
  const controlsRef = useRef(null)
  const [newProduct, setNewProduct] = useState({
    productId: '',
    name: '',
    price: '',
    stock: '',
    warehouse: '',
    supplier: '',
    supplierName: '',
  })
  const [updateData, setUpdateData] = useState({
    productId: '',
    price: '',
    stock: '',
    warehouse: '',
  })

  const stopCameraScan = () => {
    if (controlsRef.current) {
      controlsRef.current.stop()
      controlsRef.current = null
    }
    setScanningCamera(false)
  }

  useEffect(() => {
    scannerRef.current = new BrowserMultiFormatReader()
    return () => {
      stopCameraScan()
    }
  }, [])

  const extractProductCode = (rawValue) => {
    const scanned = rawValue.trim()
    if (!scanned) return ''
    try {
      const parsed = JSON.parse(scanned)
      if (typeof parsed.productId === 'string') return parsed.productId
      if (typeof parsed.code === 'string') return parsed.code
    } catch {
      // Continue for non-JSON scans.
    }
    try {
      const url = new URL(scanned)
      return url.searchParams.get('productId') || url.searchParams.get('code') || scanned
    } catch {
      return scanned
    }
  }

  const scanProductByCode = async (incomingCode) => {
    const resolvedCode = extractProductCode(incomingCode)
    if (!resolvedCode) {
      setErrorMessage('Enter a product ID before scanning.')
      return
    }
    setProductId(resolvedCode)
    setStatus('loading')
    setErrorMessage('')
    setSuccessMessage('')
    setProduct(null)
    try {
      await callApi(`/api/products/${resolvedCode}/scan`, { method: 'POST' })
      const data = await callApi(`/api/products/${resolvedCode}`)
      setProduct(data)
      setStatus('success')
      setSuccessMessage('Scan logged successfully.')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error.message)
    }
  }

  const startCameraScan = async () => {
    if (!scannerRef.current || !videoRef.current) return
    setErrorMessage('')
    setSuccessMessage('')
    setScanningCamera(true)
    try {
      const controls = await scannerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        async (result) => {
          if (result) {
            stopCameraScan()
            await scanProductByCode(result.getText())
          }
        },
      )
      controlsRef.current = controls
    } catch {
      setScanningCamera(false)
      setErrorMessage('Camera access denied or not available.')
    }
  }

  const createProduct = async () => {
    setErrorMessage('')
    setSuccessMessage('')
    try {
      await callApi('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
        }),
      })
      setSuccessMessage('Product created successfully.')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const updateProduct = async () => {
    if (!updateData.productId.trim()) {
      setErrorMessage('Enter a product ID for update.')
      return
    }
    setErrorMessage('')
    setSuccessMessage('')
    try {
      await callApi(`/api/products/${updateData.productId.trim()}`, {
        method: 'PUT',
        body: JSON.stringify({
          price: Number(updateData.price),
          stock: Number(updateData.stock),
          warehouse: updateData.warehouse,
        }),
      })
      setSuccessMessage('Product updated successfully.')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const seedSampleProducts = async () => {
    setErrorMessage('')
    setSuccessMessage('')
    try {
      await callApi('/api/products/seed', { method: 'POST' })
      setSuccessMessage('Sample products stored in database successfully.')
    } catch (error) {
      setErrorMessage(error.message)
    }
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
            <Barcode className="barcode-icon" />
          </div>
          <div className="header-text">
            <h1>DACP Product Scanner</h1>
            <p className="subtext">Scan QR/code to store and fetch product details.</p>
          </div>
        </div>
      </motion.div>

      <motion.section 
        className="scan-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="panel-header">
          <div className="panel-title">
            <Search className="panel-icon" />
            <h2>Scan Product</h2>
          </div>
        </div>
        
        <div className="scan-content">
          <div className="scan-input-group">
            <div className="input-wrapper">
              <Database className="input-icon" />
              <input 
                id="productId" 
                type="text" 
                value={productId} 
                onChange={(event) => setProductId(event.target.value)} 
                placeholder="Enter product ID (e.g. DACP-1001)" 
                className="scan-input"
              />
            </div>
            <motion.button 
              type="button" 
              className="scan-btn primary"
              onClick={() => scanProductByCode(productId)} 
              disabled={status === 'loading'}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {status === 'loading' ? (
                <>
                  <motion.div 
                    className="spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="btn-icon" />
                  Scan Product
                </>
              )}
            </motion.button>
          </div>
          
          <div className="camera-actions">
            <motion.button 
              type="button" 
              className="camera-btn"
              onClick={startCameraScan} 
              disabled={scanningCamera}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Camera className="btn-icon" />
              {scanningCamera ? 'Camera Active...' : 'Scan Using Camera'}
            </motion.button>
            {scanningCamera && (
              <motion.button 
                type="button" 
                className="camera-btn stop" 
                onClick={stopCameraScan}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CameraOff className="btn-icon" />
                Stop Camera
              </motion.button>
            )}
          </div>
          
          <AnimatePresence>
            {scanningCamera && (
              <motion.div 
                className="camera-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <video ref={videoRef} className="scanner-video" autoPlay playsInline muted />
                <div className="camera-overlay">
                  <div className="scan-line"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button 
            type="button" 
            className="seed-btn"
            onClick={seedSampleProducts}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Package className="btn-icon" />
            Load Sample Products
          </motion.button>
        </div>
      </motion.section>

      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            className="status-message error"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AlertCircle className="status-icon" />
            {errorMessage}
          </motion.div>
        )}
        {successMessage && (
          <motion.div 
            className="status-message success"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CheckCircle className="status-icon" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section 
        className="form-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="panel-header">
          <div className="panel-title">
            <Plus className="panel-icon" />
            <h2>Create New Product</h2>
          </div>
        </div>
        
        <div className="form-content">
          <div className="form-grid">
            <div className="form-group">
              <label>
                <Database className="input-icon" />
                Product ID
              </label>
              <input 
                placeholder="DACP-1001" 
                value={newProduct.productId} 
                onChange={(event) => setNewProduct((prev) => ({ ...prev, productId: event.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label>
                <Package className="input-icon" />
                Product Name
              </label>
              <input 
                placeholder="Product name" 
                value={newProduct.name} 
                onChange={(event) => setNewProduct((prev) => ({ ...prev, name: event.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label>
                <DollarSign className="input-icon" />
                Price
              </label>
              <input 
                placeholder="0.00" 
                value={newProduct.price} 
                onChange={(event) => setNewProduct((prev) => ({ ...prev, price: event.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label>
                <Box className="input-icon" />
                Stock
              </label>
              <input 
                placeholder="0" 
                value={newProduct.stock} 
                onChange={(event) => setNewProduct((prev) => ({ ...prev, stock: event.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label>
                <Warehouse className="input-icon" />
                Warehouse
              </label>
              <input 
                placeholder="Warehouse name" 
                value={newProduct.warehouse} 
                onChange={(event) => setNewProduct((prev) => ({ ...prev, warehouse: event.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label>
                <Truck className="input-icon" />
                Supplier
              </label>
              <input 
                placeholder="Supplier ID" 
                value={newProduct.supplier} 
                onChange={(event) => setNewProduct((prev) => ({ ...prev, supplier: event.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label>
                <Truck className="input-icon" />
                Supplier Name
              </label>
              <input 
                placeholder="Supplier name" 
                value={newProduct.supplierName} 
                onChange={(event) => setNewProduct((prev) => ({ ...prev, supplierName: event.target.value }))} 
              />
            </div>
          </div>
          <motion.button 
            type="button" 
            className="submit-btn primary"
            onClick={createProduct}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="btn-icon" />
            Create Product
          </motion.button>
        </div>
      </motion.section>

      <motion.section 
        className="form-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="panel-header">
          <div className="panel-title">
            <Edit3 className="panel-icon" />
            <h2>Update Product</h2>
          </div>
        </div>
        
        <div className="form-content">
          <div className="form-grid">
            <div className="form-group">
              <label>
                <Database className="input-icon" />
                Product ID
              </label>
              <input 
                placeholder="DACP-1001" 
                value={updateData.productId} 
                onChange={(event) => setUpdateData((prev) => ({ ...prev, productId: event.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label>
                <DollarSign className="input-icon" />
                New Price
              </label>
              <input 
                placeholder="0.00" 
                value={updateData.price} 
                onChange={(event) => setUpdateData((prev) => ({ ...prev, price: event.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label>
                <Box className="input-icon" />
                New Stock
              </label>
              <input 
                placeholder="0" 
                value={updateData.stock} 
                onChange={(event) => setUpdateData((prev) => ({ ...prev, stock: event.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label>
                <Warehouse className="input-icon" />
                New Warehouse
              </label>
              <input 
                placeholder="Warehouse name" 
                value={updateData.warehouse} 
                onChange={(event) => setUpdateData((prev) => ({ ...prev, warehouse: event.target.value }))} 
              />
            </div>
          </div>
          <motion.button 
            type="button" 
            className="submit-btn secondary"
            onClick={updateProduct}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Edit3 className="btn-icon" />
            Update Product
          </motion.button>
        </div>
      </motion.section>

      <AnimatePresence>
        {product && (
          <motion.section 
            className="details-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="panel-header">
              <div className="panel-title">
                <Package className="panel-icon" />
                <h2>Product Details</h2>
              </div>
              <div className="product-badge">
                <Zap className="badge-icon" />
                Scanned
              </div>
            </div>
            
            <div className="product-details">
              <div className="detail-item">
                <div className="detail-header">
                  <Database className="detail-icon" />
                  <span className="label">Product ID</span>
                </div>
                <div className="value product-id">{product.productId}</div>
              </div>
              <div className="detail-item">
                <div className="detail-header">
                  <Package className="detail-icon" />
                  <span className="label">Name</span>
                </div>
                <div className="value product-name">{product.name}</div>
              </div>
              <div className="detail-item">
                <div className="detail-header">
                  <DollarSign className="detail-icon" />
                  <span className="label">Price</span>
                </div>
                <div className="value price">${product.price}</div>
              </div>
              <div className="detail-item">
                <div className="detail-header">
                  <Box className="detail-icon" />
                  <span className="label">Stock</span>
                </div>
                <div className="value">
                  <span className={`stock-badge ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
                    {product.stock} units
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-header">
                  <Warehouse className="detail-icon" />
                  <span className="label">Warehouse</span>
                </div>
                <div className="value">{product.warehouse}</div>
              </div>
              <div className="detail-item">
                <div className="detail-header">
                  <Truck className="detail-icon" />
                  <span className="label">Supplier</span>
                </div>
                <div className="value">{product.supplier}</div>
              </div>
              <div className="detail-item">
                <div className="detail-header">
                  <Truck className="detail-icon" />
                  <span className="label">Supplier Name</span>
                </div>
                <div className="value">{product.supplierName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-header">
                  <Database className="detail-icon" />
                  <span className="label">Date</span>
                </div>
                <div className="value date">{product.date || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-header">
                  <Zap className="detail-icon" />
                  <span className="label">Action</span>
                </div>
                <div className="value">{product.action || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-header">
                  <Barcode className="detail-icon" />
                  <span className="label">Last Scanned</span>
                </div>
                <div className="value date">{product.lastScanned}</div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}

export default ScannerPage
