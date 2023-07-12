import express from 'express'
import {
  createOrder,
  updateOrder,
  manageOrder,
  cancelOrder,
} from '../../src/MercadoLibre/utils/manageOrders.js'

const MercadoLibre = express.Router()

MercadoLibre.get('/', async (req, res) => {
  res.json({
    message: 'Only POST requests available',
  })
})

// MercadoLibre.post('/', async (req, res) => {
//   const { body } = req
//   const { topic, resource } = body
//   const id = resource.split('/').pop()

//   console.log(`id : ${id}, topic: ${topic}`)

//   if (topic === 'orders_v2') {
//     const request = await manageOrder(id)

//     console.log(request)
//     if (request.status !== 200) {
//       return res
//         .status(request.status ?? 500)
//         .json({ message: request.message, error: request.error })
//     } else {
//       return res.status(request.status).json({ message: request.message })
//     }
//   }

//   if (topic === 'shipments') {
//     const request = await updateOrder(id)
//     console.log(request)

//     if (request.status !== 200) {
//       return res
//         .status(request.status ?? 500)
//         .json({ message: request.message, error: request.error })
//     } else {
//       return res.status(request.status).json({ message: request.message })
//     }
//   }

//   return res.status(200).json({ body })
// })

MercadoLibre.post('/', async (req, res) => {
  res.status(200).send({ message: 'Order updated' })
  const { body } = req
  const { topic, resource } = body
  const id = resource.split('/').pop()
  console.log(`id : ${id}, topic: ${topic}`)

  if (topic === 'orders_v2') {
    const request = await manageOrder(id)
  }

  // DEBERÍA GUARDAR EN UN ARCHIVO O ALGO LOS QUE DEN ERROR

  if (topic === 'shipments') {
    const request = await updateOrder(id)
    console.log(request)
  }
})

MercadoLibre.all('/', (req, res) => {
  res.status(405).json({ message: 'Method not allowed' })
})

export default MercadoLibre
