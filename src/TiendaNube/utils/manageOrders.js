import { Prisma } from '@prisma/client'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import { prisma } from '../../../lib/prisma.js'

dotenv.config()

const { AUTH_TIENDANUBE, AUTH_MERCADOPAGO } = process.env

const getOrder = async (id) => {
  const URL = `https://api.tiendanube.com/v1/1705915/orders/${id}`
  const headers = {
    'Content-Type': 'application/json',
    Authentication: AUTH_TIENDANUBE,
    'User-Agent': 'En Palabras (enpalabrass@gmail.com)',
  }

  const response = await fetch(URL, {
    method: 'GET',
    headers,
  })
  const data = await response.json()

  return data
}

const getPayment = async (id) => {
  const URL = `https://api.mercadopago.com/v1/payments/${id}`
  const headers = {
    'Content-Type': 'application/json',
    Authorization: AUTH_MERCADOPAGO,
  }

  const response = await fetch(URL, {
    method: 'GET',
    headers,
  })
  const data = await response.json()

  return data
}

const gatewayTypes = {
  'Mercado Pago': 'Mercado Pago',
  'Transferencia (Válido para Argentina)': 'Transferencia',
  PayPal: 'PayPal',
  'Efectivo - Sólo en nuestro punto de retiro.': 'Efectivo',
}

const paymentDestination = {
  'Mercado Pago': 'Mercado Pago',
  'Transferencia (Válido para Argentina)': 'Mercado Pago',
  PayPal: 'PayPal',
  'Efectivo - Sólo en nuestro punto de retiro.': 'Efectivo Katy',
}

export const createOrder = async (id) => {
  const orderData = await getOrder(id)
  console.log(orderData.number)

  const order = await prisma.orders.create({
    data: {
      idEP: `TN-${orderData.number}`,
      estado: orderData.status,
      fechaCreada: new Date(orderData.created_at),
      canalVenta: 'Tienda Nube',
      nombre: orderData.customer.name,
      mail: orderData.customer.email,
      telefono: orderData.customer.phone,
      externalId: `${orderData.id}`,
    },
  })

  let paymentBody = {
    idEP: `TN-${orderData.number}`,
    estado: orderData.payment_status,
    tipoPago: gatewayTypes[orderData.gateway],
    cuentaDestino: paymentDestination[orderData.gateway],
    fechaPago: new Date(orderData.paid_at),
    montoTotal: new Prisma.Decimal(orderData.total),
  }

  if (orderData.gateway === 'Mercado Pago') {
    const payData = await getPayment(orderData.gateway_id)

    paymentBody = {
      ...paymentBody,
      fechaLiquidacion: new Date(payData.money_release_date),
      montoRecibido: payData.transaction_details.net_received_amount,
      cuotas: payData.installments,
    }
  } else if (orderData.gateway !== 'Mercado Pago') {
    paymentBody = {
      ...paymentBody,
      fechaLiquidacion: new Date(orderData.paid_at),
      montoRecibido: new Prisma.Decimal(orderData.total),
      cuotas: 1,
    }
  }
  const payment = await prisma.payments.create({
    data: {
      ...paymentBody,
    },
  })

  return { number: orderData.number, id }
}

export const updateOrder = async (id) => {
  const order = await getOrder(id)
  const { number } = order
  console.log(number)

  return { number, id }
}

export const cancelOrder = async (id) => {
  const order = await getOrder(id)
  const { number } = order
  console.log(number)

  return { number }
}
