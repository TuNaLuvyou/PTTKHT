import { Document, Page, View, Text, Image, Link, StyleSheet, Font } from '@react-pdf/renderer'

// ─── Register Vietnamese font (TrueType – native PDF format) ───
// Files are served from public/fonts/ so URLs are available synchronously.
Font.register({
  family: 'Be Vietnam Pro',
  fonts: [
    { src: '/fonts/BeVietnamPro-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/BeVietnamPro-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/BeVietnamPro-Black.ttf', fontWeight: 900 },
  ],
})

// ─── Colors ───
const C = {
  primary: '#1549B8',
  text: '#0F172A',
  muted: '#475569',
  light: '#94A3B8',
  white: '#FFFFFF',
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
}

// ─── Styles ───
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Be Vietnam Pro',
    fontSize: 10,
    color: C.text,
    backgroundColor: C.white,
    padding: 0,
  },

  /* ─── Header ─── */
  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 28,
    paddingVertical: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerPhotoWrap: {
    marginRight: 14,
  },
  headerPhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    borderStyle: 'solid',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 20,
    fontWeight: 900,
    color: C.white,
    marginBottom: 1,
    letterSpacing: -0.3,
  },
  headerTitle: {
    fontSize: 10,
    color: C.blue200,
    fontWeight: 700,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contactItem: {
    fontSize: 8,
    color: C.blue100,
    marginRight: 10,
    marginBottom: 2,
  },
  contactLink: {
    fontSize: 8,
    color: C.blue100,
    marginRight: 10,
    marginBottom: 2,
    textDecoration: 'none',
  },

  /* ─── Body ─── */
  body: {
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 9,
    fontWeight: 900,
    color: C.primary,
    textTransform: 'uppercase',
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    borderLeftStyle: 'solid',
    paddingLeft: 6,
    marginBottom: 6,
    letterSpacing: 1,
  },
  sectionText: {
    fontSize: 9,
    color: C.muted,
    lineHeight: 1.6,
  },

  /* ─── Experience ─── */
  expItem: {
    marginBottom: 8,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expLeft: {
    flex: 1,
  },
  expRole: {
    fontSize: 10,
    fontWeight: 700,
    color: C.text,
    marginBottom: 1,
  },
  expCompany: {
    fontSize: 9,
    fontWeight: 700,
    color: C.primary,
  },
  expRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  expPeriod: {
    fontSize: 8,
    color: C.light,
  },
  expLocation: {
    fontSize: 8,
    color: C.light,
  },
  bulletItem: {
    flexDirection: 'row',
    fontSize: 9,
    color: C.muted,
    marginTop: 2,
    lineHeight: 1.5,
  },
  bulletDot: {
    width: 10,
    fontSize: 9,
    color: C.primary,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: C.muted,
  },

  /* ─── Education ─── */
  eduItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eduLeft: {
    flex: 1,
  },
  eduSchool: {
    fontSize: 10,
    fontWeight: 700,
    color: C.text,
  },
  eduDegree: {
    fontSize: 9,
    color: C.muted,
  },
  eduPeriod: {
    fontSize: 8,
    color: C.light,
    marginLeft: 12,
  },

  /* ─── Skills ─── */
  skillItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  skillCategory: {
    fontSize: 9,
    fontWeight: 700,
    color: C.text,
    width: 70,
  },
  skillContent: {
    fontSize: 9,
    color: C.muted,
    flex: 1,
  },

  /* ─── Languages ─── */
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  langItem: {
    fontSize: 9,
    color: C.muted,
    marginRight: 12,
    marginBottom: 2,
  },
  langName: {
    fontWeight: 700,
    color: C.text,
  },
  langLevel: {
    color: C.light,
  },

  /* ─── Certifications ─── */
  certItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  certLeft: {
    flex: 1,
  },
  certName: {
    fontSize: 9,
    fontWeight: 700,
    color: C.text,
  },
  certIssuer: {
    fontSize: 8,
    color: C.light,
  },
  certYear: {
    fontSize: 8,
    color: C.light,
    marginLeft: 10,
  },
})

