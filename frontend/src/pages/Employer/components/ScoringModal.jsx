import { Bot, FileText, RefreshCw } from 'lucide-react'

export default function ScoringModal({
  show,
  onClose,
  onScore,
  scoringFile,
  setScoringFile,
  scoringLoading,
  scoringResult,
  scoringError,
  scoringTargetApplicant,
  jobTitle,
}) {
  if (!show) return null

  const scoreVal = scoringResult?.score || scoringResult?.overall
  const isHighScore = scoreVal >= 80 || scoringResult?.score >= 8
  const isMidScore = scoreVal >= 60 || scoringResult?.score >= 5
  const scoreColor = isHighScore ? '#10B981' : isMidScore ? '#F59E0B' : '#EF4444'

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl w-full max-w-[500px] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-[20px_24px] border-b border-border flex justify-between items-center">
          <h3 className="m-0 text-lg text-[#0F172A] flex items-center gap-1.5">
            <Bot size={18} className="text-purple-600" /> Chấm điểm CV Bằng AI
          </h3>
          <button
            onClick={onClose}
            className="bg-none border-none text-xl cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <p className="text-sm text-muted-foreground mt-0 mb-4">
            Hệ thống AI sẽ đánh giá mức độ phù hợp{' '}
            {scoringTargetApplicant && `của ứng viên ${scoringTargetApplicant.seeker.full_name}`} với tin tuyển dụng{' '}
            <b>{jobTitle}</b>.
          </p>

          {/* Existing CV notice */}
          {scoringTargetApplicant && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-[14px_16px] mb-4 flex items-center gap-3">
              <FileText size={24} className="shrink-0 text-blue-600" />
              <div className="flex-1">
                <h5 className="m-0 text-sm font-bold text-blue-800">Đã tìm thấy CV của ứng viên trong hệ thống</h5>
                <p className="m-[2px_0_0_0] text-[11px] text-blue-600 font-semibold">
                  File: {scoringTargetApplicant.resume?.title || 'CV_Ung_Vien.pdf'}
                </p>
              </div>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-[8px] py-[3px] rounded-full">
                Sẵn sàng
              </span>
            </div>
          )}

          {/* File upload */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-[#475569] mb-1.5">
              {scoringTargetApplicant ? 'Hoặc tải lên CV khác (Tùy chọn)' : 'Tải lên file CV (PDF)'}
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setScoringFile(e.target.files[0])}
              className="block w-full p-[10px_14px] border-2 border-dashed border-slate-300 rounded-lg text-sm text-[#475569] file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold file:text-sm hover:file:bg-blue-100 transition-colors cursor-pointer"
            />
          </div>

          {/* Error */}
          {scoringError && (
            <div className="p-3 bg-red-50 text-red-500 rounded-lg text-sm mb-5">
              {scoringError}
            </div>
          )}

          {/* Result */}
          {scoringResult && (
            <div className="p-5 bg-[#F8FAFC] rounded-xl border border-border">
              <div className="text-center mb-4">
                <div className="text-5xl font-black leading-none" style={{ color: scoreColor }}>
                  {scoreVal}/100
                </div>
                <div className="text-xs font-bold text-muted-foreground mt-1">ĐIỂM PHÙ HỢP</div>
                {scoringResult.reused && (
                  <div className="mt-2">
                    <span className="text-[10px] px-[8px] py-[2px] bg-blue-100 text-blue-800 rounded font-bold">
                      <RefreshCw size={10} className="inline mr-0.5" /> TÁI SỬ DỤNG ĐIỂM SỐ CỦA ỨNG VIÊN (TIẾT KIỆM TOKEN)
                    </span>
                  </div>
                )}
              </div>

              <h4 className="m-0 mb-2 text-sm text-[#0F172A] flex items-center gap-1.5">
                <FileText size={14} /> Nhận xét chi tiết:
              </h4>
              <p className="m-0 text-sm text-[#475569] leading-relaxed whitespace-pre-wrap">
                {scoringResult.review}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-[16px_24px] border-t border-border bg-[#F8FAFC] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-[10px] rounded-lg border border-border bg-white text-muted-foreground font-semibold cursor-pointer hover:bg-muted transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={onScore}
            disabled={scoringLoading || (!scoringFile && !scoringTargetApplicant)}
            className="px-5 py-[10px] rounded-lg border-none text-white font-bold cursor-pointer transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-90 bg-gradient-to-br from-emerald-500 to-emerald-700"
          >
            {scoringLoading
              ? 'Đang phân tích AI...'
              : scoringFile
                ? 'Chấm điểm bằng CV mới'
                : 'Bắt đầu chấm điểm'}
          </button>
        </div>
      </div>
    </div>
  )
}
