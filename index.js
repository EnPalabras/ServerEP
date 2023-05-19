import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import apiRoutes from './Api/index.js'

dotenv.config()

const app = express()

const PORT = process.env.PORT ?? 8000

// Una vez terminado, limitar el acceso a la API a solo el dominio de la aplicación
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', apiRoutes)

app.all('/', (req, res) => {
  res.status(400).json({
    message: 'All requests must been sent to the /api path',
    availableRoutes: ['/api/'],
    example: 'http://yourUrl/api/',
  })
})

app.listen(PORT, () => {
  console.log(`Server running port ${PORT}`)
})