// ─── Format contact items ───
const ContactItem = ({ children }) => (
  <Text style={styles.contactItem}>{children}</Text>
)

const ContactLink = ({ src, children }) => (
  <Link src={src} style={styles.contactLink}>{children}</Link>
)

// ─── Main CV Document ───
export function CVPDFDocument({ cv }) {
  const { personal, experience, education, skills, languages, certifications } = cv

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ═══ Header ═══ */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {personal.photo && (
              <View style={styles.headerPhotoWrap}>
                <Image src={personal.photo} style={styles.headerPhoto} />
              </View>
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{personal.name || 'Họ và tên'}</Text>
              <Text style={styles.headerTitle}>{personal.title || 'Chức danh'}</Text>
              <View style={styles.contactRow}>
                {personal.email && (
                  <ContactLink src={`mailto:${personal.email}`}>
                    {personal.email}
                  </ContactLink>
                )}
                {personal.phone && (
                  <ContactItem>{personal.phone}</ContactItem>
                )}
                {personal.location && (
                  <ContactItem>{personal.location}</ContactItem>
                )}
                {personal.linkedin && (
                  <ContactLink src={`https://${personal.linkedin.replace(/^https?:\/\//, '')}`}>
                    {personal.linkedin}
                  </ContactLink>
                )}
                {personal.website && (
                  <ContactLink src={personal.website.startsWith('http') ? personal.website : `https://${personal.website}`}>
                    {personal.website}
                  </ContactLink>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* ═══ Body ═══ */}
        <View style={styles.body}>
          {/* ─── Summary ─── */}
          {personal.summary && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Giới thiệu</Text>
              <Text style={styles.sectionText}>{personal.summary}</Text>
            </View>
          )}

          {/* ─── Experience ─── */}
          {experience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Kinh nghiệm</Text>
              {experience.map(exp => (
                <View key={exp.id} style={styles.expItem}>
                  <View style={styles.expHeader}>
                    <View style={styles.expLeft}>
                      <Text style={styles.expRole}>{exp.role || 'Chức vụ'}</Text>
                      <Text style={styles.expCompany}>{exp.company || 'Công ty'}</Text>
                    </View>
                    <View style={styles.expRight}>
                      {exp.period && <Text style={styles.expPeriod}>{exp.period}</Text>}
                      {exp.location && <Text style={styles.expLocation}>{exp.location}</Text>}
                    </View>
                  </View>
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{b}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* ─── Education ─── */}
          {education.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Học vấn</Text>
              {education.map(edu => (
                <View key={edu.id} style={styles.eduItem}>
                  <View style={styles.eduLeft}>
                    <Text style={styles.eduSchool}>{edu.school}</Text>
                    <Text style={styles.eduDegree}>
                      {edu.degree}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}
                    </Text>
                  </View>
                  {edu.period && <Text style={styles.eduPeriod}>{edu.period}</Text>}
                </View>
              ))}
            </View>
          )}

          {/* ─── Skills ─── */}
          {skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Kỹ năng</Text>
              {skills.map(s => (
                <View key={s.id} style={styles.skillItem}>
                  <Text style={styles.skillCategory}>{s.category}:</Text>
                  <Text style={styles.skillContent}>{s.items}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ─── Languages ─── */}
          {languages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Ngôn ngữ</Text>
              <View style={styles.langRow}>
                {languages.map(l => (
                  <Text key={l.id} style={styles.langItem}>
                    <Text style={styles.langName}>{l.lang}</Text>
                    {l.level && <Text style={styles.langLevel}> — {l.level}</Text>}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* ─── Certifications ─── */}
          {certifications.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Chứng chỉ</Text>
              {certifications.map(c => (
                <View key={c.id} style={styles.certItem}>
                  <View style={styles.certLeft}>
                    <Text style={styles.certName}>{c.name}</Text>
                    {c.issuer && <Text style={styles.certIssuer}> — {c.issuer}</Text>}
                  </View>
                  {c.year && <Text style={styles.certYear}>{c.year}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}
