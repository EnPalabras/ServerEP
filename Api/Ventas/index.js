import express from 'express'
import { uploadSale } from '../../src/Ventas/manageOrders'

const Ventas = express.Router()

Ventas.get('/', async (req, res) => {
  res.json({ message: 'Ventas' })
})

Ventas.post('/', async (req, res) => {
  const { body } = req

  const request = await uploadSale(body)

  if (request.status !== 201) {
    return res
      .status(request.status ?? 500)
      .json({ message: request.message, error: request.error })
  } else {
    return res.status(request.status).json({ message: request.message })
  }
})

Ventas.all('/', (req, res) => {
  res.status(405).json({ message: 'Method not allowed' })
})

export default Ventas
