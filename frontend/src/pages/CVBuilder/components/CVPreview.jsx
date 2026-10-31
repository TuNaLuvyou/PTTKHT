import { Mail, Phone, MapPin, Link2, Globe } from 'lucide-react'

function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="w-1 h-3.5 rounded-full bg-[#1549B8] shrink-0" />
      <h2 className="text-xs font-black uppercase tracking-widest text-[#1549B8]">{children}</h2>
    </div>
  )
}

export function CVPreview({ cv }) {
  const { personal, experience, education, skills, languages, certifications } = cv

  return (
    <div id="cv-preview" className="bg-white shadow-lg text-[#0F172A]" style={{ fontFamily: "'Be Vietnam Pro', sans-serif", minHeight: '297mm', fontSize: 13 }}>
      {/* Header */}
      <div className="bg-[#1549B8] px-8 py-6 text-white">
        <div className="flex items-center gap-6">
          {/* Photo */}
          {personal.photo && (
            <div className="shrink-0">
              <img
                src={personal.photo}
                alt={personal.name || 'Ảnh CV'}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid rgba(255,255,255,0.4)',
                  display: 'block',
                }}
              />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black tracking-tight mb-0.5">{personal.name || 'Họ và tên'}</h1>
            <p className="text-blue-200 font-semibold text-sm mb-3">{personal.title || 'Chức danh'}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-100">
              {personal.email    && <><Mail className="inline-block h-3 w-3 mr-1" />{personal.email}</>}
              {personal.phone    && <><Phone className="inline-block h-3 w-3 mr-1" />{personal.phone}</>}
              {personal.location && <><MapPin className="inline-block h-3 w-3 mr-1" />{personal.location}</>}
              {personal.linkedin && <><Link2 className="inline-block h-3 w-3 mr-1" />{personal.linkedin}</>}
              {personal.website  && <><Globe className="inline-block h-3 w-3 mr-1" />{personal.website}</>}
            </div>
          </div>
        </div>
      </div>


      <div className="px-8 py-5 space-y-5">
        {/* Summary */}
        {personal.summary && (
          <div>
            <SectionHeading>Giới thiệu</SectionHeading>
            <p className="text-xs leading-relaxed text-[#475569]">{personal.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <SectionHeading>Kinh nghiệm</SectionHeading>
            <div className="space-y-4">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-[#0F172A]">{exp.role || 'Chức vụ'}</p>
                      <p className="text-xs font-semibold text-[#1549B8]">{exp.company || 'Công ty'}</p>
                    </div>
                    <div className="text-right text-xs text-[#94A3B8] shrink-0 ml-4">
                      <p>{exp.period}</p>
                      <p>{exp.location}</p>
                    </div>
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {exp.bullets.filter(Boolean).map((b, i) => (
                      <li key={i} className="flex gap-2 text-xs text-[#475569]">
                        <span className="text-[#1549B8] shrink-0 mt-0.5">•</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <SectionHeading>Học vấn</SectionHeading>
            <div className="space-y-2.5">
              {education.map(edu => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm text-[#0F172A]">{edu.school}</p>
                    <p className="text-xs text-[#475569]">{edu.degree}{edu.gpa && ` — GPA: ${edu.gpa}`}</p>
                  </div>
                  <span className="text-xs text-[#94A3B8] shrink-0 ml-4">{edu.period}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <SectionHeading>Kỹ năng</SectionHeading>
            <div className="space-y-1.5">
              {skills.map(s => (
                <div key={s.id} className="flex gap-2 text-xs">
                  <span className="font-bold text-[#0F172A] w-24 shrink-0">{s.category}:</span>
                  <span className="text-[#475569]">{s.items}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <SectionHeading>Ngôn ngữ</SectionHeading>
            <div className="flex flex-wrap gap-3">
              {languages.map(l => (
                <span key={l.id} className="text-xs">
                  <strong className="text-[#0F172A]">{l.lang}</strong>
                  {l.level && <span className="text-[#94A3B8]"> — {l.level}</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <SectionHeading>Chứng chỉ</SectionHeading>
            <div className="space-y-1">
              {certifications.map(c => (
                <div key={c.id} className="flex justify-between text-xs">
                  <span><strong className="text-[#0F172A]">{c.name}</strong>{c.issuer && <span className="text-[#94A3B8]"> — {c.issuer}</span>}</span>
                  <span className="text-[#94A3B8] ml-4">{c.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
