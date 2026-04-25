import cors from 'cors'
import express from 'express'
import sqlite3 from 'sqlite3'

const app = express()
const PORT = Number(globalThis.process?.env?.PORT) || 4000
const ADMIN_PASSWORD = globalThis.process?.env?.ADMIN_PASSWORD || 'admin123'
const db = new sqlite3.Database('./server/dacp.db')

app.use(cors())
app.use(express.json())

const runQuery = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.run(query, params, function onRun(error) {
      if (error) {
        reject(error)
        return
      }
      resolve(this)
    })
  })

const getQuery = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.get(query, params, (error, row) => {
      if (error) {
        reject(error)
        return
      }
      resolve(row)
    })
  })


  const allQuery = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.all(query, params, (error, rows) => {
      if (error) {
        reject(error)
        return
      }
      resolve(rows)
    })
  })

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
    [
      'DACP-1001',
      'Industrial Scanner',
      24999.0,
      14,
      'WHS-North',
      'SUP-776',
      'Acme Supply Co.',
      JSON.stringify([
        { date: '2026-04-22T09:22:00.000Z', action: 'Created' },
        { date: '2026-04-23T07:14:00.000Z', action: 'Stock Updated' },
        { date: '2026-04-24T10:02:00.000Z', action: 'Scanned' },
      ]),
      now,
    ],
    [
      'DACP-1002',
      'Barcode Reader Pro',
      14999.0,
      6,
      'WHS-East',
      'SUP-314',
      'Global Parts Ltd.',
      JSON.stringify([
        { date: '2026-04-20T08:00:00.000Z', action: 'Created' },
        { date: '2026-04-24T12:30:00.000Z', action: 'Scanned' },
      ]),
      now,
    ],
    [
      'DACP-1003',
      'Smart Inventory Tag',
      8999.0,
      34,
      'WHS-Central',
      'SUP-901',
      'Prime Components',
      JSON.stringify([
        { date: '2026-04-21T11:00:00.000Z', action: 'Created' },
        { date: '2026-04-24T16:10:00.000Z', action: 'Scanned' },
      ]),
      now,
    ],
  ]
}

const seedProducts = async () => {
  const seedQuery = `
    INSERT OR IGNORE INTO products (
      product_id,
      name,
      price,
      stock,
      warehouse,
      supplier,
      supplier_name,
      logs,
      last_scanned
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  for (const product of sampleProducts()) {
    await runQuery(seedQuery, product)
  }
}

const setupDatabase = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        product_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        warehouse TEXT NOT NULL,
        supplier TEXT NOT NULL,
        supplier_name TEXT NOT NULL,
        logs TEXT NOT NULL,
        last_scanned TEXT NOT NULL
      )
    `)

    seedProducts().catch((error) => {
      console.error('Failed to seed products.', error.message)
    })
  })
}

const toProductDetails = (row) => {
  const logs = JSON.parse(row.logs)
  const latestLog = logs.at(-1) ?? { date: null, action: null }

  return {
    productId: row.product_id,
    name: row.name,
    price: row.price,
    stock: row.stock,
    warehouse: row.warehouse,
    supplier: row.supplier,
    supplierName: row.supplier_name,
    logs,
    date: latestLog.date,
    action: latestLog.action,
    lastScanned: row.last_scanned,
  }
}

app.use('/api/products', requireAdmin)

app.get('/api/products', requireAdminPassword, async (req, res) => {
  try {
    const rows = await allQuery('SELECT * FROM products ORDER BY product_id ASC')
    res.json(rows.map(toProductDetails))
  } catch {
    res.status(500).json({ message: 'Failed to fetch products.' })
  }
})

app.get('/api/products/:productId', (req, res) => {
  const { productId } = req.params

  db.get(
    'SELECT * FROM products WHERE product_id = ?',
    [productId],
    (error, row) => {
      if (error) {
        return res.status(500).json({ message: 'Failed to fetch product details.' })
      }

      if (!row) {
        return res.status(404).json({ message: 'Product not found.' })
      }

      return res.json(toProductDetails(row))
    },
  )
})

app.post(
  '/api/products/seed',
  requireAdmin,
  async (req, res) => {
    try {
      await seedProducts()
      const rows = await allQuery('SELECT * FROM products ORDER BY product_id ASC')
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
      await runQuery(
        `INSERT INTO products (
          product_id, name, price, stock, warehouse, supplier, supplier_name, logs, last_scanned
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          name,
          Number(price),
          Number(stock),
          warehouse,
          supplier,
          supplierName,
          JSON.stringify(logs),
          now,
        ],
      )

      const created = await getQuery('SELECT * FROM products WHERE product_id = ?', [
        productId,
      ])
      res.status(201).json(toProductDetails(created))
    } catch (error) {
      if (String(error.message).includes('UNIQUE')) {
        res.status(409).json({ message: 'Product ID already exists.' })
        return
      }
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
      const existing = await getQuery('SELECT * FROM products WHERE product_id = ?', [
        productId,
      ])
      if (!existing) {
        res.status(404).json({ message: 'Product not found.' })
        return
      }

      const parsedLogs = JSON.parse(existing.logs)
      parsedLogs.push({
        date: new Date().toISOString(),
        action: 'Product Updated',
      })

      await runQuery(
        `UPDATE products
         SET price = ?, stock = ?, warehouse = ?, logs = ?
         WHERE product_id = ?`,
        [
          Number(price ?? existing.price),
          Number(stock ?? existing.stock),
          warehouse ?? existing.warehouse,
          JSON.stringify(parsedLogs),
          productId,
        ],
      )

      const updated = await getQuery('SELECT * FROM products WHERE product_id = ?', [
        productId,
      ])
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
      const row = await getQuery('SELECT * FROM products WHERE product_id = ?', [productId])
      if (!row) {
        res.status(404).json({ message: 'Product not found.' })
        return
      }

      const now = new Date().toISOString()
      const logs = JSON.parse(row.logs)
      logs.push({ date: now, action: 'Scanned' })

      await runQuery(
        'UPDATE products SET logs = ?, last_scanned = ? WHERE product_id = ?',
        [JSON.stringify(logs), now, productId],
      )

      const updated = await getQuery('SELECT * FROM products WHERE product_id = ?', [
        productId,
      ])
      res.json(toProductDetails(updated))
    } catch {
      res.status(500).json({ message: 'Failed to scan product.' })
    }
  },
)

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
