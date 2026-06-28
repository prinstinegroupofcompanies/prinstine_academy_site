/**
 * ORM-style helpers: parameterized queries via `query()` (works on PostgreSQL and SQLite).
 * Use `?` placeholders in all SQL; the connection layer maps them for Postgres.
 */
import {
  getDialect,
  query,
  parseJsonContent,
  serializeJsonForDb,
} from './connection.js'

/**
 * @typedef {'admin' | 'user' | 'instructor' | 'student'} UserRole
 */

export const User = {
  /**
   * @param {{ email: string, password: string, role: UserRole }} data
   */
  async create(data) {
    const { rows } = await query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?) RETURNING *',
      [data.email, data.password, data.role]
    )
    return rows[0] ?? null
  },

  async findById(id) {
    const { rows } = await query('SELECT * FROM users WHERE id = ?', [id])
    return rows[0] ?? null
  },

  async findByEmail(email) {
    const { rows } = await query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
      [email]
    )
    return rows[0] ?? null
  },

  async updatePasswordAndRole(id, passwordHash, role) {
    const { rows } = await query(
      'UPDATE users SET password = ?, role = ? WHERE id = ? RETURNING *',
      [passwordHash, role, id]
    )
    return rows[0] ?? null
  },

  async list() {
    const { rows } = await query('SELECT id, email, role FROM users ORDER BY id')
    return rows
  },
}

export const Category = {
  async create(data) {
    const { rows } = await query(
      'INSERT INTO categories (name) VALUES (?) RETURNING *',
      [data.name]
    )
    return rows[0] ?? null
  },

  async findById(id) {
    const { rows } = await query('SELECT * FROM categories WHERE id = ?', [id])
    return rows[0] ?? null
  },

  async findByName(name) {
    const { rows } = await query('SELECT * FROM categories WHERE name = ?', [name])
    return rows[0] ?? null
  },

  async list() {
    const { rows } = await query('SELECT * FROM categories ORDER BY name')
    return rows
  },
}

