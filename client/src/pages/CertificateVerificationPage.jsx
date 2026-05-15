import { motion } from 'framer-motion'
import usePageMeta from '../hooks/usePageMeta'

export default function CertificateVerificationPage() {
  const verificationUrl = 'https://www.prinstinemanagementsystem.org'

  usePageMeta({
    title: 'Student Portal',
    description:
      'Access the student portal to verify Prinstine Academy certificates through the official Prinstine Management System.',
  })

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 lg:space-y-10"
    >
      <div className="rounded-3xl bg-gradient-to-r from-[#0a2fce] to-[#2148df] p-6 md:p-8 lg:p-10">
        <h1 className="text-3xl font-semibold text-white md:text-4xl">
          Student Portal
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-blue-100 md:text-base">
          Use the official student portal to verify certificates and confirm learner records.
        </p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-blue-200/20 bg-white/5 p-5 md:p-6">
        <p className="text-sm leading-relaxed text-blue-100">
        Click below to log into your student portal and to verify your certificate after graduation.
        </p>
        <a
          href={verificationUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-primary mt-4 inline-flex items-center gap-2"
        >
          Open Student Portal
          <span aria-hidden="true">{'->'}</span>
        </a>
      </div>
    </motion.section>
  )
}
