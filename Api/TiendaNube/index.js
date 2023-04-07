import express from 'express'
import { getOrders } from '../../src/TiendaNube/GetOrders.js'
import {
  createOrder,
  updateOrder,
  cancelOrder,
} from '../../src/TiendaNube/utils/manageOrders.js'

const TiendaNube = express.Router()

TiendaNube.get('/', async (req, res) => {
  const orders = await getOrders()

  res.json({ orders })
})

TiendaNube.post('/', async (req, res) => {
  const { body } = req
  const { id, event } = body

  console.log(`id: ${id}, event: ${event}`)

  if (event === 'order/cancelled') {
    await cancelOrder(id)
    return res.status(201).json({ message: 'Order cancelled' })
  }

  if (event === 'order/created') {
    const request = await createOrder(id)
    if (request.message === 'Error') {
      return res.status(500).json({ message: 'Error creating order' })
    } else {
      return res.status(201).json({ message: 'Order created' })
    }
  }

  if (event === 'order/paid') {
    if (request.message === 'Error') {
      return res.status(500).json({ message: 'Error updating order' })
    } else {
      return res.status(201).json({ message: 'Order created' })
    }
  }

  if (event === 'order/updated') {
    await updateOrder(id)
    return res.status(200).json({ message: 'Order updated' })
  }

  return res.status(200).json({ message: 'Data fetch' })
})

TiendaNube.all('/', (req, res) => {
  res.status(405).json({ message: 'Method not allowed' })
})

export default TiendaNube
