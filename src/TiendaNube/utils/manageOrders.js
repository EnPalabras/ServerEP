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

const productos = {
  'DESCONECTADOS - Juego de Cartas': 'Desconectados',
  'DESTAPADOS - Juego de Cartas': 'Destapados',
}

export const createOrder = async (id) => {
  try {
    const orderData = await getOrder(id)
    console.log(orderData.number)

    let orderBody = {
      idEP: `TN-${orderData.number}`,
      estado: orderData.status,
      fechaCreada: new Date(orderData.created_at),
      canalVenta: 'Tienda Nube',
      nombre: orderData.customer.name,
      mail: orderData.customer.email,
      DNI: orderData.customer.identification,
      telefono: orderData.customer.phone,
      externalId: `${orderData.id}`,
    }

    let paymentBody = {
      idEP: `TN-${orderData.number}`,
      estado: orderData.payment_status,
      tipoPago: gatewayTypes[orderData.gateway_name],
      cuentaDestino: paymentDestination[orderData.gateway_name],
      fechaPago: orderData.paid_at ? new Date(orderData.paid_at) : null,
      montoTotal: parseFloat(orderData.total),
      fechaLiquidacion: orderData.paid_at ? new Date(orderData.paid_at) : null,
      montoRecibido: parseFloat(orderData.total),
      cuotas: 1,
    }

    if (orderData.gateway_name === 'Mercado Pago') {
      const payData = await getPayment(orderData.gateway_id)

      paymentBody = {
        ...paymentBody,
        fechaLiquidacion: payData.money_release_date
          ? new Date(payData.money_release_date)
          : null,
        montoRecibido: payData.transaction_details.net_received_amount,
        cuotas: payData.installments,
      }
    }
    const order = await prisma.orders.create({
      data: {
        ...orderBody,
      },
    })

    const payment = await prisma.payments.create({
      data: {
        ...paymentBody,
      },
    })

    // Las siguientes líneas son para crear un array de productos y después cargar uno por uno en la base de datos
    let productsOfOrder = []

    orderData.products.forEach((product) => {
      let productBody = {
        idEP: `TN-${orderData.number}`,
        producto: productos[product.name],
        cantidad: parseInt(product.quantity),
        precioUnitario: parseFloat(product.price),
        precioTotal: this.precioUnitario * this.cantidad,
        moneda: orderData.currency,
      }

      productsOfOrder.push(productBody)
    })

    productsOfOrder.forEach(async (product) => {
      await prisma.products.create({
        data: {
          ...product,
        },
      })
    })

    // Las siguientes líneas son para crear un array de descuentos y después cargar uno por uno en la base de datos
    let discountTopics = []

    if (parseFloat(orderData.discount_coupon) > 0) {
      for (let i = 0; i < orderData.coupon.length; i++) {
        let discount = {
          idEP: `TN-${orderData.number}`,
          tipoDescuento: 'Cupon',
          codigoDescuento: orderData.coupon[i].code,
          montoDescuento: parseFloat(orderData.discount_coupon),
        }

        discountTopics.push(discount)
      }
    }

    if (parseFloat(orderData.discount_gateway) > 0) {
      let discount = {
        idEP: `TN-${orderData.number}`,
        tipoDescuento: 'Metodo de Pago',
        codigoDescuento: null,
        montoDescuento: parseFloat(orderData.discount_gateway),
      }

      discountTopics.push(discount)
    }

    if (parseFloat(orderData.promotional_discount.total_discount_amount) > 0) {
      let discount = {
        idEP: `TN-${orderData.number}`,
        tipoDescuento: 'Promocional',
        codigoDescuento: null,
        montoDescuento: parseFloat(
          orderData.promotional_discount.total_discount_amount
        ),
      }

      discountTopics.push(discount)
    }

    discountTopics.forEach(async (discount) => {
      await prisma.discounts.create({
        data: {
          ...discount,
        },
      })
    })

    return { message: 'Ok' }
  } catch (error) {
    return { message: 'Error' }
  }
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
