import { BrowserMultiFormatReader } from '@zxing/browser'
import { useEffect, useRef, useState } from 'react'
import { callApi } from '../api'

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
      <h1>DACP Product Scanner</h1>
      <p className="subtext">Admin access only. Scan QR/code to store and fetch details.</p>

      <section className="scan-panel">
        <label htmlFor="productId">Product ID</label>
        <div className="scan-row">
          <input id="productId" type="text" value={productId} onChange={(event) => setProductId(event.target.value)} placeholder="e.g. DACP-1001" />
          <button type="button" onClick={() => scanProductByCode(productId)} disabled={status === 'loading'}>
            {status === 'loading' ? 'Scanning...' : 'Scan Product'}
          </button>
        </div>
        <div className="scan-row">
          <button type="button" onClick={startCameraScan} disabled={scanningCamera}>
            {scanningCamera ? 'Camera Scanning...' : 'Scan Using Camera (QR/Barcode)'}
          </button>
          {scanningCamera && <button type="button" onClick={stopCameraScan}>Stop Camera</button>}
        </div>
        <video ref={videoRef} className="scanner-video" muted />
        <button type="button" onClick={seedSampleProducts}>Load Sample Products To Database</button>
      </section>

      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <section className="form-panel">
        <h2>Create Product</h2>
        <div className="form-grid">
          <input placeholder="Product ID" value={newProduct.productId} onChange={(event) => setNewProduct((prev) => ({ ...prev, productId: event.target.value }))} />
          <input placeholder="Name" value={newProduct.name} onChange={(event) => setNewProduct((prev) => ({ ...prev, name: event.target.value }))} />
          <input placeholder="Price" value={newProduct.price} onChange={(event) => setNewProduct((prev) => ({ ...prev, price: event.target.value }))} />
          <input placeholder="Stock" value={newProduct.stock} onChange={(event) => setNewProduct((prev) => ({ ...prev, stock: event.target.value }))} />
          <input placeholder="Warehouse" value={newProduct.warehouse} onChange={(event) => setNewProduct((prev) => ({ ...prev, warehouse: event.target.value }))} />
          <input placeholder="Supplier" value={newProduct.supplier} onChange={(event) => setNewProduct((prev) => ({ ...prev, supplier: event.target.value }))} />
          <input placeholder="Supplier Name" value={newProduct.supplierName} onChange={(event) => setNewProduct((prev) => ({ ...prev, supplierName: event.target.value }))} />
        </div>
        <button type="button" onClick={createProduct}>Create Product</button>
      </section>

      <section className="form-panel">
        <h2>Update Product</h2>
        <div className="form-grid">
          <input placeholder="Product ID" value={updateData.productId} onChange={(event) => setUpdateData((prev) => ({ ...prev, productId: event.target.value }))} />
          <input placeholder="Price" value={updateData.price} onChange={(event) => setUpdateData((prev) => ({ ...prev, price: event.target.value }))} />
          <input placeholder="Stock" value={updateData.stock} onChange={(event) => setUpdateData((prev) => ({ ...prev, stock: event.target.value }))} />
          <input placeholder="Warehouse" value={updateData.warehouse} onChange={(event) => setUpdateData((prev) => ({ ...prev, warehouse: event.target.value }))} />
        </div>
        <button type="button" onClick={updateProduct}>Update Product</button>
      </section>

      {product && (
        <section className="details-panel">
          <h2>Product Details</h2>
          <div className="grid">
            <p><strong>Product ID:</strong> {product.productId}</p>
            <p><strong>Name:</strong> {product.name}</p>
            <p><strong>Price:</strong> {product.price}</p>
            <p><strong>Stock:</strong> {product.stock}</p>
            <p><strong>Warehouse:</strong> {product.warehouse}</p>
            <p><strong>Supplier:</strong> {product.supplier}</p>
            <p><strong>Supplier Name:</strong> {product.supplierName}</p>
            <p><strong>Date:</strong> {product.date || 'N/A'}</p>
            <p><strong>Action:</strong> {product.action || 'N/A'}</p>
            <p><strong>Last Scanned:</strong> {product.lastScanned}</p>
          </div>
        </section>
      )}
    </main>
  )
}

export default ScannerPage
