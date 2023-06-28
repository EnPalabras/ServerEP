import express from 'express'

const PayTN = express.Router()

PayTN.all('/', (req, res) => {
  res.status(404)
})

export default PayTN
