import express from 'express'
import MercadoLibre from './MercadoLibre/index.js'
import TiendaNube from './TiendaNube/index.js'

const apiRoutes = express.Router()

apiRoutes.use('/tienda-nube', TiendaNube)
apiRoutes.use('/mercado-libre', MercadoLibre)

export default apiRoutes
