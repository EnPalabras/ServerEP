import { Prisma } from '@prisma/client'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import { prisma } from '../../../lib/prisma.js'
import { setDateML } from '../../utils/parseDates.js'

dotenv.config()

const { AUTH_MERCADOPAGO } = process.env

export const createOrder = async (id) => {
  return id
}

const getOrder = async (id) => {
  const URL = `https://api.mercadolibre.com/orders/${id}`
  const headers = {
    Authorization: AUTH_MERCADOPAGO,
  }

  const response = await fetch(URL, { headers })
  const orderData = await response.json()

  const URL_DNI = `https://api.mercadolibre.com/orders/${id}/billing_info`

  const responseDNI = await fetch(URL_DNI, { headers })
  const dniData = await responseDNI.json()

  return {
    orderData,
    dniData,
  }
}

const getShip = async (id) => {
  const URL = `https://api.mercadolibre.com/shipments/${id}`
  const headers = {
    Authorization: AUTH_MERCADOPAGO,
  }

  const response = await fetch(URL, { headers })
  const shipData = await response.json()

  return shipData
}

const orderStatus = {
  paid: 'Finalizada',
  cancelled: 'Cancelada',
}

const productos = {
  'Juego De Cartas Destapados, En Palabras': 'Destapados',
  'Juego De Mesa, Cartas Desconectados.': 'Desconectados',
  'Juego De Cartas Desconectados En Palabras': 'Desconectados',
  'Juego De Cartas Edición Año Nuevo En Palabras': 'Año Nuevo',
  'Combo Juegos De Cartas Desconectados + Destapados Enpalabras':
    'Combo Desconectados + Destapados',
  'Combo Juegos De Cartas Desconectados + Año Nuevo En Palabras':
    'Combo Desconectados + Año Nuevo',
  'Combo Juegos De Cartas Desconectados X 2': 'Combo Desconectados x 2',
  'Juego De Cartas Edición Año En Palabras': 'Año Nuevo',
}

const shipType = {
  fulfillment: 'Correo Meli',
  self_service: 'Flex',
}

const shipStock = {
  fulfillment: 'Deposito MELI',
  self_service: 'Juncal',
}

