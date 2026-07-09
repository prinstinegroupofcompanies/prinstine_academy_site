import { AppError } from '../lib/AppError.js'
import { removeUploadedAsset, uploadImageFile } from '../lib/mediaStorage.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { supabaseDataService } from '../lib/supabaseDataService.js'

const defaultSectionContent = {
  hero: {
    title: '',
    subtitle: '',
    cta: { label: '', href: '' },
    media: { image: '' },
  },
  about: {
    title: '',
    body: '',
    highlights: [],
  },
  footer: {
    text: '',
    links: [],
    social: [],
  },
  navbar: {
    brand: '',
    links: [],
    cta: null,
  },
  'homepage-blocks': {
    blocks: [],
  },
}

/**
 * Keep section names flexible for future CMS use, while rejecting obvious invalid values.
 * @param {string} raw
 */
function normalizeSection(raw) {
  const s = String(raw ?? '').trim().toLowerCase().replace(/\s+/g, '-')
  if (!s) {
    throw new AppError('section is required', 400)
  }
  if (!/^[a-z0-9][a-z0-9-_]{0,99}$/.test(s)) {
    throw new AppError(
      'Invalid section name. Use letters, numbers, hyphen, underscore',
      400
    )
  }
  return s
}

/**
 * @param {unknown} value
 */
function ensureJsonObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AppError('content must be a JSON object', 400)
  }
  return /** @type {Record<string, unknown>} */ (value)
}

export const getSectionContent = asyncHandler(async (req, res) => {
  const section = normalizeSection(req.params.section)
  const { ok, data } = await supabaseDataService.selectFrom('site_content', { filters: { section_name: section } })
  const row = ok ? data?.[0] : null
  if (!row) {
    const fallback = defaultSectionContent[section] ?? {}
    return res.json({
      section,
      content: fallback,
      exists: false,
    })
  }
  return res.json({
    section,
    content: row.content,
    exists: true,
  })
})

export const putSectionContent = asyncHandler(async (req, res) => {
  const section = normalizeSection(req.params.section)
  const body =
    req.body && typeof req.body === 'object'
      ? /** @type {Record<string, unknown>} */ (req.body)
      : null
  if (!body) {
    throw new AppError('Invalid JSON body', 400)
  }
  // Accept either `{ ...content }` directly or `{ content: { ... } }`
  const contentSource = body.content !== undefined ? body.content : body
  const content = ensureJsonObject(contentSource)

  const { ok, data: saved } = await supabaseDataService.upsertInto('site_content', {
    section_name: section,
    content,
  }, 'section_name')
  if (!ok || !saved) {
    throw new AppError('Could not save content', 500)
  }
  return res.json({
    section,
    content: saved.content ?? content,
    exists: true,
  })
})

export const putSectionImage = asyncHandler(async (req, res) => {
  const section = normalizeSection(req.params.section)
  if (!req.file) {
    throw new AppError('image file is required', 400)
  }
  const existingResult = await supabaseDataService.selectFrom('site_content', { filters: { section_name: section } })
  const existing = existingResult.data?.[0]
  const current = existing?.content ?? {}
  const oldImage =
    current &&
    typeof current.media === 'object' &&
    current.media &&
    typeof current.media.image === 'string'
      ? current.media.image
      : null

  const uploaded = await uploadImageFile(req.file, { folder: `content/${section}` })
  if (oldImage) {
    await removeUploadedAsset(oldImage)
  }
  const merged = {
    ...current,
    media: {
      ...(current.media && typeof current.media === 'object' ? current.media : {}),
      image: uploaded.url,
    },
  }
  const { ok, data: saved } = await supabaseDataService.upsertInto('site_content', {
    section_name: section,
    content: merged,
  }, 'section_name')
  if (!ok || !saved) {
    throw new AppError('Could not save content', 500)
  }
  return res.json({
    section,
    content: saved.content ?? merged,
    exists: true,
  })
})
