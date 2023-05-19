import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

function authorize(req, res, next) {
  const token = req.header('token')

  if (!token) {
    return res.status(403).json({
      message: 'Not authorized',
    })
  }

  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET)
    req.user = verify.user

    next()
  } catch (error) {
    return res.status(403).json({
      message: 'Token not valid',
      error: error,
    })
  }
}

export default authorize
