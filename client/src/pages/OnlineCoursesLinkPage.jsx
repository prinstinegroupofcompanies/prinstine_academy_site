import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import usePageMeta from '../hooks/usePageMeta'

export default function OnlineCoursesLinkPage() {
  usePageMeta({
    title: 'Online Courses Link',
    description: 'Access online course enrollment and learning resources.',
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
          Online Courses Link
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-blue-100 md:text-base">
          Start learning online immediately using our course catalog and enrollment pathways.
        </p>
      </div>
      <div className="glass-card space-y-4 p-6 md:p-8">
        <p className="text-sm text-blue-100">
          See the below Online Courses Link, select the course you are enrolled to join your class.
          <br />Note: Only for Prinstine Academy students that are enrolled in the online courses. If you are not enrolled in the online courses, please contact the academy for more information.
        </p>
        {/* TODO: Add the online courses link here, use the courses from the courses and in the courses catalog page and should match the course title and link below. And make sure the link is correct and works.*/} 
        <a href="https://meet.google.com/dtm-oxkq-oeh " target="_blank" rel="noreferrer" className="btn-primary inline-flex items-center gap-2">Entrepreneurship and Business Development link <span aria-hidden="true">{'->'}</span></a>
        <a href="https://meet.google.com/ehf-qpaf-mzq" target="_blank" rel="noreferrer" className="btn-primary inline-flex items-center gap-2">Project proposal and grant writing link <span aria-hidden="true">{'->'}</span></a>  
        <a href="https://meet.google.com/frn-zaet-obs" target="_blank" rel="noreferrer" className="btn-primary inline-flex items-center gap-2">Financial Management link <span aria-hidden="true">{'->'}</span></a>  
        <a href="https://meet.google.com/txm-mzow-ixw" target="_blank" rel="noreferrer" className="btn-primary inline-flex items-center gap-2">Internal Audit and Control <span aria-hidden="true">{'->'}</span></a>  
      </div>
    </motion.section>
  )
}
