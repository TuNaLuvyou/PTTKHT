import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { Upload, ArrowRight, X, ThumbsUp, TrendingUp, Briefcase, ClipboardList, Activity, BarChart3, Pin, Lightbulb, Check, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import ScoreRing from '@/components/scoring/ScoreRing'

/** Map the grade letter to badge variant classes + a custom accent color */
function gradeBadge(grade) {
  const map = {
    A: { variant: 'default', accent: '#10B981' },
    B: { variant: 'default', accent: '#3B82F6' },
    C: { variant: 'default', accent: '#F59E0B' },
    D: { variant: 'destructive', accent: '#EF4444' },
  }
  return map[grade] || { variant: 'default', accent: '#64748B' }
}

/**
 * Try to get an overall assessment text from the result.
 * If no explicit review/feedback/evaluation field exists,
 * generate a default summary from the score + category data.
 */
function extractAssessment(result) {
  const a = result.analysis || {}
  // Check various possible field names used by different pipelines
  const explicit =
    a.improvement      // singular
    || a.review
    || a.feedback
    || a.summary
    || a.evaluation
    || a.overallAssessment
    || result.project_quality
    || a.project_quality

  if (explicit) return explicit

  // ── No explicit review → generate a default summary from available data ──
  const c = (a.categories || result.categories || []).filter(Boolean)
  const s = a.strengths || result.strengths || []
  const overall = a.overall ?? result.overall ?? result.score ?? 0

  const parts = []
  if (overall > 0) {
    parts.push(`CV đạt ${overall}/100 điểm tổng quan.`)
  }
  if (c.length > 0) {
    const best = [...c].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]
    const worst = [...c].sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0]
    if (best && (best.score ?? 0) > 0) {
      parts.push(`Mạnh nhất ở tiêu chí "${best.label || best.key}" (${best.score}/100).`)
    }
    if (worst && worst !== best && (worst.score ?? 0) > 0) {
      parts.push(`Cần cải thiện tiêu chí "${worst.label || worst.key}" (${worst.score}/100).`)
    }
  }
  if (s.length > 0) {
    parts.push(`Điểm mạnh chính: ${s.slice(0, 2).join(', ')}.`)
  }

  return parts.length > 0
    ? parts.join(' ')
    : 'Chưa có đánh giá chi tiết cho CV này.'
}

/** Extract level assessment */
function extractLevel(result) {
  const a = result.analysis || {}
  return (
    result.level_assessment
    || a.level_assessment
    || null
  )
}

