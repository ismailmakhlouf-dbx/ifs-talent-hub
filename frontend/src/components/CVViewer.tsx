import { useState, useEffect } from 'react'
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Award, 
  Languages,
  Download,
  Printer
} from 'lucide-react'
import { recruitmentApi, ReferralCV } from '../lib/api'

interface CVViewerProps {
  referralId: string
  candidateName: string
  onClose: () => void
}

export function CVViewer({ referralId, candidateName, onClose }: CVViewerProps) {
  const [cv, setCV] = useState<ReferralCV | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    recruitmentApi.getReferralCV(referralId)
      .then(setCV)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [referralId])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-thomas-orange border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-secondary">Loading CV...</p>
        </div>
      </div>
    )
  }

  if (!cv) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-card p-8 text-center">
          <p className="text-text-primary">CV not available</p>
          <button onClick={onClose} className="mt-4 btn-primary">Close</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-card shadow-elevated max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="font-display font-semibold text-thomas-slate">Curriculum Vitae</h2>
            <p className="text-sm text-text-secondary">{candidateName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-button hover:bg-slate-200 transition-colors" title="Print">
              <Printer className="w-5 h-5 text-text-secondary icon-light" />
            </button>
            <button className="p-2 rounded-button hover:bg-slate-200 transition-colors" title="Download">
              <Download className="w-5 h-5 text-text-secondary icon-light" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-button hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* CV Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Personal Info Header */}
          <div className="text-center mb-8 pb-6 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-thomas-slate mb-1">{cv.personal.name}</h1>
            <p className="text-lg text-thomas-orange font-medium mb-4">{cv.personal.title}</p>
            <div className="flex items-center justify-center gap-6 text-sm text-text-secondary flex-wrap">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 icon-light" />
                <span>{cv.personal.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 icon-light" />
                <span>{cv.personal.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 icon-light" />
                <span>{cv.personal.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Linkedin className="w-4 h-4 icon-light" />
                <span>{cv.personal.linkedin}</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-thomas-slate mb-3 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-thomas-orange rounded-full" />
              Professional Summary
            </h2>
            <p className="text-text-primary leading-relaxed">{cv.summary}</p>
          </div>

          {/* Experience */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-thomas-slate mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-thomas-orange rounded-full" />
              <Briefcase className="w-5 h-5 icon-light" />
              Professional Experience
            </h2>
            <div className="space-y-6">
              {cv.experience.map((job, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-slate-200">
                  <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-thomas-orange -translate-x-[7px]" />
                  <div className="mb-2">
                    <h3 className="font-semibold text-text-primary">{job.title}</h3>
                    <p className="text-thomas-slate font-medium">{job.company}</p>
                    <p className="text-sm text-text-secondary">{job.period}</p>
                  </div>
                  <ul className="space-y-1">
                    {job.achievements.map((achievement, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-thomas-orange mt-2 flex-shrink-0" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-thomas-slate mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-thomas-orange rounded-full" />
              <GraduationCap className="w-5 h-5 icon-light" />
              Education
            </h2>
            <div className="space-y-4">
              {cv.education.map((edu, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-text-primary">{edu.degree}</h3>
                  <p className="text-thomas-slate">{edu.institution}</p>
                  <p className="text-sm text-text-secondary">{edu.year}</p>
                  {edu.achievements.length > 0 && (
                    <div className="flex gap-2 mt-1">
                      {edu.achievements.map((a, j) => (
                        <span key={j} className="px-2 py-0.5 bg-thomas-orange/10 text-thomas-slate text-xs rounded-full">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-thomas-slate mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-thomas-orange rounded-full" />
              <Code className="w-5 h-5 icon-light" />
              Skills
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-2">Technical</h4>
                <div className="flex flex-wrap gap-1.5">
                  {cv.skills.technical.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-thomas-slate/10 text-thomas-slate text-xs font-medium rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-2">Tools</h4>
                <div className="flex flex-wrap gap-1.5">
                  {cv.skills.tools.map((tool, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-text-primary text-xs font-medium rounded-full">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-2">Soft Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {cv.skills.soft.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-thomas-orange/10 text-thomas-slate text-xs font-medium rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-thomas-slate mb-3 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-thomas-orange rounded-full" />
              <Award className="w-5 h-5 icon-light" />
              Certifications
            </h2>
            <div className="flex flex-wrap gap-2">
              {cv.certifications.map((cert, i) => (
                <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-text-primary text-sm rounded-card">
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <h2 className="text-lg font-semibold text-thomas-slate mb-3 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-thomas-orange rounded-full" />
              <Languages className="w-5 h-5 icon-light" />
              Languages
            </h2>
            <div className="flex gap-3">
              {cv.languages.map((lang, i) => (
                <span key={i} className="text-text-primary">{lang}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CVViewer
