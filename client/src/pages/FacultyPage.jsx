import { motion } from 'framer-motion'
import Reveal from '../components/Reveal'
import usePageMeta from '../hooks/usePageMeta'

const FACULTY = [
  { name: 'Mr. Prince S Cooper', role: 'Chief Executive Officer', qualifications: 'Bsc, MBA, MA, PGDE, DIP-RE' },
  { name: 'Bishop Dr Jackson G Weah', role: 'Head of Academic Affairs', qualifications: 'Academic leadership and institutional management' },
  { name: 'Ms. Frances B Wallace', role: 'Coordinator-Prinstine Academy', qualifications: 'B.Sc., Certificates' },
  { name: 'Mrs. Ernestine L.V Cooper', qualifications: 'MBA' },
  { name: 'Mr. James S Tokpa', qualifications: 'B.Sc., MBA Candidate' },
  { name: 'Mr. Joseph M Kollie, Jr', qualifications: 'B.Sc.,  LLB Candidate' },
  { name: 'Dr. Mory Sumaworo', qualifications: 'PhD' },
  { name: 'Mr. Amos Sawboh', qualifications: 'MBA' },
  { name: 'Mr. William L Buku', qualifications: 'B.Sc., MBA Candidate' },
  { name: 'Ms. Yassah Robertson', qualifications: 'M.Sc.' },
  { name: 'Mr. Hassan Loseni Lassana Kenneh', qualifications: 'MBA' },
  { name: 'Mr. Derek Perkins', qualifications: 'MBA' },
  { name: 'Mr. Alvis T. Flomo', qualifications: 'MBA' },
  { name: 'Mr. Darric Dennis', qualifications: 'MBA' },
  { name: 'Mr. Cyrus D Reeves', qualifications: 'B.Sc., MBA Candidate' },
  { name: 'Mr. Jallah Corvah', qualifications: 'CA, MBA' },
  { name: 'Mr. Nuitah T. Womgboh', qualifications: 'M.Sc.' },
  { name: 'Mr Alfred Morris', qualifications: 'Solar Engineer' },
  { name: 'Mr Edmond K Benicks', qualifications: 'B.Sc., MBA Candidate, DIP-Tech' },
  { name: 'Mr Samson Bryant', qualifications: 'DIP-ICT, Full-Stack Developer, Data Engineer' },
  { name: 'Mr Adebayo Akinloye', qualifications: 'Assc.CIPD' },
  { name: 'Mrs. Yolaine Kate Waka Metzger', qualifications: 'MPH' },
  { name: 'Mr. Leonard Metzger', qualifications: 'M.Sc- Information Technology' },
  { name: 'Booker T. Harris', qualifications: 'CPA' },
  { name: 'Joy Odell Nagbe', qualifications: 'MSc' },
  { name: 'Precious Joy. Teeweh', qualifications: 'BSc, MA candidate' },
  { name: 'Mr. Obediah Koon', qualifications: 'MBA' },
  { name: 'Mr. Edward K. Zebe', qualifications: 'MSc' },
  { name: 'Ms. Jamesetta L. Sieh', qualifications: 'Bsc, Msc Cand' },
  { name: 'Mr. Bethel Anthony', qualifications: 'Bsc, Dip Crt-Marketing' },
  { name: 'Nya Parwon', qualifications: 'MSc, PgDip, BSc, BSPE' },
]

export default function FacultyPage() {
  usePageMeta({
    title: 'Faculty',
    description: 'Meet the faculty and academic leadership at Prinstine Academy.',
  })

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 lg:space-y-10"
    >
      <div className="rounded-3xl bg-gradient-to-r from-[#0a2fce] to-[#2148df] p-6 md:p-8 lg:p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Faculty
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-blue-100 md:text-base">
          Our faculty combines academic depth, industry expertise, and practical teaching methods
          to deliver high-impact learning outcomes across all programs.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <StatCard label="Faculty members" value={String(FACULTY.length)} />
          <StatCard label="Coverage" value="Multi-disciplinary" />
          <StatCard label="Delivery" value="Practical + Academic" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {FACULTY.map((item, idx) => (
          <Reveal
            key={item.name}
            delay={0.03 * (idx % 8)}
            interactive
            className="glass-card h-full border border-blue-200/20 p-5 transition duration-300 hover:-translate-y-1 hover:border-amber-300/50 md:p-6"
          >
            <p className="inline-flex rounded-full bg-blue-900/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100">
              Faculty
            </p>
            <h2 className="mt-3 text-lg font-semibold leading-snug text-white">{item.name}</h2>
            {item.role ? (
              <p className="mt-1 text-sm font-medium text-amber-300">{item.role}</p>
            ) : null}
            <p className="mt-3 text-sm leading-relaxed text-blue-100">
              <span className="font-semibold text-white">Qualifications:</span> {item.qualifications}
            </p>
          </Reveal>
        ))}
      </div>
    </motion.section>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-blue-200/25 bg-white/10 p-3">
      <p className="text-xs uppercase tracking-wide text-blue-100">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  )
}
