# 📄 NexCV — Nền tảng Quản lý CV & Tuyển dụng Thông minh tích hợp AI

> **NexCV** là nền tảng tuyển dụng hiện đại được phát triển theo kiến trúc Fullstack (**Express.js, Prisma ORM, PostgreSQL & React 19**). Hệ thống hỗ trợ người tìm việc thiết kế CV chuẩn chuyên nghiệp bằng bộ kéo thả, tự động phân tích và chấm điểm CV theo tiêu chuẩn ATS bằng Trí tuệ nhân tạo (**Google Gemini AI**); đồng thời cung cấp cổng quản trị thông minh cho Nhà tuyển dụng và Quản trị viên để quản lý tin đăng, theo dõi ứng viên và phân tích dữ liệu tuyển dụng theo thời gian thực.

---

## 🌟 Tính năng nổi bật theo phân quyền

### 1. 👤 Người tìm việc (Job Seeker / Candidate)
- **Xác thực an toàn (Authentication)**: Đăng ký, đăng nhập tài khoản ứng viên với JWT và mã hóa mật khẩu bảo mật qua `bcrypt`.
- **CV Builder (Bộ tạo CV tương tác kéo thả)**:
  - Tùy biến linh hoạt các trường thông tin: Thông tin cá nhân, Học vấn, Kinh nghiệm làm việc, Kỹ năng chuyên môn, Ngoại ngữ, Dự án tiêu biểu.
  - Hỗ trợ sắp xếp các mục bằng công nghệ kéo thả `@dnd-kit`.
  - Tính năng in và xuất CV sang định dạng PDF trực tiếp từ trình duyệt.
- **AI CV Scoring (Chấm điểm CV thông minh bằng AI)**:
  - Tải lên CV sẵn có định dạng PDF hoặc Word (`.docx`).
  - Đánh giá độ tương thích với bản mô tả công việc (Job Description - JD) theo chuẩn ATS (Applicant Tracking System).
  - Nhận điểm số (thang điểm 100), phân loại xếp hạng (A, B, C, D), danh sách điểm mạnh, điểm yếu và gợi ý chỉnh sửa cụ thể.
- **Duyệt & Ứng tuyển việc làm**:
  - Tìm kiếm và lọc tin tuyển dụng theo vị trí, mức lương, địa điểm, cấp bậc.
  - Lưu việc làm yêu thích và nộp hồ sơ ứng tuyển trực tuyến.
- **Quản lý hồ sơ cá nhân**: Theo dõi trạng thái đơn ứng tuyển, lịch sử các lần chấm điểm và xem thông báo theo thời gian thực (Real-time Socket.IO).

### 2. 🏢 Nhà tuyển dụng (Employer)
- **Cổng thông tin tuyển dụng chuyên biệt**:
  - Đăng ký tài khoản doanh nghiệp, cập nhật hồ sơ công ty và tài liệu xác thực.
- **Đăng & Quản lý tin tuyển dụng**:
  - Tạo mới, cập nhật, đóng hoặc mở lại các tin đăng tuyển dụng.
  - Định nghĩa chi tiết yêu cầu kỹ năng, mô tả công việc (JD), mức lương và địa điểm làm việc.
- **Quản lý ứng viên thông minh**:
  - Xem danh sách hồ sơ ứng tuyển theo từng vị trí tuyển dụng.
  - Tự động hiển thị điểm số phân tích ATS từ AI giúp rút ngắn thời gian sàng lọc sơ bộ.
  - Chuyển đổi trạng thái hồ sơ (*Chờ xử lý / Đang xem xét / Mời phỏng vấn / Chấp nhận / Từ chối*) và gửi email thông báo tự động cho ứng viên.

### 3. 🛡️ Quản trị viên (Admin)
- **Bảng điều khiển (Admin Dashboard)**: Theo dõi biểu đồ và thống kê tổng quan về người dùng, số lượng đơn ứng tuyển, tin tuyển dụng và lượt phân tích AI.
- **Quản lý hệ thống**:
  - Quản lý người dùng: Khóa/mở khóa tài khoản có dấu hiệu vi phạm.
  - Kiểm duyệt tin tuyển dụng trên toàn hệ thống.
  - Giám sát toàn bộ lịch sử chấm điểm CV của các ứng viên.
- **Cấu hình & Giám sát**: Quản lý thiết lập hệ thống, giới hạn file tải lên, hạn mức gọi AI và gửi thông báo toàn hệ thống qua WebSocket.

---

