import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import usePageMeta from '../hooks/usePageMeta'
import { allAssets } from '../data/assetLibrary'
import { localCourses } from '../data/courseCatalog'

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function classifyAsset(fileName) {
  const n = normalize(fileName)
  if (n.includes('dinnernight')) return 'Dinner Night Program'
  if (n.includes('graduation')) return 'Graduation Program'
  if (n.includes('award')) return 'Entrepreneurship Prize'
  if (n.includes('whatsappimage') && n.includes('20260513')) return 'New Outled Cohort 1 (2026)'
  if (n.includes('whatsappimage')) return 'Campus Moments'
  return 'Campus Gallery'
}

function getMetaForAsset(fileName) {
  const category = classifyAsset(fileName)
  if (category === 'New Outled Cohort 1 (2026)') {
    return {
      category,
      caption: 'New Outled Cohort 1 — May 2026',
      location: 'Prinstine Academy',
      placement: 'Cohort highlights',
    }
  }
  if (category === 'Dinner Night Program') {
    return {
      category,
      caption: 'Dinner Night Program',
      location: 'Event Hall',
      placement: 'Blog Highlights',
    }
  }
  if (category === 'Graduation Program') {
    return {
      category,
      caption: 'Graduation Program',
      location: 'Graduation Stage',
      placement: 'Ceremony Highlights',
    }
  }
  if (category === 'Entrepreneurship Prize') {
    return {
      category,
      caption: 'Entrepreneurship Prize',
      location: 'Awards Section',
      placement: 'Recognition Highlights',
    }
  }
  return {
    category,
    caption: 'Campus Gallery',
    location: 'Prinstine Academy',
    placement: 'General Highlights',
  }
}

export default function GalleryPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  usePageMeta({
    title: 'Gallery',
    description:
      'Browse named event images and search by caption, category, location, or placement.',
  })

  const galleryItems = useMemo(
    () => {
      const courseNames = localCourses.map((course) => normalize(course.title))
      return allAssets
        .filter((asset) => {
          const lower = asset.fileName.toLowerCase()
          const n = normalize(asset.fileName)
          const isLogoOrIcon =
            n.includes('logo') || n.includes('hero') || n.includes('favicon') || n.includes('slide')
          const isCourseImage = courseNames.some((courseName) => n.includes(courseName))
          const isNamedPhoto =
            n.includes('dinnernight') ||
            n.includes('graduation') ||
            n.includes('award') ||
            n.includes('whatsappimage')
          return !isLogoOrIcon && !isCourseImage && !lower.endsWith('.pdf') && isNamedPhoto
        })
        .map((asset) => {
          const meta = getMetaForAsset(asset.fileName)
          return {
            ...asset,
            ...meta,
          }
        })
    },
    []
  )

  const categories = useMemo(
    () => ['All', ...new Set(galleryItems.map((item) => item.category))],
    [galleryItems]
  )

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return galleryItems
      .filter((item) => {
      const categoryOk = category === 'All' ? true : item.category === category
      const haystack = `${item.fileName} ${item.category} ${item.caption} ${item.location} ${item.placement}`.toLowerCase()
      const queryOk = term ? haystack.includes(term) : true
      return categoryOk && queryOk
      })
      .sort((a, b) => a.category.localeCompare(b.category) || a.fileName.localeCompare(b.fileName))
  }, [galleryItems, query, category])

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 lg:space-y-10"
    >
      <div className="rounded-3xl bg-gradient-to-r from-[#0a2fce] to-[#2148df] p-6 md:p-8 lg:p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Gallery
        </h1>
        <p className="mt-2 text-sm text-blue-100">
          Browse named gallery photos only. Search by categories, image names, locations, and captions.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          type="search"
          placeholder="Search by category, name, location, or caption"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-between text-xs text-blue-200">
        <p>{filtered.length} images found</p>
        {query || category !== 'All' ? (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setCategory('All')
            }}
            className="rounded-full border border-blue-200/30 px-3 py-1 transition hover:border-blue-200/50 hover:bg-white/10"
          >
            Reset filters
          </button>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => (
          <article
            key={item.fileName}
            className="glass-card group overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-amber-300/40"
          >
            <img
              src={item.url}
              alt={item.fileName}
              className="aspect-[4/3] w-full bg-slate-900/35 object-contain object-center transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
            <div className="p-3">
              <p className="text-xs uppercase tracking-wide text-blue-200">{item.category}</p>
              <p className="mt-1 text-xs text-blue-100">{item.caption}</p>
              <p className="text-[11px] text-blue-200/90">{item.location}</p>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length ? (
        <div className="rounded-2xl border border-blue-200/20 bg-white/5 p-5 text-sm text-blue-100">
          No images match your current search or category filter.
        </div>
      ) : null}
    </motion.section>
  )
}
