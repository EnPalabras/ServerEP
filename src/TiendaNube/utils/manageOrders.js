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
  'Transferencia (Válido para Argentina) ': 'Transferencia',
  PayPal: 'PayPal',
  'Efectivo - Sólo en nuestro punto de retiro. ': 'Efectivo',
  'Efectivo - Sólo en nuestro punto de retiro.': 'Efectivo',
}

const paymentDestination = {
  'Mercado Pago': 'Mercado Pago',
  'Transferencia (Válido para Argentina)': 'Mercado Pago',
  'Transferencia (Válido para Argentina) ': 'Transferencia',
  PayPal: 'PayPal',
  'Efectivo - Sólo en nuestro punto de retiro.': 'Efectivo Katy',
  'Efectivo - Sólo en nuestro punto de retiro. ': 'Efectivo Katy',
}

const productos = {
  'DESCONECTADOS - Juego de Cartas': 'Desconectados',
  'DESTAPADOS - Juego de Cartas': 'Destapados',
  'AÑO NUEVO - Juego de Cartas': 'Año Nuevo',
}

const shipType = {
  'Retiras en Punto de retiro Recoleta': 'Recoleta',
  'Retiras en Punto de retiro Recoleta.': 'Recoleta',
  'Retiras en Punto de retiro Recoleta. ': 'Recoleta',
  'Envío a domicilio Estándar - shipnow': 'Ship Now',
  'Envío a domicilio Estándar - shipnow ': 'Ship Now',
  DHL: 'DHL',
  'Punto de retiro': 'Envío Pack',
  'Punto de Retiro': 'Envío Pack',
  'Envío a Domicilio Estándar': 'Envío Pack',
  'Envío a Domicilio Express': 'Envío Pack',
}

const shipStock = {
  'Retiras en Punto de retiro Recoleta': 'Juncal',
  'Retiras en Punto de retiro Recoleta.': 'Juncal',
  'Retiras en Punto de retiro Recoleta. ': 'Juncal',
  'Envío a domicilio Estándar - shipnow': 'Deposito SN',
  'Envío a domicilio Estándar - shipnow ': 'Deposito SN',
  DHL: 'Juncal',
  'Punto de retiro': 'Deposito EPack',
  'Punto de Retiro': 'Deposito EPack',
  'Envío a Domicilio Estándar': 'Deposito EPack',
  'Envío a Domicilio Express': 'Deposito EPack',
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

    let shipBody = {
      idEP: `TN-${orderData.number}`,
      estado: 'Pendiente',
      tipoEnvio: shipType[orderData.shipping_option],
      nombreEnvio: orderData.shipping_option_code,
      costoEnvio: null,
      pagoEnvio: parseFloat(orderData.shipping_cost_customer),
      stockDesde: shipStock[orderData.shipping_option],
      fechaEnvio: orderData.shipped_at ? new Date(orderData.shipped_at) : null,
      fechaEntrega: null,
      fechaRebotado: null,
      codigoPostal: orderData.shipping_address.zipcode
        ? orderData.shipping_address.zipcode
        : null,
      ciudad: orderData.shipping_address.city
        ? orderData.shipping_address.city
        : null,
      provincia: orderData.shipping_address.province
        ? orderData.shipping_address.province
        : null,
      pais: orderData.shipping_address.country
        ? orderData.shipping_address.country
        : null,
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

    const ship = await prisma.shipment.create({
      data: {
        ...shipBody,
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
        precioTotal: parseInt(product.quantity) * parseFloat(product.price),
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
    console.log(error)
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
