# NexCV — Agent Rules & UI/UX Standards

Quy tắc bắt buộc tuyệt đối cho toàn bộ frontend và UI/UX của dự án NexCV.

## 1. Triết lý Thiết kế: TỐI GIẢN — ÍT CHỮ — ĐI THẲNG VÀO Ý CHÍNH
- **Cực kỳ ít chữ**: Tuyệt đối không nhồi nhét văn bản, không viết các đoạn mô tả dài dòng, không tạo các bullet points giải thích lê thê.
- **Chỉ giữ lại ý chính**: Mỗi khối chỉ cần tiêu đề ngắn gọn (dưới 7 từ) và nút hành động hoặc dữ liệu trực quan. Bỏ hết các câu khẩu hiệu, giải thích phụ không cần thiết.
- **Không tạo div nhỏ chứa chữ vụn vặt**: Không tạo các badge/pill nhỏ chỉ để chứa câu mô tả (ví dụ: các tag giới thiệu dài dòng).

## 2. Quy Tắc Icon: CẤM TUYỆT ĐỐI CÁC ICON NGÔI SAO
- **KHÔNG sử dụng bất kỳ icon ngôi sao nào**: Cấm hoàn toàn `Sparkles`, `Star` hay bất kỳ icon hình sao AI nào của Gemini/Google.
- Thay thế bằng các icon trung tính, chuyên nghiệp như `Check`, `CheckCircle2`, `ArrowRight`, `FileText`, `FileCheck`, `Building2`, `Briefcase` hoặc không cần icon.

## 3. Phân Định Màu Sắc 2 Phân Hệ (Bắt buộc giữ chuẩn)
- **Phân hệ Ứng viên (Candidate / Job Seeker)**:
  - Màu chủ đạo: **XANH DƯƠNG (`#1549B8` Royal Blue)**.
  - Hover: `#1240A0`. Nền phụ: `#EEF2FF`, `#F8FAFC`. Nền tối: Deep Navy `#0F172A`.
- **Phân hệ Nhà tuyển dụng (Employer / Recruiter)**:
  - Màu chủ đạo: **TÍM (`#7C3AED` Violet/Purple)**.
  - Hover: `#6D28D9`. Nền phụ: `#F5F3FF`, `#EDE9FE`. Nền tối: Deep Indigo `#1E1B4B` / `#0F172A`.

## 4. Bố Cục Thẻ & Div
- **Bo góc mềm mại**: Thẻ lớn dùng `rounded-3xl` hoặc `rounded-2xl`, nút và input dùng `rounded-xl`.
- **BỎ HẾT CÁC ĐƯỜNG GẠCH TRONG DIV**:
  - Tuyệt đối không dùng `<Separator />` hay border gạch ngang bên trong thẻ.
  - Badge, tag kỹ năng dùng nền mềm không viền (`bg-slate-100`, `bg-blue-50`, `bg-purple-50`), không dùng `border border-...`.