## 🤖 Cơ chế AI Chấm điểm CV (Dual-layer Evaluation)

Hệ thống kết hợp chiến lược đánh giá hai lớp tối ưu nhằm đảm bảo tốc độ, tính chính xác và độ sẵn sàng cao:

1. **Google Gemini AI (Lớp phân tích chính)**:
   - Sử dụng model `gemini-2.5-flash` / `gemini-1.5-flash` để trích xuất văn bản từ CV và phân tích ngữ nghĩa tự nhiên.
   - Đối chiếu chéo nội dung CV với tiêu chuẩn của vị trí ứng tuyển: Kỹ năng bắt buộc, số năm kinh nghiệm, học vấn và các từ khóa trọng tâm.
   - Phát hiện các tài liệu rác/spam, từ chối xử lý và đưa ra lý do xác đáng.
2. **Local Knowledge Base Engine (Lớp dự phòng Fallback)**:
   - Cơ sở dữ liệu từ khóa chuyên môn nội bộ phong phú (Frontend, Backend, DevOps, Mobile, Data Science, AI, Soft Skills...).
   - Tự động kích hoạt thuật toán so khớp từ khóa và cấu trúc khi xảy ra sự cố nghẽn mạng hoặc vượt hạn mức API từ dịch vụ AI ngoài.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Backend (API Server)