export default function CVScoreModal({ open, onClose, result, onReset }) {
  if (!result) return null

  // ── Normalize data: support both flat fields and nested `analysis` ──
  const norm = (obj) => obj || {}
  const analysis = norm(result.analysis)

  const score = result.overall ?? result.score ?? analysis.overall ?? 0
  const grade = result.grade || analysis.grade || 'N/A'
  const gradeLabel = result.gradeLabel || analysis.gradeLabel || ''
  const fileName = result.fileName || result.cvUrl || analysis.fileName || 'CV'
  const strengths = Array.isArray(result.strengths) ? result.strengths
    : Array.isArray(analysis.strengths) ? analysis.strengths : []
  const improvements = Array.isArray(result.improvements) ? result.improvements
    : Array.isArray(analysis.improvements) ? analysis.improvements : []
  const categories = Array.isArray(result.categories) ? result.categories
    : Array.isArray(analysis.categories) ? analysis.categories : []

  const hasCategories = categories.length > 0
  const hasImprovements = improvements.length > 0
  const hasStrengths = strengths.length > 0

  const hasLeftColumn = hasStrengths || hasImprovements
  const hasRightColumn = hasCategories

  // Overall assessment text from analysis
  const overallAssessment = extractAssessment(result)
  const hasAssessment = !!overallAssessment

  // Level assessment
  const levelText = extractLevel(result)
  const hasLevel = !!levelText

  const badge = gradeBadge(grade)
  const catColor = pct => pct >= 80 ? '#10B981' : pct >= 65 ? '#3B82F6' : pct >= 50 ? '#F59E0B' : '#EF4444'

  const chartData = categories.map(c => ({
    subject: c.label || c.key || '',
    A: c.score ?? 0,
    fullMark: 100
  }))

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="!p-0 !gap-0 !flex !flex-col !max-w-4xl !w-[calc(100%-2rem)] !max-h-[90vh] !rounded-2xl !overflow-hidden"
        showCloseButton={false}
      >
        {/* ── Sticky header bar ── */}
        <div className="flex items-center justify-between px-5 py-3 bg-background shrink-0">
          <span className="text-sm font-semibold text-foreground/70">Kết quả phân tích AI</span>
          <DialogClose asChild>
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
        </div>

        {/* ── Scrollable content area ── */}
        <div className="overflow-y-auto flex-1 bg-muted/30">
          {/* ═══ Top Hero Section ═══ */}
          <div className="bg-linear-to-br from-slate-900 to-primary p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 text-white shrink-0 shadow-inner">
            <div className="shrink-0 relative">
              <ScoreRing score={score} size={130} />
            </div>
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <h2 className="font-black text-2xl leading-tight">
                  {score >= 85 ? <><Check className="inline-block h-5 w-5 text-emerald-300" /> CV rất ấn tượng!</> : score >= 70 ? <><ThumbsUp className="inline-block h-5 w-5" /> CV tốt, còn cải thiện được</> : <><TrendingUp className="inline-block h-5 w-5" /> CV cần cải thiện thêm</>}
                </h2>
                <Badge variant={badge.variant} className="text-xs px-2.5 py-0.5 !text-white"
                  style={{ backgroundColor: badge.accent }}>
                  Loại {grade}{gradeLabel ? ` — ${gradeLabel}` : ''}
                </Badge>
              </div>
              <p className="text-blue-200 text-sm">{fileName}</p>
              {hasLevel && <p className="text-sky-300 text-sm font-semibold">Cấp độ: {levelText}</p>}
              
              {hasAssessment && (
                <div className="mt-3 text-sm text-blue-50/90 leading-relaxed bg-black/10 p-3.5 rounded-xl text-left">
                  {overallAssessment}
                </div>
              )}
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2 w-full sm:w-auto mt-4 md:mt-0">
              {onReset && (
                <Button variant="outline" size="sm" onClick={() => { onReset(); onClose(); }} className="flex-1 md:flex-none justify-center gap-1.5 border-white/20 bg-white/5 text-white hover:bg-white/20 hover:text-white transition-colors">
                  <Upload className="h-4 w-4" />Upload CV khác
                </Button>
              )}
              <Button size="sm" asChild className="flex-1 md:flex-none justify-center gap-1.5 bg-white text-primary hover:bg-gray-100">
                <Link to="/jobs" onClick={onClose}><Briefcase className="h-4 w-4" /> Tìm việc <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          {/* ═══ Bottom Grid Content ═══ */}
          <div className="p-6">
            {!hasCategories && !hasImprovements ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-background">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground mb-1">Chưa có dữ liệu phân tích chi tiết</p>
                  <p className="text-xs text-muted-foreground">
                    Kết quả tổng quan: <strong className="text-foreground">{score}/100</strong>
                    {grade !== 'N/A' && <span> — Loại {grade}{gradeLabel ? ` (${gradeLabel})` : ''}</span>}
                  </p>
                  {hasStrengths && (
                    <div className="mt-6 text-left max-w-md mx-auto">
                      <p className="text-sm font-semibold text-emerald-600 mb-2">✓ Điểm mạnh:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {strengths.map(s => <li key={s} className="flex gap-2"><span className="text-emerald-500">•</span> {s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
            ) : (
              <div className={`grid grid-cols-1 ${hasLeftColumn && hasRightColumn ? 'md:grid-cols-2' : ''} gap-6 items-start`}>
                
                {/* ── Left Column: Strengths & Improvements ── */}
                {hasLeftColumn && (
                  <div className="space-y-6">
                  {hasStrengths && (
                    <Card className="shadow-sm border-emerald-100/50">
                      <CardContent className="p-5">
                        <h3 className="font-bold text-emerald-600 mb-4 flex items-center gap-2 text-sm">
                          <span className="bg-emerald-100 p-1.5 rounded-md text-emerald-600 leading-none"><Check className="h-4 w-4" /></span> Điểm mạnh
                        </h3>
                        <div className="space-y-3">
                          {strengths.map(s => (
                            <div key={s} className="flex gap-3 items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                              <p className="text-sm text-muted-foreground leading-relaxed">{s}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {hasImprovements && (
                    <Card className="shadow-sm border-amber-100/50">
                      <CardContent className="p-5">
                        <h3 className="font-bold text-amber-600 mb-4 flex items-center gap-2 text-sm">
                          <span className="bg-amber-100 p-1.5 rounded-md text-amber-600 leading-none"><AlertTriangle className="h-4 w-4" /></span> Cần cải thiện
                        </h3>
                        <div className="space-y-3.5">
                          {improvements.map((imp, i) => (
                            <div key={i} className="flex gap-3 items-start">
                              <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{imp}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                )}

                {/* ── Right Column: Chart & Categories ── */}
                {hasRightColumn && (
                  <div className="space-y-6">
                  {chartData.length > 0 && (
                    <Card className="shadow-sm border">
                      <CardContent className="p-5">
                        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm">
                          <span className="bg-primary/10 p-1.5 rounded-md text-primary leading-none"><Activity className="h-4 w-4" /></span> Phân tích tổng quan
                        </h3>
                        <div className="h-[260px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Điểm số" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                              <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {hasCategories && (
                    <Card className="shadow-sm border">
                      <CardContent className="p-5">
                        <h3 className="font-bold text-foreground mb-5 flex items-center gap-2 text-sm">
                          <span className="bg-blue-100 p-1.5 rounded-md text-blue-600 leading-none"><BarChart3 className="h-4 w-4" /></span> Chi tiết theo tiêu chí
                        </h3>
                        <div className="space-y-6">
                          {categories.map((cat, i) => (
                            <div key={cat.key || cat.label || `cat-${i}`}>
                              <div className="flex justify-between items-center mb-2">
                                <span className="flex items-center gap-2 font-semibold text-sm">
                                  <span className="text-lg leading-none">{cat.icon ? cat.icon : <Pin className="h-4 w-4 text-muted-foreground" />}</span>
                                  {cat.label || cat.key || 'Tiêu chí'}
                                </span>
                                <span className="font-bold text-sm" style={{ color: catColor(cat.score ?? 0) }}>
                                  {cat.score ?? 0}/100
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden mb-2.5">
                                <div className="h-full rounded-full transition-all duration-1000" style={{
                                  width: `${Math.min(100, Math.max(0, cat.score ?? 0))}%`,
                                  backgroundColor: catColor(cat.score ?? 0)
                                }} />
                              </div>
                              {cat.feedback && (
                                <p className="text-sm text-muted-foreground leading-relaxed mb-2.5">{cat.feedback}</p>
                              )}
                              {Array.isArray(cat.suggestions) && cat.suggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {cat.suggestions.map(s => (
                                    <Badge key={s} variant="secondary" className="text-xs font-normal bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 whitespace-normal text-left h-auto py-1 px-2.5 leading-relaxed">
                                      <Lightbulb className="h-3 w-3 inline-block mr-1" />{s}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
