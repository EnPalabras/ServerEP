import express from 'express'
import TiendaNube from './TiendaNube/index.js'

const apiRoutes = express.Router()

apiRoutes.use('/tienda-nube', TiendaNube)

export default apiRoutes
