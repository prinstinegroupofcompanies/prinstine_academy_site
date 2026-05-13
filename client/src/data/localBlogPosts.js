import newOutledCohort12026Pdf from '../assets/Prinstine Academy New Outled Cohort 1 2026 Final 1.pdf?url'
import { findAssetUrl, getAssetUrlsMatchingNormalizedParts } from './assetLibrary'

/** Public URL for the New Outled Cohort 1 (2026) information PDF (used on blog listing and articles). */
export const newOutledCohort12026PdfUrl = newOutledCohort12026Pdf

function slideSet(prefix, count) {
  return Array.from({ length: count }, (_, index) => {
    const key = `${prefix}-${index + 1}`
    return findAssetUrl(key)
  }).filter(Boolean)
}

const dinnerSlides = slideSet('Dinner-night', 10)
const graduationSlides = slideSet('Graduation', 10)
const awardSlides = [findAssetUrl('award-1')].filter(Boolean)
const newOutledCohort1Slides = getAssetUrlsMatchingNormalizedParts('whatsapp', '20260513')

export const localBlogPosts = [
  {
    id: 'new-outled-cohort-1-2026',
    title: 'New Outled Cohort 1 (2026)',
    excerpt:
      'Photos from the cohort and the official information sheet—view the PDF in your browser or download a copy.',
    image: newOutledCohort1Slides[0] || '',
    slides: newOutledCohort1Slides,
    pdfUrl: newOutledCohort12026PdfUrl,
    content: `
      <p>
        We are pleased to share highlights from <strong>New Outled Cohort 1 (2026)</strong> and the official academy
        information document for families and the public.
      </p>
      <p>
        Use the <strong>View document</strong> area on this page to read the PDF, or download it using the button
        provided if you prefer an offline copy.
      </p>
    `,
    meta: {
      category: 'Programs',
      caption: 'New Outled Cohort 1 (2026)',
      location: 'Prinstine Academy',
    },
  },
  {
    id: 'dinner-night-program',
    title: 'Dinner Night Program',
    excerpt:
      'A memorable community evening featuring networking, celebration, and shared moments.',
    image: dinnerSlides[0] || '',
    slides: dinnerSlides,
    content: `
      <p>
        Our Dinner Night Program brought students, faculty, and guests together for an inspiring evening
        of reflection, celebration, and meaningful connection.
      </p>
      <p>
        The program highlighted student milestones, encouraged community engagement, and reinforced
        Prinstine Academy's commitment to holistic development beyond the classroom.
      </p>
    `,
    meta: {
      category: 'Events',
      caption: 'Dinner Night Program',
      location: 'Prinstine Academy Campus',
    },
  },
  {
    id: 'entrepreneurship-prize',
    title: 'Entrepreneurship Prize',
    excerpt:
      'Recognizing innovative student ideas and practical business impact through prize awards.',
    image: awardSlides[0] || '',
    slides: awardSlides,
    content: `
      <p>
        The Entrepreneurship Prize celebrates creativity, strategic thinking, and business execution by
        spotlighting students who developed impactful ventures.
      </p>
      <p>
        Through this initiative, Prinstine Academy continues to promote innovation, enterprise, and
        leadership among emerging professionals.
      </p>
    `,
    meta: {
      category: 'Awards',
      caption: 'Entrepreneurship Prize',
      location: 'Prinstine Academy Campus',
    },
  },
  {
    id: 'graduation-program',
    title: 'Graduation Program',
    excerpt:
      'A proud celebration of student achievement, certification, and career readiness.',
    image: graduationSlides[0] || '',
    slides: graduationSlides,
    content: `
      <p>
        Our Graduation Program marks the successful completion of practical learning pathways and
        professional preparation at Prinstine Academy.
      </p>
      <p>
        Graduates are recognized for their discipline, growth, and readiness to contribute with
        confidence in their chosen industries.
      </p>
    `,
    meta: {
      category: 'Ceremony',
      caption: 'Graduation Program',
      location: 'Prinstine Academy Campus',
    },
  },
]

export function getLocalPostById(id) {
  return localBlogPosts.find((post) => String(post.id) === String(id)) || null
}
