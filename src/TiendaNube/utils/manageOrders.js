import { Prisma } from '@prisma/client'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import { prisma } from '../../../lib/prisma'

dotenv.config()

const { AUTH_TIENDANUBE } = process.env

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

export const createOrder = async (id) => {
  const data = await getOrder(id)
  // const { number } = data

  const order = await prisma.orders.create({
    data: {
      idEP: `TN-${data.number}`,
      estado: data.status,
      fechaCreada: data.created_at,
      canalVenta: 'Tienda Nube',
      nombre: data.customer.name,
      email: data.customer.email,
      telefono: data.customer.phone,
      externalId: data.id,
    },
  })
  // const order = await prisma.orders.create({
  //   data: {

  console.log(number)

  return { number, id }
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
