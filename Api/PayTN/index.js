import express from 'express'

const PayTN = express.Router()

PayTN.all('/', (req, res) => {
  return res.status(404)
})

export default PayTN
