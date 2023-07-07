import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const { AUTH_TIENDANUBE } = process.env

const URL = 'https://api.tiendanube.com/v1/1705915/orders?per_page=200&page='

const headers = {
  'Content-Type': 'application/json',
  Authentication: AUTH_TIENDANUBE,
  'User-Agent': 'En Palabras (enpalabrass@gmail.com)',
}

export const getOrders = async () => {
  const agroupOrders = []

  for (let i = 1; i < 10; i++) {
    console.log(`Page: ${i}`)
    const response = await fetch(URL + i, {
      method: 'GET',
      headers,
    })
    const data = await response.json()

    if (data.length === 0) {
      break
    }
    const ids = []

    data.forEach((order) => {
      if (!ids.includes(order.id)) {
        ids.push(order.id)
        agroupOrders.push(order)
      }
    })

    ids.forEach(async (id) => {
      setTimeout(async () => {
        const response = await fetch(
          `https://serverep-production.up.railway.app/api/tienda-nube`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              event: 'order/created',
              id: id,
            }),
          }
        )

        const data = await response.json()

        console.log(data, id)
      }, 400)
    })
  }

  return { status: 200, ids, length: ids.length }
}
