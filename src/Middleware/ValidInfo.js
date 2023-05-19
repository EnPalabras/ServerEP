let validEmails = ['agusiglesias72@gmail.com', 'enpalabrass@gmail.com']

export function validateInfo(req, res, next) {
  const { body } = req
  const { email, name, password } = body

  if (!validEmails.includes(email)) {
    return res.status(401).json({
      message: 'Email not allowed',
    })
  }

  if (!email || !name || !password) {
    return res.status(400).json({
      message: 'Missing required fields',
      requiredFields: ['email', 'name', 'password'],
    })
  }

  if (
    typeof email !== 'string' ||
    typeof name !== 'string' ||
    typeof password !== 'string'
  ) {
    return res.status(400).json({
      message: 'Invalid field type',
      requiredFields: ['email', 'name', 'password'],
      invalidFields: ['email', 'name', 'password'],
    })
  }

  if (email.length < 6 || email.length > 254) {
    return res.status(400).json({
      message: 'Invalid email length',
      requiredFields: ['email', 'name', 'password'],
      invalidFields: ['email'],
    })
  }

  next()
}

export function validateLogin(req, res, next) {
  const { body } = req
  const { email, password } = body

  if (!validEmails.includes(email)) {
    return res.status(401).json({
      message: 'Email not allowed',
    })
  }

  if (!email || !password) {
    return res.status(400).json({
      message: 'Missing required fields',
      requiredFields: ['email', 'password'],
    })
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      message: 'Invalid field type',
      requiredFields: ['email', 'password'],
      invalidFields: ['email', 'password'],
    })
  }

  if (email.length < 6 || email.length > 254) {
    return res.status(400).json({
      message: 'Invalid email length',
      requiredFields: ['email', 'password'],
      invalidFields: ['email'],
    })
  }

  next()
}
