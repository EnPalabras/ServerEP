import dotenv from 'dotenv'
import fetch from 'node-fetch'
import { prisma } from '../../../lib/prisma.js'
import { setDateTN, setDateML } from '../../utils/parseDates.js'

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
  enpalabrasapi: 'Efectivo',
  'En Palabras Pagos': 'Efectivo',
}

const paymentDestination = {
  'Mercado Pago': 'Mercado Pago',
  'Transferencia (Válido para Argentina)': 'Mercado Pago',
  'Transferencia (Válido para Argentina) ': 'Mercado Pago',
  PayPal: 'PayPal',
  'Efectivo - Sólo en nuestro punto de retiro.': 'Efectivo',
  'Efectivo - Sólo en nuestro punto de retiro. ': 'Efectivo',
  enpalabrasapi: 'Efectivo',
  'En Palabras Pagos': 'Efectivo',
}

const productos = {
  'desconectados-juego-de-cartas': {
    nombre: 'Desconectados',
    categoria: 'Juegos',
    variante: 'Unica',
  },
  'destapados-juego-de-cartas': {
    nombre: 'Destapados',
    categoria: 'Juegos',
    variante: 'Unica',
  },
  anonuevo: {
    nombre: 'Año Nuevo',
    categoria: 'Juegos',
    variante: 'Unica',
  },
  'buzo-sueno-talle-1': {
    nombre: 'Buzo Un Sueño',
    categoria: 'Merch',
    variante: 'Talle 1',
  },
  'buzo-sueno-talle-2': {
    nombre: 'Buzo Un Sueño',
    categoria: 'Merch',
    variante: 'Talle 2',
  },
  'buzo-sueno-talle-3': {
    nombre: 'Buzo Un Sueño',
    categoria: 'Merch',
    variante: 'Talle 3',
  },
  'buzo-senal-talle-1': {
    nombre: 'Buzo Tu Señal',
    categoria: 'Merch',
    variante: 'Talle 1',
  },
  'buzo-senal-talle-2': {
    nombre: 'Buzo Tu Señal',
    categoria: 'Merch',
    variante: 'Talle 2',
  },
  'buzo-senal-talle-3': {
    nombre: 'Buzo Tu Señal',
    categoria: 'Merch',
    variante: 'Talle 3',
  },
  'remera-club-talle-1': {
    nombre: 'Remera Club',
    categoria: 'Merch',
    variante: 'Talle 1',
  },
  'remera-club-talle-2': {
    nombre: 'Remera Club',
    categoria: 'Merch',
    variante: 'Talle 2',
  },
  'remera-club-talle-3': {
    nombre: 'Remera Club',
    categoria: 'Merch',
    variante: 'Talle 3',
  },
  'remera-preguntame-talle-1': {
    nombre: 'Remera Preguntame',
    categoria: 'Merch',
    variante: 'Talle 1',
  },
  'remera-preguntame-talle-2': {
    nombre: 'Remera Preguntame',
    categoria: 'Merch',
    variante: 'Talle 2',
  },
  'remera-preguntame-talle-3': {
    nombre: 'Remera Preguntame',
    categoria: 'Merch',
    variante: 'Talle 3',
  },
  'remera-atenta-talle-1': {
    nombre: 'Remera Atenta',
    categoria: 'Merch',
    variante: 'Talle 1',
  },
  'remera-atenta-talle-2': {
    nombre: 'Remera Atenta',
    categoria: 'Merch',
    variante: 'Talle 2',
  },
  'remera-atenta-talle-3': {
    nombre: 'Remera Atenta',
    categoria: 'Merch',
    variante: 'Talle 3',
  },
  'tote-bag-talle-unico': {
    nombre: 'Tote Bag',
    categoria: 'Merch',
    variante: 'Unica',
  },
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
  'Envío CABA - 24hs - Comprando antes de las 12hs te llegará en el día. ':
    'Flete',
  'Envío CABA - 24hs - Comprando antes de las 12hs te llegará en el día.':
    'Flete',
  'Envío CABA - 24hs': 'Flete',
  table_6629488: 'Flete',
  'Envío CABA - 24hs - Comprando antes de las 12hs te llega en el día': 'Flete',
  'Envío CABA - 24hs - Comprando antes de las 12hs te llega en el día ':
    'Flete',
  'Punto de Retiro Recoleta': 'Recoleta',
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
  'Envío CABA - 24hs - Comprando antes de las 12hs te llegará en el día. ':
    'Calipsian Recoleta',
  'Envío CABA - 24hs - Comprando antes de las 12hs te llegará en el día.':
    'Calipsian Recoleta',
  'Envío CABA - 24hs': 'Calipsian Recoleta',
  'Envío CABA - 24hs - Comprando antes de las 12hs te llega en el día':
    'Calipsian Recoleta',
  'Envío CABA - 24hs - Comprando antes de las 12hs te llega en el día ':
    'Calipsian Recoleta',
  'Punto de Retiro Recoleta': 'Calipsian Recoleta',
}