export const Course = {
  /**
   * @param {{ title: string, description?: string, image?: string, duration?: number, price: number, categoryId?: number | null }} data
   */
  async create(data) {
    const { rows } = await query(
      `INSERT INTO courses (title, description, image, duration, price, category_id)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
      [
        data.title,
        data.description ?? null,
        data.image ?? null,
        data.duration ?? null,
        data.price,
        data.categoryId ?? null,
      ]
    )
    return rows[0] ?? null
  },

  async findById(id) {
    const { rows } = await query('SELECT * FROM courses WHERE id = ?', [id])
    return rows[0] ?? null
  },

  /** Course row plus category name (LEFT JOIN). */
  async findWithCategory(id) {
    const { rows } = await query(
      `SELECT c.*, cat.name AS category_name
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE c.id = ?`,
      [id]
    )
    return rows[0] ?? null
  },

  async listByCategory(categoryId) {
    const { rows } = await query(
      'SELECT * FROM courses WHERE category_id = ? ORDER BY title',
      [categoryId]
    )
    return rows
  },

  /** All courses with `category_name` (LEFT JOIN). Optional `categoryId` filter. */
  async listWithCategory({ categoryId } = {}) {
    if (categoryId != null) {
      const { rows } = await query(
        `SELECT c.*, cat.name AS category_name
         FROM courses c
         LEFT JOIN categories cat ON c.category_id = cat.id
         WHERE c.category_id = ?
         ORDER BY c.title`,
        [categoryId]
      )
      return rows
    }
    const { rows } = await query(
      `SELECT c.*, cat.name AS category_name
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       ORDER BY c.title`
    )
    return rows
  },

  /**
   * @param {number} id
   * @param {{ title: string, description?: string | null, image?: string | null, duration?: number | null, price: number, categoryId?: number | null }} data
   */
  async update(id, data) {
    const { rows } = await query(
      `UPDATE courses
       SET title = ?, description = ?, image = ?, duration = ?, price = ?, category_id = ?
       WHERE id = ?
       RETURNING *`,
      [
        data.title,
        data.description ?? null,
        data.image ?? null,
        data.duration ?? null,
        data.price,
        data.categoryId ?? null,
        id,
      ]
    )
    return rows[0] ?? null
  },

  /**
   * @param {number} id
   * @returns {Promise<boolean>} True if a row was deleted
   */
  async deleteById(id) {
    const { rowCount } = await query('DELETE FROM courses WHERE id = ?', [id])
    return (rowCount ?? 0) > 0
  },
}

export const Post = {
  /**
   * @param {{ title: string, content?: string, image?: string, authorId: number }} data
   */
  async create(data) {
    const { rows } = await query(
      `INSERT INTO posts (title, content, image, author_id)
       VALUES (?, ?, ?, ?) RETURNING *`,
      [data.title, data.content ?? null, data.image ?? null, data.authorId]
    )
    return rows[0] ?? null
  },

  async findById(id) {
    const { rows } = await query('SELECT * FROM posts WHERE id = ?', [id])
    return rows[0] ?? null
  },

  async findWithAuthor(id) {
    const { rows } = await query(
      `SELECT p.id, p.title, p.content, p.image, p.author_id, u.email AS author_email, u.role AS author_role
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.id = ?`,
      [id]
    )
    return rows[0] ?? null
  },

  async listWithAuthor() {
    const { rows } = await query(
      `SELECT p.id, p.title, p.content, p.image, p.author_id, u.email AS author_email, u.role AS author_role
       FROM posts p
       JOIN users u ON p.author_id = u.id
       ORDER BY p.id DESC`
    )
    return rows
  },

  /**
   * @param {number} id
   * @param {{ title: string, content?: string | null, image?: string | null }} data
   */
  async update(id, data) {
    const { rows } = await query(
      `UPDATE posts
       SET title = ?, content = ?, image = ?
       WHERE id = ?
       RETURNING *`,
      [data.title, data.content ?? null, data.image ?? null, id]
    )
    return rows[0] ?? null
  },

  /**
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async deleteById(id) {
    const { rowCount } = await query('DELETE FROM posts WHERE id = ?', [id])
    return (rowCount ?? 0) > 0
  },
}

export const Certificate = {
  /**
   * @param {{ studentName: string, courseId: number, certificateId: string, status?: 'pending' | 'issued' | 'revoked' }} data
   */
  async create(data) {
    const { rows } = await query(
      `INSERT INTO certificates (student_name, course_id, certificate_id, status)
       VALUES (?, ?, ?, ?) RETURNING *`,
      [
        data.studentName,
        data.courseId,
        data.certificateId,
        data.status ?? 'pending',
      ]
    )
    return rows[0] ?? null
  },

  async findById(id) {
    const { rows } = await query('SELECT * FROM certificates WHERE id = ?', [id])
    return rows[0] ?? null
  },

  async findByCertificateId(certificateId) {
    const { rows } = await query(
      'SELECT * FROM certificates WHERE certificate_id = ?',
      [certificateId]
    )
    return rows[0] ?? null
  },

  async listByCourse(courseId) {
    const { rows } = await query(
      'SELECT * FROM certificates WHERE course_id = ? ORDER BY issue_date DESC',
      [courseId]
    )
    return rows
  },

  /**
   * Certificate row with related course title.
   * @param {number} id
   */
  async findWithCourseById(id) {
    const { rows } = await query(
      `SELECT cert.*, c.title AS course_title
       FROM certificates cert
       JOIN courses c ON cert.course_id = c.id
       WHERE cert.id = ?`,
      [id]
    )
    return rows[0] ?? null
  },

  /**
   * Verify by certificate id and/or student name (case-insensitive).
   * Returns latest issue first if multiple match.
   * @param {{ certificateId?: string, studentName?: string }} filters
   */
  async verify(filters) {
    const hasCert = Boolean(filters.certificateId)
    const hasName = Boolean(filters.studentName)
    if (!hasCert && !hasName) {
      return []
    }
    if (hasCert && hasName) {
      const { rows } = await query(
        `SELECT cert.*, c.title AS course_title
         FROM certificates cert
         JOIN courses c ON cert.course_id = c.id
         WHERE cert.certificate_id = ? AND LOWER(cert.student_name) = LOWER(?)
         ORDER BY cert.issue_date DESC`,
        [filters.certificateId, filters.studentName]
      )
      return rows
    }
    if (hasCert) {
      const { rows } = await query(
        `SELECT cert.*, c.title AS course_title
         FROM certificates cert
         JOIN courses c ON cert.course_id = c.id
         WHERE cert.certificate_id = ?
         ORDER BY cert.issue_date DESC`,
        [filters.certificateId]
      )
      return rows
    }
    const { rows } = await query(
      `SELECT cert.*, c.title AS course_title
       FROM certificates cert
       JOIN courses c ON cert.course_id = c.id
       WHERE LOWER(cert.student_name) = LOWER(?)
       ORDER BY cert.issue_date DESC`,
      [filters.studentName]
    )
    return rows
  },
}

export const SiteContent = {
  /**
   * @param {string} sectionName
   * @returns {Promise<{ id: number, section_name: string, content: Record<string, unknown> } | null>}
   */
  async getBySection(sectionName) {
    const { rows } = await query(
      'SELECT * FROM site_content WHERE section_name = ?',
      [sectionName]
    )
    const row = rows[0]
    if (!row) {
      return null
    }
    return {
      ...row,
      content: parseJsonContent(row.content),
    }
  },

  /**
   * Insert or replace JSON payload by `section_name`.
   * @param {string} sectionName
   * @param {Record<string, unknown>} content
   */
  async upsert(sectionName, content) {
    const json = serializeJsonForDb(content)
    if (getDialect() === 'postgres') {
      const { rows } = await query(
        `INSERT INTO site_content (section_name, content) VALUES (?, ?::jsonb)
         ON CONFLICT (section_name) DO UPDATE SET content = EXCLUDED.content
         RETURNING *`,
        [sectionName, json]
      )
      const row = rows[0]
      if (!row) {
        return null
      }
      return { ...row, content: parseJsonContent(row.content) }
    }
    const { rows } = await query(
      `INSERT INTO site_content (section_name, content) VALUES (?, ?)
       ON CONFLICT (section_name) DO UPDATE SET content = excluded.content
       RETURNING *`,
      [sectionName, json]
    )
    const row = rows[0]
    if (!row) {
      return null
    }
    return { ...row, content: parseJsonContent(row.content) }
  },
}

let subscriberTableReady = false
let registrationTableReady = false

async function ensureSubscriberTable() {
  if (subscriberTableReady) return
  if (getDialect() === 'postgres') {
    await query(
      `CREATE TABLE IF NOT EXISTS subscribers (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`
    )
    await query(
      'CREATE UNIQUE INDEX IF NOT EXISTS uq_subscribers_email ON subscribers (LOWER(email))'
    )
  } else {
    await query(
      `CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    )
    await query(
      'CREATE UNIQUE INDEX IF NOT EXISTS uq_subscribers_email ON subscribers (email)'
    )
  }
  subscriberTableReady = true
}

async function ensureRegistrationTable() {
  if (registrationTableReady) return
  if (getDialect() === 'postgres') {
    await query(
      `CREATE TABLE IF NOT EXISTS registrations (
        id BIGSERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(64) NOT NULL,
        course_id VARCHAR(255) NOT NULL,
        course_title VARCHAR(255) NOT NULL,
        learning_mode VARCHAR(32) NOT NULL DEFAULT 'in-person',
        highest_education VARCHAR(255),
        address TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`
    )
    await query(
      'CREATE INDEX IF NOT EXISTS idx_registrations_course_title ON registrations (course_title)'
    )
    await query(
      'CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations (created_at)'
    )
  } else {
    await query(
      `CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        course_id TEXT NOT NULL,
        course_title TEXT NOT NULL,
        learning_mode TEXT NOT NULL DEFAULT 'in-person',
        highest_education TEXT,
        address TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    )
    await query(
      'CREATE INDEX IF NOT EXISTS idx_registrations_course_title ON registrations (course_title)'
    )
    await query(
      'CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations (created_at)'
    )
  }
  registrationTableReady = true
}

export const Subscriber = {
  /**
   * @param {{ name: string, email: string }} data
   */
  async create(data) {
    await ensureSubscriberTable()
    const { rows } = await query(
      `INSERT INTO subscribers (name, email)
       VALUES (?, ?) RETURNING *`,
      [data.name, data.email]
    )
    return rows[0] ?? null
  },

  async list() {
    await ensureSubscriberTable()
    const { rows } = await query(
      'SELECT id, name, email, created_at FROM subscribers ORDER BY id DESC'
    )
    return rows
  },

  async count() {
    await ensureSubscriberTable()
    const { rows } = await query('SELECT COUNT(*) AS total FROM subscribers')
    const total = rows[0]?.total
    return Number(total ?? 0)
  },
}

export const Registration = {
  /**
   * @param {{
   * fullName: string,
   * email: string,
   * phone: string,
   * courseId: string,
   * courseTitle: string,
   * learningMode?: string,
   * highestEducation?: string | null,
   * address?: string | null,
   * notes?: string | null,
   * }} data
   */
  async create(data) {
    await ensureRegistrationTable()
    const { rows } = await query(
      `INSERT INTO registrations
       (full_name, email, phone, course_id, course_title, learning_mode, highest_education, address, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      [
        data.fullName,
        data.email,
        data.phone,
        data.courseId,
        data.courseTitle,
        data.learningMode ?? 'in-person',
        data.highestEducation ?? null,
        data.address ?? null,
        data.notes ?? null,
      ]
    )
    return rows[0] ?? null
  },

  async list() {
    await ensureRegistrationTable()
    const { rows } = await query(
      `SELECT
        id,
        full_name,
        email,
        phone,
        course_id,
        course_title,
        learning_mode,
        highest_education,
        address,
        notes,
        created_at
      FROM registrations
      ORDER BY id DESC`
    )
    return rows
  },
}
