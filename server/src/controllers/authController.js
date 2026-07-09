import { AppError } from '../lib/AppError.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authenticateUser } from '../lib/supabaseBackend.js'

/**
 * @param {unknown} body
 * @returns {{ email: string, password: string }}
 */
function parseLoginBody(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Invalid JSON body', 400)
  }
  const b = /** @type {Record<string, unknown>} */ (body)
  const email = b.email
  const password = b.password
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new AppError('Email and password are required', 400)
  }
  if (!email.trim() || !password) {
    throw new AppError('Email and password are required', 400)
  }
  return { email: email.trim().toLowerCase(), password }
}

export const postLogin = asyncHandler(async (req, res) => {
  const { email, password } = parseLoginBody(req.body)
  try {
    const result = await authenticateUser(email, password)
    res.json({
      token: result.token,
      user: result.user,
    })
  } catch (error) {
    throw new AppError(
      error?.message || 'Invalid email or password',
      401,
    )
  }
})

export const getSession = asyncHandler(async (req, res) => {
  res.json({ user: req.user })
})
