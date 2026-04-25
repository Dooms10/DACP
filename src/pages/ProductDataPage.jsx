import { useEffect, useState } from 'react'
import { callApi } from '../api'

function ProductDataPage() {
  const [products, setProducts] = useState([])
  const [adminPassword, setAdminPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchProductId, setSearchProductId] = useState('')
  const [error, setError] = useState('')

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
      } catch (loadError) {
        setProducts([])
        setError(loadError.message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [isAuthorized, adminPassword])

  const handleAccessSubmit = (event) => {
    event.preventDefault()
    if (!adminPassword.trim()) {
      setError('Enter admin password to access product data.')
      return
    }
    setIsAuthorized(true)
    setError('')
  }

  const filteredProducts = products.filter((item) =>
    item.productId.toLowerCase().includes(searchProductId.trim().toLowerCase()),
  )

  return (
    <main className="app">
      <h1>Product Data</h1>
      <p className="subtext">All product details are stored and shown in one place. Admin password required.</p>
      {error && <p className="error">{error}</p>}
      {!isAuthorized && (
        <section className="form-panel">
          <h2>Admin Access Check</h2>
          <form className="form-grid" onSubmit={handleAccessSubmit}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
            />
            <button type="submit">Access Product Data</button>
          </form>
        </section>
      )}
      {isAuthorized && isLoading && <p>Loading product data...</p>}
      {isAuthorized && !isLoading && products.length === 0 && !error && (
        <p>No products available.</p>
      )}
      {isAuthorized && !isLoading && products.length > 0 && (
        <section className="form-panel">
          <h2>Search Product By ID</h2>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Type product ID (e.g. DACP-1001)"
              value={searchProductId}
              onChange={(event) => setSearchProductId(event.target.value)}
            />
          </div>
        </section>
      )}
      {isAuthorized && !isLoading && products.length > 0 && filteredProducts.length === 0 && (
        <p>No products match this Product ID.</p>
      )}
      {isAuthorized && !isLoading && products.length > 0 && <section className="details-panel">
        <h2>Centralized Product Records</h2>
        <div className="table-wrap">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Warehouse</th>
                <th>Supplier</th>
                <th>Supplier Name</th>
                <th>Date</th>
                <th>Action</th>
                <th>Last Scanned</th>
                <th>Logs</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((item) => (
                <tr key={item.productId}>
                  <td>{item.productId}</td>
                  <td>{item.name}</td>
                  <td>{item.price}</td>
                  <td>{item.stock}</td>
                  <td>{item.warehouse}</td>
                  <td>{item.supplier}</td>
                  <td>{item.supplierName}</td>
                  <td>{item.date || 'N/A'}</td>
                  <td>{item.action || 'N/A'}</td>
                  <td>{item.lastScanned}</td>
                  <td>{Array.isArray(item.logs) ? item.logs.length : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>}
    </main>
  )
}

export default ProductDataPage