- **Nền tảng**: [Node.js](https://nodejs.org/) & [Express.js v5](https://expressjs.com/)
- **ORM & Database**: [Prisma ORM](https://www.prisma.io/) kết hợp cơ sở dữ liệu quan hệ **PostgreSQL 16** (triển khai qua Docker Compose)
- **Thời gian thực (Real-time)**: [Socket.IO](https://socket.io/) hỗ trợ gửi thông báo tức thời
- **Xác thực & Bảo mật**: JWT ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)), mã hóa mật khẩu bằng `bcrypt`, phân quyền Role-based Access Control (RBAC)
- **Xử lý File & Tài liệu**: [Multer](https://github.com/expressjs/multer) upload file, `pdf-parse` / `pdfjs-dist` trích xuất nội dung PDF, `mammoth` trích xuất văn bản file Word (`.docx`)
- **Tích hợp Trí tuệ nhân tạo**: SDK chính thức `@google/generative-ai` (Google Gemini) & `openai`
- **Gửi Email tự động**: [Nodemailer](https://nodemailer.com/)

### Frontend (Client App)
- **UI Core**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Giao diện & Styling**: [TailwindCSS v4](https://tailwindcss.com/) kết hợp thư viện thành phần cao cấp [shadcn/ui](https://ui.shadcn.com/)
- **Điều hướng (Routing)**: [React Router v7](https://reactrouter.com/)
- **Quản lý trạng thái (State Management)**: [Zustand](https://zustand-demo.pmnd.rs/) (gọn nhẹ, nhanh và dễ bảo trì)
- **Kéo thả tương tác**: [@dnd-kit](https://dndkit.com/) phục vụ tính năng sắp xếp khối nội dung CV Builder
- **Biểu đồ & Phân tích**: [Recharts](https://recharts.org/) hiển thị trực quan năng lực và điểm số ATS
- **Hiệu ứng chuyển động**: [Framer Motion](https://www.framer.com/motion/)

---

## 📁 Cấu trúc thư mục dự án

```
CV_Project/
├── backend/                        # Express.js REST API Server
│   ├── docker-compose.yml          # Cấu hình container Docker PostgreSQL
│   ├── server.js                   # Điểm khởi chạy HTTP Server & Socket.IO
│   ├── prisma/
│   │   ├── schema.prisma           # Định nghĩa cấu trúc Database (Users, Jobs, Applications, CvScores,...)
│   │   ├── migrations/             # Lịch sử các bản migration CSDL
│   │   └── seed.js                 # Script nạp dữ liệu mẫu ban đầu
│   └── src/
│       ├── app.js                  # Cấu hình Express app và đăng ký middleware
│       ├── config/                 # Biến môi trường (env) và kết nối Prisma
│       ├── controllers/            # Tầng xử lý Request/Response (Auth, CV, Jobs, Employer, Admin)
│       ├── middlewares/            # JWT Auth, Logger, File Upload (Multer)
│       ├── routes/                 # Định tuyến API endpoint
│       ├── services/               # Tầng nghiệp vụ (Gemini AI, Email, CRUD logic)
│       ├── sockets/                # Socket.IO Gateway quản lý thông báo realtime
│       ├── utils/                  # Hàm tiện ích, bộ lọc Knowledge Base, Logger
│       └── validators/             # Kiểm tra tính hợp lệ của dữ liệu đầu vào
│
└── frontend/                       # React 19 Client (Vite)
    ├── index.html                  # File HTML chính
    ├── vite.config.js              # Cấu hình Vite & TailwindCSS plugin
    └── src/
        ├── App.jsx                 # Cấu hình Route chính của ứng dụng
        ├── pages/
        │   ├── Home/               # Trang chủ giới thiệu nền tảng
        │   ├── CVBuilder/          # Công cụ thiết kế CV kéo thả tương tác
        │   ├── CV_AIScore/         # Tải CV và hiển thị kết quả phân tích AI ATS
        │   ├── JobSeeker/          # Khu vực ứng viên (việc làm, đơn ứng tuyển, hồ sơ)
        │   ├── Employer/           # Khu vực Nhà tuyển dụng (tin tuyển dụng, lọc hồ sơ)
        │   └── Admin/              # Trang điều hành quản trị viên
        ├── components/             # Các component dùng chung (UI, Modal, Navbar, Footer)
        ├── context/                # Quản lý Context API (Auth, Theme)
        └── services/               # Client gọi API Backend
```

---

## 🚀 Hướng dẫn cài đặt và khởi chạy dự án

### Yêu cầu tiên quyết
- **Node.js**: Phiên bản 18 trở lên (Khuyến nghị Node 20 LTS).
- **Docker & Docker Desktop** (Dùng để khởi chạy PostgreSQL tự động).
- **Google Gemini API Key** (Đăng ký miễn phí tại [Google AI Studio](https://aistudio.google.com/)).

---

### Bước 1: Sao chép mã nguồn
```bash
git clone https://github.com/TuNaLuvyou/PTTKHT.git
cd PTTKHT
```

---

### Bước 2: Thiết lập và chạy Cơ sở dữ liệu (PostgreSQL)

Di chuyển vào thư mục `backend` và khởi chạy PostgreSQL bằng Docker:
```bash
cd backend
npm run db:up
```
*(Lệnh trên sẽ tự động kéo image PostgreSQL 16 và khởi chạy trên cổng `5432`)*.

---

### Bước 3: Cấu hình và khởi chạy Backend

1. Cài đặt các gói thư viện:
   ```bash
   npm install
   ```

2. Tạo file `.env` tại thư mục `backend/` dựa trên mẫu `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Cấu hình mẫu trong file `.env`:*
   ```env
   PORT=3000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexcv?schema=public"
   JWT_SECRET="nexcv_super_secure_jwt_secret_key_2026"
   GEMINI_API_KEY="your_google_gemini_api_key_here"
   FRONTEND_URL="http://localhost:5173"
   ```

3. Đồng bộ lược đồ Database và nạp dữ liệu mẫu ban đầu:
   ```bash
   npm run prisma:generate
   npm run prisma:deploy
   npm run seed
   ```

4. Khởi chạy Backend Server ở chế độ phát triển:
   ```bash
   npm run dev
   ```
   > 🚀 Backend API hoạt động tại: **`http://localhost:3000/api`**

---

### Bước 4: Cấu hình và chạy Frontend

1. Mở một cửa sổ Terminal mới và chuyển đến thư mục `frontend`:
   ```bash
   cd frontend
   npm install
   ```

2. Tạo file cấu hình môi trường `.env` tại thư mục `frontend/`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. Khởi chạy ứng dụng Frontend:
   ```bash
   npm run dev
   ```
   > 🌐 Truy cập hệ thống tại: **`http://localhost:5173`**

---

## 🌿 Quy định Nhánh Git (Branching Strategy)

Dự án áp dụng quy trình phát triển chuyên nghiệp với 2 nhánh chính:
- **`main`**: Nhánh phát hành ổn định, sẵn sàng triển khai (Production-ready).
- **`dev`**: Nhánh phát triển chính (Development), tích hợp các tính năng mới và kiểm thử thường xuyên trước khi hợp nhất vào `main`.

---

## 👥 Tài khoản mặc định để thử nghiệm (Seed Accounts)

Sau khi chạy lệnh `npm run seed` ở Backend, bạn có thể đăng nhập bằng các tài khoản sau:
- **Quản trị viên (Admin)**: `admin@nexcv.com` / `Admin@123456`
- **Nhà tuyển dụng (Employer)**: `employer@techcorp.vn` / `Employer@123456`
- **Ứng viên (Candidate)**: `candidate@gmail.com` / `Candidate@123456`
