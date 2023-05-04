import express from 'express'
import {
  createOrder,
  updateOrder,
  cancelOrder,
} from '../../src/MercadoLibre/utils/manageOrders.js'

const MercadoLibre = express.Router()

MercadoLibre.get('/', async (req, res) => {
  res.json({
    message: 'Only POST requests available',
  })
})

MercadoLibre.post('/', async (req, res) => {
  const { body } = req
  const { topic, resource } = body

  const id = resource.split('/').pop()

  console.log(`id : ${id}, topic: ${topic}`)

  return res.status(200).json({ body })
})

MercadoLibre.all('/', (req, res) => {
  res.status(405).json({ message: 'Method not allowed' })
})

export default MercadoLibre
