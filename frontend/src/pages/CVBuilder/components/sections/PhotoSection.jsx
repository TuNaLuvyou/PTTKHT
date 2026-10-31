import { useRef } from 'react'
import { Upload, Trash2, User, Image as ImageIcon } from 'lucide-react'
import { Section } from '../Section'

export function PhotoSection({ photo, onChange }) {
  const inputRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <Section title="Ảnh chân dung" icon={<ImageIcon className="h-4 w-4 text-[#1549B8]" />}>
      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="w-18 h-18 rounded-2xl bg-[#F8FAFC] flex items-center justify-center shrink-0 overflow-hidden">
          {photo ? (
            <img
              src={photo}
              alt="Ảnh CV"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-7 h-7 text-slate-300" />
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-xs text-slate-500 leading-relaxed">
            JPG, PNG · tối đa 2MB
          </p>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1549B8] text-white hover:bg-[#1240A0] transition-colors cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{photo ? 'Thay ảnh' : 'Tải ảnh lên'}</span>
            </button>
            {photo && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}
