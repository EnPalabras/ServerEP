import express from 'express'

const PayTN = express.Router()

PayTN.all('/', (req, res) => {
  return res.sendStatus(404)
})

export default PayTN
