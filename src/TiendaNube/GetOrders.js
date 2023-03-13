import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const { AUTH_TIENDANUBE } = process.env

const URL = 'https://api.tiendanube.com/v1/1705915/'

const headers = {
  'Content-Type': 'application/json',
  Authentication: AUTH_TIENDANUBE,
  'User-Agent': 'En Palabras (enpalabrass@gmail.com)',
}

export const getOrders = async () => {
  const response = await fetch(URL + 'orders', {
    method: 'GET',
    headers,
  })
  const data = await response.json()
  return data
}