const orderStatus = {
  open: 'Abierta',
  closed: 'Archivada',
  cancelled: 'Cancelada',
}

const paymentStatus = {
  pending: 'Pendiente',
  paid: 'Pagado',
  approved: 'Pagado',
}

const shipStatus = {
  unshipped: 'Pendiente',
  unpacked: 'Pendiente',
  unfulfilled: 'Pendiente',
  fulfilled: 'Entregado',
  shipped: 'Entregado',
}

const markPackedOrder = async (id) => {
  const URL = `https://api.tiendanube.com/v1/1705915/orders/${id}/pack`

  const headers = {
    'Content-Type': 'application/json',
    Authentication: AUTH_TIENDANUBE,
    'User-Agent': 'En Palabras (enpalabrass@gmail.com)',
  }

  await fetch(URL, {
    method: 'POST',
    headers,
  })
}

export const createOrder = async (id) => {
  try {
    const orderData = await getOrder(id)

    let orderBody = {
      idEP: `TN-${orderData.number}`,
      estado: orderStatus[orderData.status],
      fechaCreada: setDateTN(orderData.created_at),
      canalVenta: 'Tienda Nube',
      nombre: orderData.customer.name,
      mail: orderData.customer.email,
      DNI: orderData.contact_identification,
      telefono: orderData.customer.phone,
      montoTotal: parseFloat(orderData.total),
      externalId: `${orderData.id}`,
      cuponPago: orderData.coupon.length > 0 ? orderData.coupon[0].code : null,
    }

    let paymentBody = {
      idEP: `TN-${orderData.number}`,
      estado: paymentStatus[orderData.payment_status],
      tipoPago: gatewayTypes[orderData.gateway_name] ?? null,
      cuentaDestino: paymentDestination[orderData.gateway_name] ?? null,
      fechaPago: orderData.paid_at ? setDateTN(orderData.paid_at) : null,
      montoTotal: parseFloat(orderData.total),
      fechaLiquidacion: orderData.paid_at ? setDateTN(orderData.paid_at) : null,
      montoRecibido:
        orderData.payment_status === 'paid' ? parseFloat(orderData.total) : 0,
      gatewayId: orderData.gateway_id,
      cuotas: 1,
      moneda: orderData.currency,
    }

    let shipBody = {
      idEP: `TN-${orderData.number}`,
      estado: shipStatus[orderData.shipping_status] ?? 'Pendiente',
      tipoEnvio: shipType[orderData.shipping_option] ?? null,
      nombreEnvio: orderData.shipping_option_code,
      costoEnvio: null,
      pagoEnvio: parseFloat(orderData.shipping_cost_customer),
      stockDesde: shipStock[orderData.shipping_option] ?? null,
      fechaEnvio: orderData.shipped_at ? setDateTN(orderData.shipped_at) : null,
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
        id: orderData.gateway_id,
        fechaLiquidacion: payData.money_release_date
          ? setDateML(payData.money_release_date)
          : null,
        montoRecibido: payData.transaction_details.net_received_amount,
        cuotas: payData.installments,
      }
    }

    if (
      (orderData.shipping_option === 'Retiras en Punto de retiro Recoleta.' ||
        orderData.shipping_option === 'Retiras en Punto de retiro Recoleta') &&
      (orderData.gateway_name === 'Mercado Pago' ||
        orderData.gateway_name ===
          'Efectivo - Sólo en nuestro punto de retiro.')
    ) {
      await markPackedOrder(orderData.id)
    }

    await prisma.orders.create({
      data: {
        ...orderBody,
      },
    })

    await prisma.payments.create({
      data: {
        ...paymentBody,
      },
    })

    await prisma.shipment.create({
      data: {
        ...shipBody,
      },
    })

    // Las siguientes líneas son para crear un array de productos y después cargar uno por uno en la base de datos
    let productsOfOrder = []

    orderData.products.forEach((product) => {
      let productBody = {
        idEP: `TN-${orderData.number}`,
        producto: productos[product.sku].nombre,
        categoria: productos[product.sku].categoria,
        variante: productos[product.sku].variante,
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

    return { status: 201, message: 'Order register created' }
  } catch (error) {
    console.log(error)
    if (error.code === 'P2002') {
      return {
        status: 404,
        message: `Order with id ${id} already exists`,
        error: error,
      }
    }
    return { status: 408, message: 'Error', error: error }
  }
}

export const updateOrder = async (id) => {
  try {
    const orderData = await getOrder(id)

    if (
      (orderData.shipping_option === 'Retiras en Punto de retiro Recoleta.' ||
        orderData.shipping_option === 'Retiras en Punto de retiro Recoleta') &&
      (orderData.gateway_name === 'Transferencia (Válido para Argentina)' ||
        orderData.gateway_name === 'Transferencia') &&
      orderData.payment_status === 'paid'
    ) {
      await markPackedOrder(orderData.id)
    }

    await prisma.orders.update({
      where: {
        idEP: `TN-${orderData.number}`,
      },
      data: {
        estado: orderStatus[orderData.status],
      },
    })

    let fechaLiquidacion = orderData.paid_at
      ? setDateTN(orderData.paid_at)
      : null
    let montoRecibido =
      orderData.payment_status === 'paid' ? parseFloat(orderData.total) : 0

    if (orderData.gateway_name === 'Mercado Pago') {
      const payData = await getPayment(orderData.gateway_id)
      ;(fechaLiquidacion = payData.money_release_date
        ? setDateTN(payData.money_release_date)
        : null),
        (montoRecibido = payData.transaction_details.net_received_amount)
    }

    await prisma.payments.updateMany({
      where: {
        idEP: `TN-${orderData.number}`,
        // Saco la línea de abajo porque en TN cuando se actualiza el pago personalizado cambia el Gateway Name
        // tipoPago: gatewayTypes[orderData.gateway_name],
        estado: {
          not: 'Pagado',
        },
      },

      data: {
        estado: orderData.payment_status,
        fechaPago: orderData.paid_at ? setDateTN(orderData.paid_at) : null,
        fechaLiquidacion: fechaLiquidacion,
      },
    })

    await prisma.shipment.updateMany({
      where: {
        idEP: `TN-${orderData.number}`,
        tipoEnvio: shipType[orderData.shipping_option],
      },
      data: {
        estado: shipStatus[orderData.shipping_status] ?? 'Pendiente',
        fechaEnvio: orderData.shipped_at
          ? setDateTN(orderData.shipped_at)
          : null,
        fechaEntrega: null,
        fechaRebotado: null,
      },
    })

    return {
      status: 202,
      message: 'Order Updated Successfully',
    }
  } catch (error) {
    return {
      status: 408,
      message: 'Error Updating Order',
      error: error,
    }
  }
}

export const cancelOrder = async (id) => {
  try {
    const orderData = await getOrder(id)

    await prisma.orders.update({
      where: {
        idEP: `TN-${orderData.number}`,
      },
      data: {
        estado: paymentStatus[orderData.payment_status],
      },
    })

    let fechaLiquidacion = orderData.paid_at
      ? setDateTN(orderData.paid_at)
      : null
    let montoRecibido =
      orderData.payment_status === 'paid' ? parseFloat(orderData.total) : 0

    if (orderData.gateway_name === 'Mercado Pago') {
      const payData = await getPayment(orderData.gateway_id)
      ;(fechaLiquidacion = payData.money_release_date
        ? setDateTN(orderData.money_release_date)
        : null),
        (montoRecibido = payData.transaction_details.net_received_amount)
    }

    await prisma.payments.updateMany({
      where: {
        idEP: `TN-${orderData.number}`,
        tipoPago: gatewayTypes[orderData.gateway_name],
      },

      data: {
        estado: paymentStatus[orderData.payment_status],
        fechaPago: orderData.paid_at ? setDateTN(orderData.paid_at) : null,
        fechaLiquidacion: fechaLiquidacion,
        montoRecibido: montoRecibido,
      },
    })

    return {
      status: 202,
      message: 'Order Updated Successfully',
    }
  } catch (error) {
    return {
      status: 408,
      message: 'Error Updating Order',
      error: error,
    }
  }
}
