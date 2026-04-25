import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import ProductDataPage from './pages/ProductDataPage'
import ScannerPage from './pages/ScannerPage'

function App() {
  return (
    <>
      <nav className="top-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Scanner
        </NavLink>
        <NavLink to="/product-data" className={({ isActive }) => (isActive ? 'active' : '')}>
          Product Data
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<ScannerPage />} />
        <Route path="/product-data" element={<ProductDataPage />} />
      </Routes>
    </>
  )
}

export default App
