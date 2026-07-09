import { AppError } from '../lib/AppError.js'
import { removeUploadedAsset, uploadImageFile } from '../lib/mediaStorage.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { supabaseDataService } from '../lib/supabaseDataService.js'

/**
 * @param {Record<string, unknown>} row
 */
function courseToDto(row) {
  if (!row) {
    return null
  }
  const categoryId = row.category_id
  return {
    id: Number(row.id),
    title: String(row.title),
    description:
      row.description == null || row.description === ''
        ? null
        : String(row.description),
    image: row.image == null || row.image === '' ? null : String(row.image),
    duration:
      row.duration == null || row.duration === ''
        ? null
        : Number(row.duration),
    price: Number(row.price),
    category:
      categoryId != null
        ? {
            id: Number(categoryId),
            name:
              row.category_name != null
                ? String(row.category_name)
                : null,
          }
        : null,
  }
}

/**
 * @param {unknown} v
 * @param {number | null} [fallback]
 */
function parseOptionalInt(v, fallback = null) {
  if (v === undefined || v === null || v === '') {
    return fallback
  }
  const n = Number.parseInt(String(v), 10)
  return Number.isFinite(n) ? n : fallback
}

/**
 * @param {unknown} v
 * @param {number} fallback
 */
function parsePrice(v, fallback) {
  if (v === undefined || v === null || v === '') {
    return fallback
  }
  const n = Number.parseFloat(String(v))
  if (!Number.isFinite(n) || n < 0) {
    return NaN
  }
  return n
}

/**
 * @param {unknown} v
 * @returns {number | null}
 */
function parseCategoryIdOrNull(v) {
  if (v === undefined || v === null || v === '') {
    return null
  }
  const n = Number.parseInt(String(v), 10)
  if (!Number.isFinite(n) || n < 1) {
    return NaN
  }
  return n
}

async function requireCategoryIfSet(categoryId) {
  if (categoryId == null) {
    return
  }
  const { ok, data } = await supabaseDataService.selectFrom('categories', {
    filters: { id: categoryId },
  })
  if (!ok || !data?.[0]) {
    throw new AppError('Category not found', 400)
  }
}

export const listCourses = asyncHandler(async (req, res) => {
  const q = req.query.category_id
  let filter = null
  if (q != null && String(q) !== '') {
    const n = Number.parseInt(String(q), 10)
    if (!Number.isFinite(n) || n < 1) {
      throw new AppError('Invalid category_id', 400)
    }
    filter = n
  }
  const { ok, data } = await supabaseDataService.selectFrom('courses', {
    orderBy: 'title',
    filters: filter == null ? {} : { category_id: filter },
  })
  if (!ok) {
    throw new AppError('Could not load courses', 500)
  }
  const courses = await Promise.all(
    (data || []).map(async (row) => {
      const categoryRow = row.category_id
        ? (await supabaseDataService.selectFrom('categories', { filters: { id: row.category_id } })).data?.[0]
        : null
      return courseToDto({
        ...row,
        category_name: categoryRow?.name ?? null,
      })
    }),
  )
  res.json({ courses })
})

export const getCourse = asyncHandler(async (req, res) => {
  const id = Number.parseInt(req.params.id, 10)
  if (!Number.isFinite(id) || id < 1) {
    throw new AppError('Invalid id', 400)
  }
  const { ok, data } = await supabaseDataService.selectFrom('courses', {
    filters: { id },
  })
  if (!ok || !data?.[0]) {
    throw new AppError('Course not found', 404)
  }
  const categoryRow = data[0].category_id
    ? (await supabaseDataService.selectFrom('categories', { filters: { id: data[0].category_id } })).data?.[0]
    : null
  res.json({ course: courseToDto({ ...data[0], category_name: categoryRow?.name ?? null }) })
})

/**
 * @param {import('express').Request} req
 * @param {boolean} isCreate
 */
function readBody(req, isCreate) {
  const b = req.body && typeof req.body === 'object' ? /** @type {Record<string, unknown>} */ (req.body) : {}
  const titleRaw = b.title
  const title = typeof titleRaw === 'string' ? titleRaw.trim() : String(titleRaw ?? '').trim()
  if (isCreate) {
    if (!title) {
      throw new AppError('title is required', 400)
    }
  }
  return {
    title,
    hasTitle: b.title !== undefined,
    description: b.description,
    duration: b.duration,
    price: b.price,
    category_id: b.category_id ?? b.categoryId,
  }
}

