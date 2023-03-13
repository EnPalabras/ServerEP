import express from 'express'
import { getOrders } from '../../src/TiendaNube/GetOrders.js'

const TiendaNube = express.Router()

TiendaNube.get('/', async (req, res) => {
  const orders = await getOrders()

  res.json({ orders })
})

TiendaNube.post('/', (req, res) => {
  res.json({ message: 'Hello From Api Routes Post Req' })
})

TiendaNube.all('/', (req, res) => {
  res.status(405).json({ message: 'Method not allowed' })
})

export default TiendaNube
