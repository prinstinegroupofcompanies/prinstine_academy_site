import { AppError } from '../lib/AppError.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { supabaseDataService } from '../lib/supabaseDataService.js'

/**
 * @param {Record<string, unknown>} row
 */
function certificateToDto(row) {
  return {
    student_name: String(row.student_name),
    course: row.course_title == null ? null : String(row.course_title),
    issue_date: row.issue_date == null ? null : row.issue_date,
    status: String(row.status),
  }
}

export const addCertificate = asyncHandler(async (req, res) => {
  const body =
    req.body && typeof req.body === 'object'
      ? /** @type {Record<string, unknown>} */ (req.body)
      : {}

  const studentName =
    typeof body.student_name === 'string'
      ? body.student_name.trim()
      : typeof body.studentName === 'string'
        ? body.studentName.trim()
        : ''
  const certificateId =
    typeof body.certificate_id === 'string'
      ? body.certificate_id.trim()
      : typeof body.certificateId === 'string'
        ? body.certificateId.trim()
        : ''

  const rawCourseId = body.course_id ?? body.courseId
  const courseId = Number.parseInt(String(rawCourseId ?? ''), 10)

  const statusRaw = body.status
  const status =
    typeof statusRaw === 'string' && statusRaw.trim()
      ? statusRaw.trim().toLowerCase()
      : 'issued'
  const allowedStatuses = new Set(['pending', 'issued', 'revoked'])

  if (!studentName) {
    throw new AppError('student_name is required', 400)
  }
  if (!certificateId) {
    throw new AppError('certificate_id is required', 400)
  }
  if (!Number.isFinite(courseId) || courseId < 1) {
    throw new AppError('course_id is required and must be a positive integer', 400)
  }
  if (!allowedStatuses.has(status)) {
    throw new AppError('status must be one of: pending, issued, revoked', 400)
  }

  const courseResult = await supabaseDataService.selectFrom('courses', { filters: { id: courseId } })
  if (!courseResult.ok || !courseResult.data?.[0]) {
    throw new AppError('Course not found', 400)
  }

  const { ok, data: created } = await supabaseDataService.insertInto('certificates', {
    student_name: studentName,
    course_id: courseId,
    certificate_id: certificateId,
    status,
  })
  if (!ok || !created) {
    throw new AppError('Could not create certificate', 500)
  }
  const full = await supabaseDataService.selectFrom('certificates', { filters: { id: created.id } })
  const course = full.data?.[0]
  res.status(201).json({ certificate: certificateToDto({ ...course, course_title: courseResult.data[0].title }) })
})

export const verifyCertificate = asyncHandler(async (req, res) => {
  const certificateId =
    typeof req.query.certificate_id === 'string'
      ? req.query.certificate_id.trim()
      : typeof req.query.certificateId === 'string'
        ? req.query.certificateId.trim()
        : ''
  const studentName =
    typeof req.query.student_name === 'string'
      ? req.query.student_name.trim()
      : typeof req.query.name === 'string'
        ? req.query.name.trim()
        : ''

  if (!certificateId && !studentName) {
    throw new AppError(
      'Provide certificate_id or student_name (or both) to verify',
      400
    )
  }

  const filters = {}
  if (certificateId) filters.certificate_id = certificateId
  if (studentName) filters.student_name = studentName
  const { ok, data } = await supabaseDataService.selectFrom('certificates', {
    filters,
    orderBy: 'issue_date',
  })
  if (!ok) {
    throw new AppError('Could not verify certificate', 500)
  }
  const rows = await Promise.all(
    (data || []).map(async (row) => {
      const courseResult = row.course_id
        ? (await supabaseDataService.selectFrom('courses', { filters: { id: row.course_id } })).data?.[0]
        : null
      return {
        ...row,
        course_title: courseResult?.title ?? null,
      }
    }),
  )
  res.json({
    certificates: rows.map((row) => certificateToDto(row)),
  })
})
