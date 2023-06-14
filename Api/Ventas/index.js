import express from 'express'
import {
  uploadSale,
  getOrders,
  getOneOrder,
} from '../../src/Ventas/manageOrders.js'

const Ventas = express.Router()

const parsePage = (page) => {
  if (page === undefined) {
    return 1
  } else {
    return parseInt(page)
  }
}

Ventas.get('/get-orders', async (req, res) => {
  const { query } = req

  const page = parsePage(query.page)
  const salesChannel = query.sales

  console.log(page, salesChannel)

  // if (
  //   salesChannel === undefined ||
  //   salesChannel !== 'all' ||
  //   salesChannel !== 'TiendaNube' ||
  //   salesChannel !== 'MercadoLibre' ||
  //   salesChannel !== 'Regalo'
  // ) {
  //   return res.status(400).json({ message: 'Invalid sales channel' })
  // }

  const request = await getOrders(page, salesChannel)

  if (request.status !== 200) {
    return res

      .status(request.status ?? 500)
      .json({ message: request.message, error: request.error })
  } else {
    return res
      .status(request.status)
      .json({ message: request.message, orders: request.orders })
  }
})

Ventas.get('/order/:id', async (req, res) => {
  const { id } = req.params

  const request = await getOneOrder(id)

  if (request.status !== 200) {
    return res
      .status(request.status ?? 500)
      .json({ message: request.message, error: request.error })
  } else {
    return res
      .status(request.status)
      .json({ message: request.message, order: request.order })
  }
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
