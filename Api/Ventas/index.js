import express from 'express'
import {
  uploadSale,
  getOrders,
  getOneOrder,
  deleteOneOrder,
  localSales,
  markOrderAsPaid,
  setManyPayments,
  updateProductsFromOrder,
  updatePaymentFromOrder,
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
  const shipStatus = query.shipStatus
  const payStatus = query.payStatus

  const request = await localSales(page, search, shipStatus, payStatus)

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

Ventas.post('/order/paid/:id', async (req, res) => {
  const { id } = req.params
  const { date, amountReceived } = req.body

  const request = await markOrderAsPaid(id, date, Number(amountReceived))

  if (request.status !== 200) {
    return res

      .status(request.status ?? 500)
      .json({ message: request.message, error: request.error })
  } else {
    return res
      .status(request.status)
      .json({ message: request.message, orders: request.order })
  }
})

Ventas.get('/get-orders', async (req, res) => {
  const { query } = req

  const page = parsePage(query.page)
  const salesChannel = query.sales
  const search = query.search

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

Ventas.put('/:id/editar-productos', async (req, res) => {
  const { id } = req.params
  const { body } = req
  const { products, paymentId } = body

  const request = await updateProductsFromOrder(id, products, paymentId)

  if (request.status !== 200) {
    return res
      .status(request.status ?? 500)
      .json({ message: request.message, error: request.error })
  } else {
    return res.status(request.status).json({ request })
  }
})

Ventas.put('/:id/editar-pago', async (req, res) => {
  const { id } = req.params
  const { body } = req
  const { tipoPago, cuentaDestino, orderId } = body

  const request = await updatePaymentFromOrder(
    id,
    tipoPago,
    cuentaDestino,
    orderId
  )

  if (request.status !== 200) {
    return res
      .status(request.status ?? 500)
      .json({ message: request.message, error: request.error })
  } else {
    return res.status(request.status).json({ request })
  }
})

Ventas.put('/:orderId/varios-pagos', async (req, res) => {
  const { orderId } = req.params
  const { body } = req
  const { payments } = body

  const request = await setManyPayments(orderId, payments)

  if (request.status !== 200) {
    return res
      .status(request.status ?? 500)
      .json({ message: request.message, error: request.error })
  } else {
    return res.status(request.status).json({ request })
  }
})

Ventas.post('/order/delivered/:id', async (req, res) => {
  const { id } = req.params
  const { body } = req
  const { date } = body

  const request = await markOrderAsDelivered(id, date)

  if (request.status !== 200) {
    return res

      .status(request.status ?? 500)
      .json({ message: request.message, error: request.error })
  } else {
    return res
      .status(request.status)
      .json({ message: request.message, orders: request.order })
  }
})

Ventas.all('/', (req, res) => {
  res.status(405).json({ message: 'Method not allowed' })
})

export default Ventas
