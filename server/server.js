import cors from 'cors'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const PORT = Number(globalThis.process?.env?.PORT) || 4000
const ADMIN_PASSWORD = globalThis.process?.env?.ADMIN_PASSWORD || 'admin123'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.resolve(__dirname, '../dist')
const dataDir = globalThis.process?.env?.DATA_DIR || __dirname
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}
const storePath = path.join(dataDir, 'dacp-store.json')

app.use(cors())
app.use(express.json())

const readStore = () => {
  if (!fs.existsSync(storePath)) {
    return { products: {} }
  }
  try {
    return JSON.parse(fs.readFileSync(storePath, 'utf8'))
  } catch {
    return { products: {} }
  }
}

const writeStore = (store) => {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8')
}

const requireRole = (allowedRoles) => (req, res, next) => {
  if (req.method === 'OPTIONS') {
    next()
    return
  }

  const role = req.header('x-role')
  if (!role || !allowedRoles.includes(role)) {
    res.status(403).json({
      message: `Forbidden. Allowed roles: ${allowedRoles.join(', ')}`,
    })
    return
  }
  next()
}

const requireAdmin = requireRole(['admin'])
const requireAdminPassword = (req, res, next) => {
  const password = req.header('x-admin-password')
  if (!password || password !== ADMIN_PASSWORD) {
    res.status(401).json({ message: 'Unauthorized. Invalid admin password.' })
    return
  }
  next()
}

const sampleProducts = () => {
  const now = new Date().toISOString()
  return [
    {
      productId: 'DACP-1001',
      name: 'Industrial Scanner',
      price: 24999.0,
      stock: 14,
      warehouse: 'WHS-North',
      supplier: 'SUP-776',
      supplierName: 'Acme Supply Co.',
      logs: [
        { date: '2026-04-22T09:22:00.000Z', action: 'Created' },
        { date: '2026-04-23T07:14:00.000Z', action: 'Stock Updated' },
        { date: '2026-04-24T10:02:00.000Z', action: 'Scanned' },
      ],
      lastScanned: now,
    },
    {
      productId: 'DACP-1002',
      name: 'Barcode Reader Pro',
      price: 14999.0,
      stock: 6,
      warehouse: 'WHS-East',
      supplier: 'SUP-314',
      supplierName: 'Global Parts Ltd.',
      logs: [
        { date: '2026-04-20T08:00:00.000Z', action: 'Created' },
        { date: '2026-04-24T12:30:00.000Z', action: 'Scanned' },
      ],
      lastScanned: now,
    },
    {
      productId: 'DACP-1003',
      name: 'Smart Inventory Tag',
      price: 8999.0,
      stock: 34,
      warehouse: 'WHS-Central',
      supplier: 'SUP-901',
      supplierName: 'Prime Components',
      logs: [
        { date: '2026-04-21T11:00:00.000Z', action: 'Created' },
        { date: '2026-04-24T16:10:00.000Z', action: 'Scanned' },
      ],
      lastScanned: now,
    },
  ]
}

const seedProducts = () => {
  const store = readStore()
  if (!store.products || typeof store.products !== 'object') {
    store.products = {}
  }
  for (const product of sampleProducts()) {
    if (!store.products[product.productId]) {
      store.products[product.productId] = product
    }
  }
  writeStore(store)
}

const setupDatabase = () => {
  seedProducts()
}

const toProductDetails = (row) => {
  const logs = Array.isArray(row.logs) ? row.logs : []
  const latestLog = logs.at(-1) ?? { date: null, action: null }

  return {
    productId: row.productId,
    name: row.name,
    price: row.price,
    stock: row.stock,
    warehouse: row.warehouse,
    supplier: row.supplier,
    supplierName: row.supplierName,
    logs,
    date: latestLog.date,
    action: latestLog.action,
    lastScanned: row.lastScanned,
  }
}

app.use('/api/products', requireAdmin)

app.get('/api/products', requireAdminPassword, async (req, res) => {
  try {
    const store = readStore()
    const rows = Object.values(store.products || {}).sort((a, b) => a.productId.localeCompare(b.productId))
    res.json(rows.map(toProductDetails))
  } catch {
    res.status(500).json({ message: 'Failed to fetch products.' })
  }
})

