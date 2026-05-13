import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getPosts } from '../services/postService'
import { newOutledCohort12026PdfUrl } from '../data/localBlogPosts'
import Reveal from '../components/Reveal'
import { GridSkeleton } from '../components/Skeletons'
import ErrorState from '../components/ErrorState'
import usePageMeta from '../hooks/usePageMeta'

export default function BlogPage() {
  usePageMeta({
    title: 'Blog',
    description: 'Read latest guides, updates, and stories from Prinstine Academy.',
  })

  const [posts, setPosts] = useState([])
  const [query, setQuery] = useState('')
  const [activeSlide, setActiveSlide] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [touchStartX, setTouchStartX] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getPosts()
        if (active) setPosts(data)
      } catch (e) {
        if (active) setError(e?.response?.data?.error?.message || 'Failed to load blog posts')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const filteredPosts = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return posts
    return posts.filter((post) =>
      `${post.title || ''} ${post.excerpt || ''} ${post.meta?.caption || ''} ${
        post.content?.replace(/<[^>]+>/g, '') || ''
      }`
        .toLowerCase()
        .includes(term)
    )
  }, [posts, query])

  useEffect(() => {
    if (!filteredPosts.length) return undefined
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => {
        const next = { ...prev }
        for (const post of filteredPosts) {
          const count = Array.isArray(post.slides) ? post.slides.length : 0
          if (count > 1) {
            const current = next[post.id] || 0
            next[post.id] = (current + 1) % count
          }
        }
        return next
      })
    }, 3000)
    return () => window.clearInterval(timer)
  }, [filteredPosts])

  function moveSlide(postId, direction, count) {
    if (!count) return
    setActiveSlide((prev) => {
      const current = prev[postId] || 0
      const nextValue = (current + direction + count) % count
      return { ...prev, [postId]: nextValue }
    })
  }

  function onTouchStart(event) {
    setTouchStartX(event.touches?.[0]?.clientX ?? null)
  }

  function onTouchEnd(event, postId, count) {
    if (touchStartX == null || !count) return
    const endX = event.changedTouches?.[0]?.clientX ?? touchStartX
    const delta = endX - touchStartX
    if (Math.abs(delta) < 35) return
    moveSlide(postId, delta < 0 ? 1 : -1, count)
    setTouchStartX(null)
  }

  function onSliderKeyDown(event, postId, count) {
    if (count <= 1) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveSlide(postId, -1, count)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveSlide(postId, 1, count)
    }
  }

  if (loading) return <GridSkeleton count={4} />
  if (error) {
    return (
      <ErrorState
        title="Blog unavailable"
        message={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 lg:space-y-10"
    >
      <div className="rounded-3xl bg-gradient-to-r from-[#0a2fce] to-[#2148df] p-6 md:p-8 lg:p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Latest Articles and News</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-blue-100 md:text-base">
          Highlights from academy events, awards, and student milestones.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-wide text-blue-100">
          <span className="rounded-full border border-white/25 px-3 py-1">
            {posts.length} Published
          </span>
          <span className="rounded-full border border-white/25 px-3 py-1">
            Event Highlights
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-blue-200/20 bg-white/5 shadow-lg shadow-slate-950/20">
        <div className="border-b border-white/10 p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Public document</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">
            New Outled Cohort 1 (2026) — Information sheet
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-blue-100">
            View the official PDF below, open it in a new tab for fullscreen reading, or download it for offline use.
            Event photos for this cohort are also on the{' '}
            <Link to="/gallery" className="font-semibold text-amber-300 underline-offset-2 hover:underline">
              Gallery
            </Link>{' '}
            and in the matching{' '}
            <Link
              to="/blog/new-outled-cohort-1-2026"
              className="font-semibold text-amber-300 underline-offset-2 hover:underline"
            >
              blog article
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={newOutledCohort12026PdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open PDF in new tab
            </a>
            <a
              href={newOutledCohort12026PdfUrl}
              download="Prinstine-Academy-New-Outled-Cohort-1-2026.pdf"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
            >
              Download PDF
            </a>
          </div>
        </div>
        <iframe
          title="New Outled Cohort 1 (2026) information sheet (PDF)"
          src={newOutledCohort12026PdfUrl}
          className="min-h-[min(65vh,680px)] w-full bg-slate-900/40"
        />
      </div>

      <div className="rounded-2xl border border-blue-200/20 bg-white/5 p-4 md:p-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts by title or caption"
          className="w-full"
          aria-label="Search blog articles"
        />
      </div>
      {filteredPosts.length === 0 ? (
        <p className="text-blue-100">No articles published yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.map((post, idx) => (
            <Reveal
              key={post.id}
              delay={0.04 * (idx % 8)}
              interactive
              className="glass-card p-5 md:p-6 transition duration-300 hover:border-amber-300/50"
            >
              {Array.isArray(post.slides) && post.slides.length ? (
                <div
                  className="relative mb-4 overflow-hidden rounded-xl border border-white/10"
                  tabIndex={0}
                  role="region"
                  aria-label={`${post.title} image slider`}
                  onKeyDown={(event) => onSliderKeyDown(event, post.id, post.slides.length)}
                >
                  <img
                    src={post.slides[activeSlide[post.id] || 0]}
                    alt={`${post.title} slide ${(activeSlide[post.id] || 0) + 1}`}
                    className="aspect-[4/3] w-full bg-slate-900/35 object-contain object-center"
                    loading="lazy"
                    decoding="async"
                    onTouchStart={onTouchStart}
                    onTouchEnd={(event) => onTouchEnd(event, post.id, post.slides.length)}
                  />
                  {post.slides.length > 1 ? (
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/35 px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => moveSlide(post.id, -1, post.slides.length)}
                        className="rounded-md bg-white/20 px-2 py-1 text-xs text-white transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                        aria-label={`Previous ${post.title} slide`}
                      >
                        Prev
                      </button>
                      <p className="text-xs font-medium text-blue-100" aria-live="polite">
                        {post.meta?.caption || post.title} ({(activeSlide[post.id] || 0) + 1}/
                        {post.slides.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => moveSlide(post.id, 1, post.slides.length)}
                        className="rounded-md bg-white/20 px-2 py-1 text-xs text-white transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                        aria-label={`Next ${post.title} slide`}
                      >
                        Next
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {Array.isArray(post.slides) && post.slides.length > 1 ? (
                <div className="mb-4 flex items-center gap-1.5">
                  {post.slides.map((_, index) => (
                    <button
                      key={`${post.id}-dot-${index}`}
                      type="button"
                      onClick={() => setActiveSlide((prev) => ({ ...prev, [post.id]: index }))}
                      className={[
                        'h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300',
                        (activeSlide[post.id] || 0) === index
                          ? 'w-5 bg-amber-300'
                          : 'w-2.5 bg-white/35 hover:bg-white/60',
                      ].join(' ')}
                      aria-label={`Go to slide ${index + 1} of ${post.title}`}
                    />
                  ))}
                </div>
              ) : null}
              <Link
                to={`/blog/${post.id}`}
                className="text-lg font-semibold text-white hover:text-amber-300"
              >
                {post.title}
              </Link>
              <p className="mt-2 line-clamp-3 text-sm text-blue-100">
                {post.excerpt ||
                  post.content?.replace(/<[^>]+>/g, '').slice(0, 170) ||
                  'Read the latest article from Prinstine Academy.'}
              </p>
              <Link
                to={`/blog/${post.id}`}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-300 transition hover:text-amber-200"
              >
                Read article <span aria-hidden="true">{'->'}</span>
              </Link>
              <p className="mt-3 text-xs uppercase tracking-wide text-amber-300">
                {post.meta?.caption || 'Prinstine Academy'}
              </p>
            </Reveal>
          ))}
        </ul>
      )}
    </motion.section>
  )
}
