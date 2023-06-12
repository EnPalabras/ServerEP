import express from 'express'
import { createMayorista } from '../../src/Mayoristas/index.js'

const Mayoristas = express.Router()

Mayoristas.get('/', async (req, res) => {
  res.json({
    message: 'Ruta aún no implementada',
  })
})

Mayoristas.post('/', async (req, res) => {
  const { body } = req

  const response = await createMayorista(body)

  return res.status(response.status).json(response)
})

Mayoristas.all('/', (req, res) => {
  res.status(405).json({ message: 'Method not allowed' })
})

export default Mayoristas