app.get('/api/products/:productId', (req, res) => {
  const { productId } = req.params
  const store = readStore()
  const row = store.products?.[productId]
  if (!row) {
    res.status(404).json({ message: 'Product not found.' })
    return
  }
  res.json(toProductDetails(row))
})

app.post(
  '/api/products/seed',
  requireAdmin,
  async (req, res) => {
    try {
      seedProducts()
      const store = readStore()
      const rows = Object.values(store.products || {}).sort((a, b) => a.productId.localeCompare(b.productId))
      res.json({
        message: 'Sample products seeded successfully.',
        products: rows.map(toProductDetails),
      })
    } catch {
      res.status(500).json({ message: 'Failed to seed sample products.' })
    }
  },
)

app.post(
  '/api/products',
  requireAdmin,
  async (req, res) => {
    const {
      productId,
      name,
      price,
      stock,
      warehouse,
      supplier,
      supplierName,
    } = req.body

    if (
      !productId ||
      !name ||
      price === undefined ||
      stock === undefined ||
      !warehouse ||
      !supplier ||
      !supplierName
    ) {
      res.status(400).json({ message: 'Missing required product fields.' })
      return
    }

    const now = new Date().toISOString()
    const logs = [{ date: now, action: 'Created' }]

    try {
      const store = readStore()
      if (store.products?.[productId]) {
        res.status(409).json({ message: 'Product ID already exists.' })
        return
      }
      store.products = store.products || {}
      store.products[productId] = {
        productId,
        name,
        price: Number(price),
        stock: Number(stock),
        warehouse,
        supplier,
        supplierName,
        logs,
        lastScanned: now,
      }
      writeStore(store)
      const created = store.products[productId]
      res.status(201).json(toProductDetails(created))
    } catch {
      res.status(500).json({ message: 'Failed to create product.' })
    }
  },
)

app.put(
  '/api/products/:productId',
  requireAdmin,
  async (req, res) => {
    const { productId } = req.params
    const { price, stock, warehouse } = req.body

    try {
      const store = readStore()
      const existing = store.products?.[productId]
      if (!existing) {
        res.status(404).json({ message: 'Product not found.' })
        return
      }

      const parsedLogs = Array.isArray(existing.logs) ? existing.logs : []
      parsedLogs.push({
        date: new Date().toISOString(),
        action: 'Product Updated',
      })

      store.products[productId] = {
        ...existing,
        price: Number(price ?? existing.price),
        stock: Number(stock ?? existing.stock),
        warehouse: warehouse ?? existing.warehouse,
        logs: parsedLogs,
      }
      writeStore(store)
      const updated = store.products[productId]
      res.json(toProductDetails(updated))
    } catch {
      res.status(500).json({ message: 'Failed to update product.' })
    }
  },
)

app.post(
  '/api/products/:productId/scan',
  requireAdmin,
  async (req, res) => {
    const { productId } = req.params

    try {
      const store = readStore()
      const row = store.products?.[productId]
      if (!row) {
        res.status(404).json({ message: 'Product not found.' })
        return
      }

      const now = new Date().toISOString()
      const logs = Array.isArray(row.logs) ? row.logs : []
      logs.push({ date: now, action: 'Scanned' })

      store.products[productId] = {
        ...row,
        logs,
        lastScanned: now,
      }
      writeStore(store)
      const updated = store.products[productId]
      res.json(toProductDetails(updated))
    } catch {
      res.status(500).json({ message: 'Failed to scan product.' })
    }
  },
)

app.use(express.static(distPath))

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (error) => {
    if (error) {
      res.status(503).send(
        'Frontend build not found. Run "npm run build" in the DACP project and restart server.',
      )
    }
  })
})

setupDatabase()

const server = app.listen(PORT, () => {
  console.log(`DACP backend is running on http://localhost:${PORT}`)
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Stop the existing backend or run with another port (example: PORT=4001 npm run server).`,
    )
    return
  }
  console.error('Backend startup failed.', error.message)
})
