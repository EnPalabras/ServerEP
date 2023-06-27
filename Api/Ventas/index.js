import express from 'express'
import {
  uploadSale,
  getOrders,
  getOneOrder,
  deleteOneOrder,
  localSales,
} from '../../src/Ventas/manageOrders.js'

const Ventas = express.Router()

const parsePage = (page) => {
  if (page === undefined) {
    return 1
  } else {
    return parseInt(page)
  }
}

Ventas.get('/retiro-local', async (req, res) => {
  const { query } = req
  const page = parsePage(query.page)
  const search = query.search

  const request = await localSales(page, search)

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

Ventas.get('/get-orders', async (req, res) => {
  const { query } = req

  const page = parsePage(query.page)
  const salesChannel = query.sales
  const search = query.search

  console.log(page, salesChannel)

  const request = await getOrders(page, salesChannel, search)

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

Ventas.delete('/order/:id', async (req, res) => {
  const { id } = req.params

  const request = await deleteOneOrder(id)

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
