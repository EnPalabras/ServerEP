import express from 'express'

const MercadoLibre = express.Router()

MercadoLibre.get('/', async (req, res) => {
  return res.status(200).json({
    message: 'Data fetch',
  })
})

MercadoLibre.post('/', async (req, res) => {
  const { body } = req

  return res.status(200).json({ body })
})

MercadoLibre.all('/', (req, res) => {
  res.status(405).json({ message: 'Method not allowed' })
})

export default MercadoLibre
