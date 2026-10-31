import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Phone, Mail, Briefcase, User, ArrowLeft, FileText } from 'lucide-react'
import { SkeletonPage } from '@/components/common/Skeleton'
import { employerService } from '@/services/employerService'

export default function CandidateProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [seeker, setSeeker] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    employerService.getCandidateProfile(id)
      .then(res => {
        setSeeker(res.data || res)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="px-4 py-8 max-w-[800px] mx-auto">
        <SkeletonPage cards={2} cardType="job-card" />
      </div>
    )
  }

  if (!seeker) {
    return (
      <div className="px-4 py-8 max-w-[800px] mx-auto text-center">
        <p className="text-slate-500">Không tìm thấy hồ sơ ứng viên</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-500 font-semibold text-sm hover:text-blue-700 transition-colors bg-transparent border-none cursor-pointer">
          ← Quay lại
        </button>
      </div>
    )
  }

  const initials = seeker.full_name || seeker.name
    ? (seeker.full_name || seeker.name).split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
    : 'CV'

  return (
    <div className="px-4 py-8 max-w-[800px] mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="bg-transparent border-none cursor-pointer text-slate-500 text-sm font-semibold mb-4 flex items-center gap-1.5 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} /> Quay lại danh sách ứng viên
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 flex-wrap">
          <div className="size-16 rounded-full bg-gradient-to-br from-blue-800 to-violet-700 flex items-center justify-center text-white font-black text-xl shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-slate-900 mb-1">
              {seeker.full_name || seeker.name}
            </h1>
            {seeker.title && (
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <Briefcase size={14} className="shrink-0" /> {seeker.title}
              </p>
            )}
          </div>
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {seeker.email && (
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <a href={`mailto:${seeker.email}`} className="text-blue-600 no-underline hover:underline">
                {seeker.email}
              </a>
            </div>
          )}
          {seeker.phone && (
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Phone size={16} className="text-slate-400 shrink-0" />
              <a href={`tel:${seeker.phone}`} className="text-slate-900 no-underline hover:text-blue-600 transition-colors">
                {seeker.phone}
              </a>
            </div>
          )}
          {seeker.location && (
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <MapPin size={16} className="text-slate-400 shrink-0" />
              <span>{seeker.location}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {seeker.bio && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <User size={14} /> Giới thiệu
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl p-4 border border-slate-100">
              {seeker.bio}
            </p>
          </div>
        )}

        {/* Skills */}
        {seeker.skills?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <FileText size={14} /> Kỹ năng
            </h3>
            <div className="flex flex-wrap gap-2">
              {seeker.skills.map(skill => (
                <span key={skill} className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
