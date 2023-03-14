import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const { AUTH_TIENDANUBE } = process.env

const getOrder = async ({ id }) => {
  const URL = `https://api.tiendanube.com/v1/1705915/orders/${id}`
  const headers = {
    'Content-Type': 'application/json',
    Authentication: AUTH_TIENDANUBE,
    'User-Agent': 'En Palabras',
  }

  const response = await fetch(URL, {
    method: 'GET',
    headers,
  })
  const data = await response.json()

  console.log(data)

  return data
}

export const createOrder = async ({ id }) => {
  const order = await getOrder({ id })
  const { number, id } = order
  console.log(number, id)

  return { number, id }
}

export const updateOrder = async ({ id }) => {
  const order = await getOrder({ id })
  const { number, id } = order
  console.log(number, id)

  return { number, id }
}

export const cancelOrder = async ({ id }) => {
  const order = await getOrder({ id })
  const { number, id } = order
  console.log(number, id)

  return { number, id }
}
