import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const jwtGenerator = (user) => {
  const payload = {
    user: user,
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '365d' })
}

export default jwtGenerator
