import express from 'express'
import {
  createMayorista,
  getMayoristas,
  getOneMayorista,
  updateMayorista,
  deleteMayorista,
} from '../../src/Mayoristas/index.js'

const Mayoristas = express.Router()

Mayoristas.get('/', async (req, res) => {
  const response = await getMayoristas()

  return res.status(response.status).json(response)
})

Mayoristas.post('/', async (req, res) => {
  const { body } = req

  const response = await createMayorista(body)

  return res.status(response.status).json(response)
})

Mayoristas.get('/:id', async (req, res) => {
  const { id } = req.params

  const response = await getOneMayorista(id)

  return res.status(response.status).json(response)
})

Mayoristas.put('/:id', async (req, res) => {
  const { id } = req.params
  const { body } = req

  const response = await updateMayorista(id, body)

  return res.status(response.status).json(response)
})

Mayoristas.delete('/:id', async (req, res) => {
  const { id } = req.params

  const response = await deleteMayorista(id)

  return res.status(response.status).json(response)
})

Mayoristas.all('/', (req, res) => {
  res.status(405).json({ message: 'Method not allowed' })
})

export default Mayoristas
