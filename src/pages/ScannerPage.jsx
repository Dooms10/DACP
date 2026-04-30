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
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
            <Barcode className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">DACP Product Scanner</h1>
            <p className="text-blue-100 mt-1">Scan QR/code to store and fetch product details.</p>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {errorMessage}
          </motion.div>
        )}
        {successMessage && (
          <motion.div 
            className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan Product Section */}
      <motion.section 
        className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Scan Product</h2>
        </div>
        
        <div className="space-y-4">
          {/* Manual Scan Input */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Database className="w-5 h-5" />
              </div>
              <input 
                id="productId" 
                type="text" 
                value={productId} 
                onChange={(event) => setProductId(event.target.value)} 
                placeholder="Enter product ID (e.g. DACP-1001)" 
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <motion.button 
              type="button" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/30 flex items-center gap-2 justify-center"
              onClick={() => scanProductByCode(productId)} 
              disabled={status === 'loading'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {status === 'loading' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Scan Product
                </>
              )}
            </motion.button>
          </div>
          
          {/* Camera Buttons */}
          <div className="flex flex-wrap gap-3">
            <motion.button 
              type="button" 
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              onClick={startCameraScan} 
              disabled={scanningCamera}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Camera className="w-4 h-4" />
              {scanningCamera ? 'Camera Active...' : 'Scan Using Camera'}
            </motion.button>
            {scanningCamera && (
              <motion.button 
                type="button" 
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                onClick={stopCameraScan}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CameraOff className="w-4 h-4" />
                Stop Camera
              </motion.button>
            )}
            <motion.button 
              type="button" 
              className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              onClick={seedSampleProducts}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Package className="w-4 h-4" />
              Load Sample Products
            </motion.button>
          </div>
          
          {/* Camera Container */}
          <AnimatePresence>
            {scanningCamera && (
              <motion.div 
                className="mt-4 rounded-xl overflow-hidden border-2 border-blue-500 bg-slate-900"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <video ref={videoRef} className="w-full h-64 object-cover" autoPlay playsInline muted />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Create New Product Section */}
      <motion.section 
        className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Plus className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Create New Product</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Database className="w-4 h-4 inline mr-1" />
              Product ID
            </label>
            <input 
              placeholder="DACP-1001" 
              value={newProduct.productId} 
              onChange={(event) => setNewProduct((prev) => ({ ...prev, productId: event.target.value }))} 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Package className="w-4 h-4 inline mr-1" />
              Product Name
            </label>
            <input 
              placeholder="Product name" 
              value={newProduct.name} 
              onChange={(event) => setNewProduct((prev) => ({ ...prev, name: event.target.value }))} 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Price
            </label>
            <input 
              placeholder="0.00" 
              value={newProduct.price} 
              onChange={(event) => setNewProduct((prev) => ({ ...prev, price: event.target.value }))} 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Box className="w-4 h-4 inline mr-1" />
              Stock
            </label>
            <input 
              placeholder="0" 
              value={newProduct.stock} 
              onChange={(event) => setNewProduct((prev) => ({ ...prev, stock: event.target.value }))} 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Warehouse className="w-4 h-4 inline mr-1" />
              Warehouse
            </label>
            <input 
              placeholder="Warehouse name" 
              value={newProduct.warehouse} 
              onChange={(event) => setNewProduct((prev) => ({ ...prev, warehouse: event.target.value }))} 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Truck className="w-4 h-4 inline mr-1" />
              Supplier
            </label>
            <input 
              placeholder="Supplier ID" 
              value={newProduct.supplier} 
              onChange={(event) => setNewProduct((prev) => ({ ...prev, supplier: event.target.value }))} 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Truck className="w-4 h-4 inline mr-1" />
              Supplier Name
            </label>
            <input 
              placeholder="Supplier name" 
              value={newProduct.supplierName} 
              onChange={(event) => setNewProduct((prev) => ({ ...prev, supplierName: event.target.value }))} 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
        <motion.button 
          type="button" 
          className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          onClick={createProduct}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Create Product
        </motion.button>
      </motion.section>

      {/* Update Product Section */}
      <motion.section 
        className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Edit3 className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Update Product</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Database className="w-4 h-4 inline mr-1" />
              Product ID
            </label>
            <input 
              placeholder="DACP-1001" 
              value={updateData.productId} 
              onChange={(event) => setUpdateData((prev) => ({ ...prev, productId: event.target.value }))} 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              New Price
            </label>
            <input 
              placeholder="0.00" 
              value={updateData.price} 
              onChange={(event) => setUpdateData((prev) => ({ ...prev, price: event.target.value }))} 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Box className="w-4 h-4 inline mr-1" />
              New Stock
            </label>
            <input 
              placeholder="0" 
              value={updateData.stock} 
              onChange={(event) => setUpdateData((prev) => ({ ...prev, stock: event.target.value }))} 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Warehouse className="w-4 h-4 inline mr-1" />
              New Warehouse
            </label>
            <input 
              placeholder="Warehouse name" 
              value={updateData.warehouse} 
              onChange={(event) => setUpdateData((prev) => ({ ...prev, warehouse: event.target.value }))} 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>
        </div>
        <motion.button 
          type="button" 
          className="mt-6 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-amber-600/30 flex items-center gap-2"
          onClick={updateProduct}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Edit3 className="w-5 h-5" />
          Update Product
        </motion.button>
      </motion.section>

      {/* Product Details Section */}
      <AnimatePresence>
        {product && (
          <motion.section 
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Product Details</h2>
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Scanned
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Database className="w-4 h-4" />
                  Product ID
                </div>
                <div className="text-lg font-semibold text-slate-800">{product.productId}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Package className="w-4 h-4" />
                  Name
                </div>
                <div className="text-lg font-semibold text-slate-800">{product.name}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <DollarSign className="w-4 h-4" />
                  Price
                </div>
                <div className="text-lg font-semibold text-green-600">${product.price}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Box className="w-4 h-4" />
                  Stock
                </div>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 10 ? 'bg-green-100 text-green-700' : 
                  product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  {product.stock} units
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Warehouse className="w-4 h-4" />
                  Warehouse
                </div>
                <div className="text-lg font-semibold text-slate-800">{product.warehouse}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Truck className="w-4 h-4" />
                  Supplier
                </div>
                <div className="text-lg font-semibold text-slate-800">{product.supplier}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Truck className="w-4 h-4" />
                  Supplier Name
                </div>
                <div className="text-lg font-semibold text-slate-800">{product.supplierName}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Database className="w-4 h-4" />
                  Date
                </div>
                <div className="text-lg font-semibold text-slate-800">{product.date || 'N/A'}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Zap className="w-4 h-4" />
                  Action
                </div>
                <div className="text-lg font-semibold text-slate-800">{product.action || 'N/A'}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Barcode className="w-4 h-4" />
                  Last Scanned
                </div>
                <div className="text-lg font-semibold text-slate-800">{product.lastScanned}</div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ScannerPage

