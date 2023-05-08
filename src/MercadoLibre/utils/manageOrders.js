import { Prisma } from '@prisma/client'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import { prisma } from '../../../lib/prisma.js'

dotenv.config()

const { AUTH_MERCADOPAGO } = process.env

export const createOrder = async (id) => {
  return id
}

export const updateOrder = async (id) => {
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

export const manageOrder = async (id) => {
  console.log(`id : ${id}`)
  try {
    const { orderData, dniData } = await getOrder(id)

    console.log(
      new Date(orderData.created_at).toLocaleString({
        timeZone: 'America/Argentina/Buenos_Aires',
      })
    )

    let orderBody = {
      idEP: `ML-${orderData.shipping.id}`,
      estado: orderStatus[orderData.status],
      fechaCreada: new Date(orderData.created_at).toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
      }),
      canalVenta: 'Mercado Libre',
      nombre: `${orderData.buyer.first_name} ${orderData.buyer.last_name}`,
      mail: null,
      DNI: dniData.billing_info.doc_number,
      telefono: null,
      externalId: `${orderData.shipping.id}`,
    }

    let productsOfOrder = []

    if (orderData.pack_id) {
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
        order.order_items.forEach((item) => {
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
      })
    } else if (!orderData.pack_id) {
      orderData.order_items.forEach((item) => {
        let productBody = {
          id: `${orderData.id}`,
          idEP: `ML-${orderData.shipping.id}`,
          producto: productos[item.item.title],
          cantidad: item.quantity,
          precioUnitario: item.unit_price,
          precioTotal: item.full_unit_price,
          moneda: item.currency_id,
        }

        productsOfOrder.push(productBody)
      })
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

export const cancelOrder = async (id) => {
  return { id: id }
}
