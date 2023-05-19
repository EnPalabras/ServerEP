import express from 'express'
import { validateInfo, validateLogin } from '../../src/Middleware/ValidInfo.js'
import authorize from '../../src/Middleware/Authorize.js'
import jwtGenerator from '../../src/utils/jwtGenerator.js'
import bcrypt from 'bcrypt'
import { prisma } from '../../lib/prisma.js'

const Auth = express.Router()

Auth.post('/register', validateInfo, async (req, res) => {
  const { body } = req
  const { email, name, password } = body

  try {
    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    })

    if (user) {
      return res.status(401).json({
        message: 'User already exists',
      })
    }

    const salt = await bcrypt.genSalt(10)
    const bcryptPassword = await bcrypt.hash(password, salt)

    const newUser = await prisma.users.create({
      data: {
        email,
        name,
        password: bcryptPassword,
      },
    })

    const token = jwtGenerator({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    })

    return res.status(201).json({
      message: 'User created',
      token,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error',
      error,
    })
  }
})

Auth.post('/login', validateLogin, async (req, res) => {
  const { body } = req
  const { email, password } = body

  try {
    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
      })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({
        message: 'Invalid credentials',
      })
    }

    const token = jwtGenerator({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    return res.status(200).json({
      message: 'User logged',
      token,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: 'Error',
      error,
    })
  }
})

Auth.post('/verify', authorize, async (req, res) => {
  const { body, user } = req
  try {
    return res.status(200).json({
      message: 'User authorized',
      payload: user,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: 'Error',
      error,
    })
  }
})

export default Auth