export const manageOrder = async (id) => {
  try {
    const { orderData, dniData } = await getOrder(id)

    let orderBody = {
      idEP: `ML-${orderData.shipping.id}`,
      estado: orderStatus[orderData.status],
      fechaCreada: setDateML(orderData.date_created),
      canalVenta: 'Mercado Libre',
      nombre: `${orderData.buyer.first_name} ${orderData.buyer.last_name}`,
      mail: null,
      DNI: dniData.billing_info.doc_number,
      telefono: null,
      externalId: `${orderData.shipping.id}`,
      packId: `${orderData.pack_id}` ?? null,
    }

    const shipData = await getShip(orderData.shipping.id)

    let productsOfOrder = []

    let paymentsOfOrder = []

    if (orderData.pack_id !== null) {
      const headers = {
        Authorization: AUTH_MERCADOPAGO,
      }
      const res = await fetch(
        `https://api.mercadolibre.com/shipments/${orderData.shipping.id}/items`,
        { headers }
      )
      const data = await res.json()
      data.forEach(async (item) => {
        const order_id = item.order_id

        const response = await fetch(
          `https://api.mercadolibre.com/orders/${order_id}`,
          { headers }
        )
        const order = await response.json()
        order.order_items.forEach(async (item) => {
          let productBody = {
            id: `${order.id}`,
            idEP: `ML-${orderData.shipping.id}`,
            producto: productos[item.item.title],
            cantidad: item.quantity,
            precioUnitario: item.unit_price,
            precioTotal: item.full_unit_price,
            moneda: item.currency_id,
          }

          productsOfOrder.push(productBody)
        })
        const responseMP = await fetch(
          `https://api.mercadopago.com/v1/payments/${order.payments[0].id}`,
          { headers }
        )
        const payment = await responseMP.json()

        let paymentBody = {
          id: `${payment.id}`,
          idEP: `ML-${orderData.shipping.id}`,
          estado: payment.status,
          tipoPago: 'Mercado Pago',
          cuentaDestino: 'Mercado Pago',
          fechaPago: setDateML(payment.date_approved),
          fechaLiquidacion: setDateML(payment.money_release_date),
          montoTotal: payment.transaction_details.total_paid_amount,
          montoRecibido: payment.transaction_details.net_received_amount,
          gatewayId: `${payment.id}`,
          cuotas: payment.installments,
        }

        console.log(paymentBody)

        paymentsOfOrder.push(paymentBody)
        console.log(paymentsOfOrder)
      })
    } else if (orderData.pack_id === null) {
      orderData.order_items.forEach((item) => {
        let productBody = {
          id: `${orderData.id}`,
          idEP: `ML-${orderData.shipping.id}`,
          producto: productos[item.item.title],
          cantidad: item.quantity,
          precioUnitario: item.unit_price,
          precioTotal: item.unit_price * item.quantity,
          moneda: item.currency_id,
        }

        productsOfOrder.push(productBody)
      })
      const headers = {
        Authorization: AUTH_MERCADOPAGO,
      }
      const responseMP = await fetch(
        `https://api.mercadopago.com/v1/payments/${orderData.payments[0].id}`,
        { headers }
      )
      const payment = await responseMP.json()

      let paymentBody = {
        id: `${payment.id}`,
        idEP: `ML-${orderData.shipping.id}`,
        estado: payment.status,
        tipoPago: 'Mercado Pago',
        cuentaDestino: 'Mercado Pago',
        fechaPago: setDateML(payment.date_approved),
        fechaLiquidacion: setDateML(payment.money_release_date),
        montoTotal: payment.transaction_details.total_paid_amount,
        montoRecibido: payment.transaction_details.net_received_amount,
        gatewayId: `${payment.id}`,
        cuotas: payment.installments,
      }

      console.log(paymentBody)

      paymentsOfOrder.push(paymentBody)
    }

    await prisma.orders.create({
      data: {
        ...orderBody,
      },
    })

    productsOfOrder.forEach(async (product) => {
      await prisma.products.create({
        data: {
          ...product,
        },
      })
    })

    paymentsOfOrder.forEach(async (payment) => {
      await prisma.payments.create({
        data: {
          ...payment,
        },
      })
    })

    let shipBody = {
      id: `${orderData.shipping.id}`,
      idEP: `ML-${orderData.shipping.id}`,
      estado: 'Pendiente',
      tipoEnvio: shipType[shipData.logistic_type] ?? null,
      nombreEnvio: shipData.logistic_type,
      costoEnvio: shipData.base_cost,
      pagoEnvio: 0,
      stockDesde: shipStock[shipData.logistic_type] ?? null,
      fechaEnvio: setDateML(shipData.status_history.date_shipped),
      fechaEntrega: setDateML(shipData.status_history.date_delivered),
      fechaRebotado: setDateML(shipData.status_history.date_not_delivered),
      codigoPostal: shipData.receiver_address.zip_code,
      ciudad: shipData.receiver_address.city.name,
      provincia: shipData.receiver_address.state.name,
      pais: shipData.receiver_address.country.name,
    }

    orderData.payments.forEach((payment) => {
      if (payment.status === 'approved') {
        let value = shipBody.pagoEnvio
        value += payment.shipping_cost
        shipBody = {
          ...shipBody,
          pagoEnvio: value,
        }
      }
    })

    await prisma.shipment.create({
      data: {
        ...shipBody,
      },
    })

    return { status: 200, message: 'Order register created' }
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
    const shipData = await getShip(id)

    await prisma.shipment.updateMany({
      where: {
        id: `${id}`,
        idEP: `ML-${id}`,
      },
      data: {
        estado: 'Probando',
        fechaEnvio: setDateML(shipData.status_history.date_shipped),
        fechaEntrega: setDateML(shipData.status_history.date_delivered),
        fechaRebotado: setDateML(shipData.status_history.date_not_delivered),
      },
    })

    return { status: 200, message: 'Order updated' }
  } catch (error) {
    console.log(error)
    return { status: 408, message: 'Error', error: error }
  }
}

export const cancelOrder = async (id) => {
  return { id: id }
}
