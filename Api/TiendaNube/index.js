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
    const request = await cancelOrder(id)
    if (request.status !== 202) {
      return res
        .status(request.status ?? 500)
        .json({ message: request.message, error: request.error })
    } else {
      return res.status(request.status).json({ message: request.message })
    }
  }

  if (event === 'order/created') {
    const request = await createOrder(id)
    if (request.status !== 201) {
      return res
        .status(request.status ?? 500)
        .json({ message: request.message, error: request.error })
    } else {
      return res.status(request.status).json({ message: request.message })
    }
  }

  if (event === 'order/paid') {
    const request = await updateOrder(id)

    if (request.status !== 202) {
      return res
        .status(request.status ?? 500)
        .json({ message: request.message, error: request.error })
    } else {
      return res.status(request.status).json({ message: request.message })
    }
  }

  if (event === 'order/fulfilled') {
    const request = await updateOrder(id)

    if (request.status !== 202) {
      return res
        .status(request.status ?? 500)
        .json({ message: request.message, error: request.error })
    } else {
      return res.status(request.status).json({ message: request.message })
    }
  }

  return res.status(200).json({ message: 'Data fetch' })
})

TiendaNube.all('/', (req, res) => {
  res.status(405).json({ message: 'Method not allowed' })
})

export default TiendaNube
