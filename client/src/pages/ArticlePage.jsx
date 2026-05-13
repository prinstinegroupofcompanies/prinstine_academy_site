import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getPostById } from '../services/postService'
import { PageSkeleton } from '../components/Skeletons'
import ErrorState from '../components/ErrorState'
import usePageMeta from '../hooks/usePageMeta'
import useStructuredData from '../hooks/useStructuredData'

export default function ArticlePage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [slideIndex, setSlideIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  usePageMeta({
    title: post?.title || 'Article',
    description:
      post?.content?.replace(/<[^>]+>/g, '').slice(0, 150) ||
      'Read detailed articles and updates from Prinstine Academy.',
    image: post?.image || '/favicon.svg',
  })
  useStructuredData(
    post
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          image: post.image ? [post.image] : undefined,
          articleBody: post.content?.replace(/<[^>]+>/g, '').slice(0, 500),
          author: {
            '@type': 'Organization',
            name: 'Prinstine Academy',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Prinstine Academy',
          },
          mainEntityOfPage: window.location.href,
        }
      : null
  )

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getPostById(id)
        if (active) setPost(data)
      } catch (e) {
        if (active) setError(e?.response?.data?.error?.message || 'Failed to load article')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    setSlideIndex(0)
  }, [post?.id])

  useEffect(() => {
    const count = Array.isArray(post?.slides) ? post.slides.length : 0
    if (count <= 1) return undefined
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % count)
    }, 3200)
    return () => window.clearInterval(timer)
  }, [post?.slides])

  function moveSlide(direction) {
    const count = Array.isArray(post?.slides) ? post.slides.length : 0
    if (!count) return
    setSlideIndex((prev) => (prev + direction + count) % count)
  }

  function onTouchStart(event) {
    setTouchStartX(event.touches?.[0]?.clientX ?? null)
  }

  function onTouchEnd(event) {
    const count = Array.isArray(post?.slides) ? post.slides.length : 0
    if (touchStartX == null || count <= 1) return
    const endX = event.changedTouches?.[0]?.clientX ?? touchStartX
    const delta = endX - touchStartX
    if (Math.abs(delta) < 35) return
    moveSlide(delta < 0 ? 1 : -1)
    setTouchStartX(null)
  }

  function onSliderKeyDown(event) {
    const count = Array.isArray(post?.slides) ? post.slides.length : 0
    if (count <= 1) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveSlide(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveSlide(1)
    }
  }

  if (loading) return <PageSkeleton />
  if (error) return <ErrorState title="Article unavailable" message={error} />
  if (!post) return <ErrorState title="Article not found" message="This article does not exist." />

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 lg:space-y-10"
    >
      <div className="rounded-3xl bg-gradient-to-r from-[#0a2fce] to-[#2148df] p-6 md:p-8 lg:p-10">
        <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100">
          Article
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">{post.title}</h1>
        <p className="mt-2 text-sm text-blue-100">Insights and practical perspectives from Prinstine Academy.</p>
      </div>
      <article className="glass-card space-y-5 p-6 md:p-8">
        {Array.isArray(post.slides) && post.slides.length ? (
          <div className="space-y-2">
            <div
              className="relative overflow-hidden rounded-xl border border-white/15"
              tabIndex={0}
              role="region"
              aria-label={`${post.title} image slider`}
              onKeyDown={onSliderKeyDown}
            >
              <img
                src={post.slides[slideIndex]}
                alt={`${post.title} slide ${slideIndex + 1}`}
                loading="lazy"
                decoding="async"
                className="aspect-[16/9] w-full bg-slate-900/35 object-contain object-center"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              />
              {post.slides.length > 1 ? (
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/35 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => moveSlide(-1)}
                    className="rounded-md bg-white/20 px-2 py-1 text-xs text-white transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                    aria-label="Previous slide"
                  >
                    Prev
                  </button>
                  <p className="text-xs font-medium text-blue-100" aria-live="polite">
                    {post.meta?.caption || post.title} ({slideIndex + 1}/{post.slides.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => moveSlide(1)}
                    className="rounded-md bg-white/20 px-2 py-1 text-xs text-white transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                    aria-label="Next slide"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
            <p className="text-xs uppercase tracking-wide text-amber-300">
              {post.meta?.category || 'Academy Update'} - {post.meta?.location || 'Prinstine Academy'}
            </p>
            {post.slides.length > 1 ? (
              <div className="flex items-center gap-1.5">
                {post.slides.map((_, index) => (
                  <button
                    key={`article-slide-${index}`}
                    type="button"
                    onClick={() => setSlideIndex(index)}
                    className={[
                      'h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300',
                      slideIndex === index
                        ? 'w-6 bg-amber-300'
                        : 'w-3 bg-white/35 hover:bg-white/60',
                    ].join(' ')}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : post.image ? (
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="aspect-[16/9] w-full rounded-xl bg-slate-900/35 object-contain object-center"
          />
        ) : null}
        {post.pdfUrl ? (
          <div className="space-y-4 rounded-xl border border-white/15 bg-slate-950/30 p-4 md:p-5">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">
                View document (PDF)
              </h2>
              <p className="mt-1 text-sm text-blue-100">
                Read the official sheet below in your browser, open it in a new tab, or download a copy.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={post.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Open in new tab
                </a>
                <a
                  href={post.pdfUrl}
                  download="Prinstine-Academy-New-Outled-Cohort-1-2026.pdf"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
                >
                  Download PDF
                </a>
              </div>
            </div>
            <iframe
              title={`${post.title} — PDF preview`}
              src={post.pdfUrl}
              className="min-h-[min(70vh,720px)] w-full rounded-lg border border-white/10 bg-slate-900/40"
            />
          </div>
        ) : null}
        <div
          className="prose prose-invert max-w-none prose-headings:text-white prose-strong:text-amber-300 prose-p:text-blue-100"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />
      </article>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Back to articles
        </Link>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
        >
          Explore courses <span aria-hidden="true">{'->'}</span>
        </Link>
      </div>
    </motion.section>
  )
}
