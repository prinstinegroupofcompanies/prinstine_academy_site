import { AppError } from '../lib/AppError.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { createRegistration as createSupabaseRegistration, listRegistrations as listSupabaseRegistrations } from '../lib/supabaseBackend.js'

function asString(value) {
  return String(value ?? '').trim()
}

function parseRegistrationBody(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Invalid JSON body', 400)
  }
  const b = /** @type {Record<string, unknown>} */ (body)
  const fullName = asString(b.fullName)
  const email = asString(b.email).toLowerCase()
  const phone = asString(b.phone)
  const courseId = asString(b.courseId)
  const courseTitle = asString(b.courseTitle)
  const learningMode = asString(b.learningMode || 'in-person').toLowerCase()
  const highestEducation = asString(b.highestEducation) || null
  const address = asString(b.address) || null
  const notes = asString(b.notes) || null

  if (!fullName || !email || !phone || !courseId || !courseTitle) {
    throw new AppError(
      'Full name, email, phone, and selected course are required',
      400
    )
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailOk) throw new AppError('Provide a valid email address', 400)

  return {
    fullName,
    email,
    phone,
    courseId,
    courseTitle,
    learningMode:
      learningMode === 'online' || learningMode === 'hybrid'
        ? learningMode
        : 'in-person',
    highestEducation,
    address,
    notes,
  }
}

export const createRegistration = asyncHandler(async (req, res) => {
  const payload = parseRegistrationBody(req.body)
  const created = await createSupabaseRegistration(payload)
  res.status(201).json({
    message: 'Registration submitted successfully',
    registration: created,
  })
})

export const listRegistrations = asyncHandler(async (_req, res) => {
  const rows = await listSupabaseRegistrations()
  const countsByCourse = rows.reduce((acc, item) => {
    const key = String(item.course_title || 'Unspecified Course')
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, /** @type {Record<string, number>} */ ({}))

  const stats = Object.entries(countsByCourse)
    .map(([courseTitle, count]) => ({ courseTitle, count }))
    .sort((a, b) => b.count - a.count)

  res.json({
    registrations: rows,
    stats,
  })
})