export const createCourse = asyncHandler(async (req, res) => {
  const b = readBody(req, true)
  const price = parsePrice(b.price, 0)
  if (Number.isNaN(price)) {
    throw new AppError('Invalid price', 400)
  }
  const categoryId = parseCategoryIdOrNull(b.category_id)
  if (Number.isNaN(categoryId)) {
    throw new AppError('Invalid category_id', 400)
  }
  await requireCategoryIfSet(categoryId)
  const imagePath = req.file
    ? (await uploadImageFile(req.file, { folder: 'courses' })).url
    : null
  const description =
    b.description == null || b.description === ''
      ? null
      : String(b.description)
  const duration = parseOptionalInt(b.duration, null)
  const { ok, data: row } = await supabaseDataService.insertInto('courses', {
    title: b.title,
    description,
    image: imagePath,
    duration: duration == null ? null : duration,
    price,
    category_id: categoryId,
  })
  if (!ok || !row) {
    throw new AppError('Could not create course', 500)
  }
  const categoryRow = row.category_id
    ? (await supabaseDataService.selectFrom('categories', { filters: { id: row.category_id } })).data?.[0]
    : null
  res.status(201).json({ course: courseToDto({ ...row, category_name: categoryRow?.name ?? null }) })
})

export const updateCourse = asyncHandler(async (req, res) => {
  const id = Number.parseInt(req.params.id, 10)
  if (!Number.isFinite(id) || id < 1) {
    throw new AppError('Invalid id', 400)
  }
  const existingResult = await supabaseDataService.selectFrom('courses', { filters: { id } })
  const existing = existingResult.data?.[0]
  if (!existing) {
    throw new AppError('Course not found', 404)
  }
  const b = readBody(req, false)
  let title = String(existing.title)
  if (b.hasTitle) {
    if (!b.title) {
      throw new AppError('title cannot be empty', 400)
    }
    title = b.title
  }
  let description =
    existing.description == null
      ? null
      : String(existing.description)
  if (b.description !== undefined) {
    description =
      b.description === null || b.description === ''
        ? null
        : String(b.description)
  }
  let duration =
    existing.duration == null
      ? null
      : Number(existing.duration)
  if (b.duration !== undefined) {
    if (b.duration === null || b.duration === '') {
      duration = null
    } else {
      const d = parseOptionalInt(b.duration, null)
      duration = d == null ? null : d
    }
  }
  let price = Number(existing.price)
  if (b.price !== undefined) {
    const p = parsePrice(b.price, price)
    if (Number.isNaN(p)) {
      throw new AppError('Invalid price', 400)
    }
    price = p
  }
  let categoryId =
    existing.category_id == null
      ? null
      : Number(existing.category_id)
  if (b.category_id !== undefined) {
    const c = parseCategoryIdOrNull(b.category_id)
    if (Number.isNaN(c)) {
      throw new AppError('Invalid category_id', 400)
    }
    categoryId = c
  }
  await requireCategoryIfSet(categoryId)
  let image =
    existing.image == null || existing.image === ''
      ? null
      : String(existing.image)
  if (req.file) {
    if (image) {
      await removeUploadedAsset(image)
    }
    image = (await uploadImageFile(req.file, { folder: 'courses' })).url
  } else {
    const strip =
      req.body &&
      (req.body.remove_image === 'true' || req.body.removeImage === 'true')
    if (strip) {
      await removeUploadedAsset(image)
      image = null
    }
  }
  const { ok } = await supabaseDataService.updateById('courses', id, {
    title,
    description,
    image,
    duration: duration == null ? null : Number(duration),
    price,
    category_id: categoryId ?? null,
  })
  if (!ok) {
    throw new AppError('Could not update course', 500)
  }
  const updatedData = (await supabaseDataService.selectFrom('courses', { filters: { id } })).data?.[0]
  const categoryRow = updatedData?.category_id
    ? (await supabaseDataService.selectFrom('categories', { filters: { id: updatedData.category_id } })).data?.[0]
    : null
  res.json({ course: courseToDto({ ...updatedData, category_name: categoryRow?.name ?? null }) })
})

export const deleteCourse = asyncHandler(async (req, res) => {
  const id = Number.parseInt(req.params.id, 10)
  if (!Number.isFinite(id) || id < 1) {
    throw new AppError('Invalid id', 400)
  }
  const existingResult = await supabaseDataService.selectFrom('courses', { filters: { id } })
  const existing = existingResult.data?.[0]
  if (!existing) {
    throw new AppError('Course not found', 404)
  }
  if (existing.image) {
    await removeUploadedAsset(String(existing.image))
  }
  const { ok } = await supabaseDataService.deleteById('courses', id)
  if (!ok) {
    throw new AppError('Could not delete course', 500)
  }
  res.status(204).send()
})
