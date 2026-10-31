import api from "./api";

// ─── Job Service ───────────────────────────────────────────────────────────────
export const jobService = {
  /**
   * Lấy danh sách công việc (có lọc, phân trang).
   * Được gọi từ: CandidateJobsPage (ứng viên), AdminJobsPage, EmployerJobsPage.
   * Trả về: { data: Job[], total: number } — danh sách công việc và tổng số bản ghi.
   * @param {{ keyword?, location?, category?, level?, type?, page?, limit?, sort? }} params
   * @returns {Promise<{ data: object[], total: number }>}
   */
  async getJobs(params = {}) {
    const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
    if (USE_MOCK) {
      const localStr = localStorage.getItem("nexcv_mock_jobs");
      let jobs = localStr ? JSON.parse(localStr) : [];
      // Candidate only sees 'active' jobs
      jobs = jobs.filter(j => j.status === 'active');

      // Apply filters
      if (params.keyword) {
        const term = params.keyword.toLowerCase();
        jobs = jobs.filter(j => 
            j.title.toLowerCase().includes(term) || 
            (j.company && j.company.toLowerCase().includes(term)) ||
            (j.description && j.description.toLowerCase().includes(term)) ||
            (j.required_skills && j.required_skills.some(s => s.toLowerCase().includes(term)))
        );
      }
      if (params.location) {
        jobs = jobs.filter(j => j.location && j.location.includes(params.location));
      }
      if (params.category) {
        jobs = jobs.filter(j => j.category === params.category);
      }
      if (params.level) {
        jobs = jobs.filter(j => j.level === params.level);
      }
      if (params.type) {
        jobs = jobs.filter(j => j.type === params.type);
      }
      
      // Sort
      if (params.sort === 'salary') {
        jobs.sort((a, b) => (b.salary_min || 0) - (a.salary_min || 0));
      } else if (params.sort === 'relevant') {
        // Ưu tiên jobs có AI score cao hoặc keyword match nhiều
        jobs.sort((a, b) => (b.ai_score?.overall_score || 0) - (a.ai_score?.overall_score || 0));
      } else {
        // 'newest' — mới nhất lên đầu
        jobs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      }

      // Map to frontend format
      const formatted = jobs.map(j => ({
        ...j,
        company: j.company || 'Công ty TNHH NexCV',
        postedAt: j.created_at,
        salary: j.salary_min ? `${(j.salary_min/1000000)} - ${(j.salary_max/1000000)} triệu` : 'Thỏa thuận',
        tags: j.required_skills || [],
      }));
      const page = Number(params.page) || 1;
      const limit = Number(params.limit) || 10;
      const total = formatted.length;
      const paginated = formatted.slice((page - 1) * limit, page * limit);
      return { data: paginated, total, page, limit };
    }
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/jobs?${query}`);
    // Chuẩn hóa dữ liệu từ backend sang format frontend mong muốn
    if (res && res.data) {
      res.data = res.data.map((j) => ({
        ...j,
        id: j._id, // Backend dùng _id
        company: j.companyName || "N/A",
        postedAt: j.createdAt,
      }));
    }
    return res;
  },

  /**
   * Lấy chi tiết một công việc theo ID.
   * Được gọi từ: JobDetailPage (chi tiết tin tuyển dụng).
   * Trả về: Job object — chi tiết công việc (id, title, description, salary, requirements, benefits, ...).
   * @param {string|number} id
   * @returns {Promise<object>}
   */
  async getJob(id) {
    const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
    if (USE_MOCK) {
      const localStr = localStorage.getItem("nexcv_mock_jobs");
      const jobs = localStr ? JSON.parse(localStr) : [];
      // Note: id might be string or number
      const job = jobs.find(j => j.id == id);
      if (job) {
        return {
          ...job,
          company: job.company || 'Công ty TNHH NexCV',
          postedAt: job.created_at,
          salary: job.salary_min ? `${(job.salary_min/1000000)} - ${(job.salary_max/1000000)} triệu` : 'Thỏa thuận',
          tags: job.required_skills || [],
          requirements: job.requirements || ['Yêu cầu xem trong phần mô tả chi tiết'],
          benefits: job.benefits || ['Được làm việc trong môi trường năng động', 'Đầy đủ chế độ bảo hiểm'],
        };
      }
      throw new Error("Job not found");
    }
    const res = await api.get(`/jobs/${id}`);
    if (res) {
      return {
        ...res,
        id: res._id,
        company: res.companyName || "N/A",
        postedAt: res.createdAt,
      };
    }
    return res;
  },

  /**
   * Nộp đơn ứng tuyển vào một công việc.
   * Được gọi từ: JobDetailPage (nút Ứng tuyển).
   * Trả về: { message: string } — thông báo kết quả ứng tuyển.
   * @param {string} jobId
   * @param {{ cvId?, coverLetter? }} data
   * @returns {Promise<{ message: string }>}
   */
  async applyJob(jobId, data = {}) {
    const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 600));
      const localAppsStr = localStorage.getItem("nexcv_mock_applications");
      const apps = localAppsStr ? JSON.parse(localAppsStr) : [];
      const newApp = {
        id: "app_" + Date.now(),
        job_id: jobId,
        seeker_id: "demo_seeker",
        status: "pending",
        cover_letter: data.coverLetter || "",
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seeker: {
          full_name: "Nguyễn Văn An (Demo)",
          email: "demo@nexcv.vn",
          avatar_url: null,
        },
        resume: { title: "CV_Demo_UngVien.pdf", pdf_url: "#" },
        ai_score: { 
          overall_score: Math.floor(Math.random() * 20) + 75, 
          breakdown: { skills: 80, experience: 80, education: 80, keywords: 80 } 
        },
      };
      apps.push(newApp);
      localStorage.setItem("nexcv_mock_applications", JSON.stringify(apps));
      
      // Tăng application_count trong nexcv_mock_jobs
      const jobsStr = localStorage.getItem("nexcv_mock_jobs");
      if (jobsStr) {
        const jobs = JSON.parse(jobsStr);
        const jobIndex = jobs.findIndex(j => j.id == jobId);
        if (jobIndex !== -1) {
          jobs[jobIndex].application_count = (jobs[jobIndex].application_count || 0) + 1;
          localStorage.setItem("nexcv_mock_jobs", JSON.stringify(jobs));
        }
      }
      
      return { message: "Ứng tuyển thành công" };
    }
    return api.post(`/jobs/${jobId}/apply`, data);
  },

  /**
   * Lưu / bỏ lưu công việc (toggle bookmark).
   * Được gọi từ: CandidateJobsPage, JobDetailPage (nút Lưu).
   * Trả về: { saved: boolean } — trạng thái lưu hiện tại.
   * @param {string} jobId
   * @returns {Promise<{ saved: boolean }>}
   */
  async toggleSaveJob(jobId) {
    const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      const savedStr = localStorage.getItem('nexcv_mock_saved_jobs');
      const saved = savedStr ? JSON.parse(savedStr) : [];
      const idx = saved.indexOf(jobId);
      if (idx === -1) {
        saved.push(jobId);
        localStorage.setItem('nexcv_mock_saved_jobs', JSON.stringify(saved));
        return { saved: true };
      } else {
        saved.splice(idx, 1);
        localStorage.setItem('nexcv_mock_saved_jobs', JSON.stringify(saved));
        return { saved: false };
      }
    }
    return api.post(`/jobs/${jobId}/save`);
  },

  /**
   * Lấy danh sách công việc đã lưu của user.
   * Được gọi từ: SavedTab (trong Profile của ứng viên).
   * Trả về: Job[] — danh sách công việc đã bookmark.
   * @returns {Promise<object[]>}
   */
  async getSavedJobs() {
    const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400));
      const savedStr = localStorage.getItem('nexcv_mock_saved_jobs');
      const savedIds = savedStr ? JSON.parse(savedStr) : [];
      const jobsStr = localStorage.getItem('nexcv_mock_jobs');
      const jobs = jobsStr ? JSON.parse(jobsStr) : [];
      return jobs
        .filter(j => savedIds.includes(String(j.id)))
        .map(j => ({
          ...j,
          _id: j.id,
          companyName: j.company || 'Công ty TNHH NexCV',
          salary: j.salary_min ? `${j.salary_min / 1000000} - ${j.salary_max / 1000000} triệu` : 'Thỏa thuận',
        }));
    }
    return api.get('/jobs/my-saved-jobs');
  },

  /**
   * Lấy danh sách danh mục công việc.
   * Được gọi từ: CandidateJobsPage (bộ lọc phân loại).
   * Trả về: Category[] — danh sách các category (it, design, marketing, ...).
   * @returns {Promise<object[]>}
   */
  async getCategories() {
    return api.get("/jobs/categories");
  },

  /**
   * Lấy danh sách công việc đã ứng tuyển của user.
   * Được gọi từ: AppliedTab (trong Profile của ứng viên).
   * Trả về: Application[] — danh sách đơn ứng tuyển kèm thông tin công việc.
   * @returns {Promise<object[]>}
   */
  async getAppliedJobs() {
    const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400));
      const appsStr = localStorage.getItem("nexcv_mock_applications");
      const jobsStr = localStorage.getItem("nexcv_mock_jobs");
      
      const apps = appsStr ? JSON.parse(appsStr) : [];
      const jobs = jobsStr ? JSON.parse(jobsStr) : [];
      
      // Lọc các ứng tuyển của seeker hiện tại (trong mock ta dùng 'demo_seeker')
      const myApps = apps.filter(a => a.seeker_id === "demo_seeker");
      
      // Map format cho AppliedTab
      return myApps.map(app => {
        const job = jobs.find(j => j.id === app.job_id) || {};
        return {
          _id: app.id,
          status: app.status,
          createdAt: app.applied_at,
          jobId: {
            _id: job.id,
            title: job.title,
            companyName: job.company || "Công ty TNHH NexCV",
            location: job.location,
          }
        };
      });
    }
    return api.get("/jobs/my-applications");
  },

  /**
   * Lấy danh sách công việc gợi ý dựa trên vai trò (role).
   * Được gọi từ: HomePage (khuyến nghị công việc cho ứng viên).
   * Trả về: { data: Job[], matched: boolean } — danh sách gợi ý và có khớp role hay không.
   * @param {string[]} roles
   * @param {number} limit
   * @returns {Promise<{ data: object[], matched: boolean }>}
   */
  async getRecommendedJobs(roles = [], limit = 5) {
    const allJobs = []
    const seenIds = new Set()
    const rolesArr = Array.isArray(roles) ? roles : (roles ? [roles] : [])
    
    for (const role of rolesArr.slice(0, 3)) {
      const keyword = normalizeRoleToKeyword(role)
      if (!keyword) continue
      
      try {
        const res = await this.getJobs({ keyword, limit })
        for (const job of res.data || []) {
          const jobId = job.id || job._id
          if (jobId && !seenIds.has(jobId)) {
            seenIds.add(jobId)
            allJobs.push(job)
          }
        }
      } catch {
        // Continue searching other tags if one query fails
      }
      
      if (allJobs.length >= limit) break
    }
    
    if (allJobs.length > 0) {
      return { data: allJobs.slice(0, limit), matched: true }
    }
    
    // Fallback: get any active jobs
    try {
      const fallback = await this.getJobs({ limit })
      return { data: fallback.data || [], matched: false }
    } catch {
      return { data: [], matched: false }
    }
  },
};

const ROLE_KEYWORD_MAP = {
  // Frontend
  'frontend': 'Frontend',
  'lập trình viên frontend': 'Frontend',
  'front-end': 'Frontend',
  'react developer': 'React',
  'vue developer': 'Vue',
  
  // Backend  
  'backend': 'Backend',
  'lập trình viên backend': 'Backend',
  'back-end': 'Backend',
  'nodejs': 'Node.js',
  'node.js developer': 'Node.js',
  'java developer': 'Java',
  'python developer': 'Python',
  
  // Fullstack
  'fullstack': 'Fullstack',
  'full-stack': 'Fullstack',
  'lập trình viên fullstack': 'Fullstack',
  
  // Mobile
  'mobile': 'Mobile',
  'lập trình viên mobile': 'Mobile',
  'react native': 'React Native',
  'flutter developer': 'Flutter',
  
  // DevOps / Cloud
  'devops': 'DevOps',
  'kỹ sư devops': 'DevOps',
  'cloud engineer': 'Cloud',
  
  // AI / Data
  'ai engineer': 'AI',
  'machine learning': 'AI',
  'data scientist': 'Data',
  'kỹ sư ai': 'AI',
  
  // Design
  'ui/ux': 'UI/UX',
  'designer': 'Design',
  'thiết kế': 'Design',
  
  // QA
  'tester': 'Tester',
  'qa engineer': 'QA',
  'kiểm thử': 'Tester',
}

/**
 * Chuuyển đổi tên vai trò (role) thành keyword tìm kiếm việc làm.
 * @param {string} role
 * @returns {string|null}
 */
export function normalizeRoleToKeyword(role) {
  if (!role) return null
  const lower = role.toLowerCase().trim()
  
  // Check exact map
  if (ROLE_KEYWORD_MAP[lower]) return ROLE_KEYWORD_MAP[lower]
  
  // Check partial match
  for (const [key, value] of Object.entries(ROLE_KEYWORD_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return value
  }
  
  // Fallback: lấy từ đầu tiên của role làm keyword
  return role.split(' ')[0]
}

export const JOB_CATEGORIES = [
  { id: "it", name: "Công nghệ thông tin", icon: "monitor", count: 1240 },
  { id: "design", name: "Thiết kế", icon: "palette", count: 340 },
  { id: "marketing", name: "Marketing", icon: "megaphone", count: 580 },
  { id: "finance", name: "Kế toán / Tài chính", icon: "wallet", count: 420 },
  { id: "hr", name: "Nhân sự", icon: "users", count: 290 },
  { id: "sales", name: "Kinh doanh / Sales", icon: "trending-up", count: 760 },
  { id: "data", name: "Dữ liệu & AI", icon: "bot", count: 310 },
  { id: "pm", name: "Quản lý sản phẩm", icon: "folder-kanban", count: 180 },
  { id: "engineering", name: "Kỹ thuật / Cơ khí", icon: "settings", count: 250 },
  { id: "realestate", name: "Bất động sản", icon: "building2", count: 320 },
  { id: "healthcare", name: "Y tế / Sức khỏe", icon: "heart-pulse", count: 410 },
  { id: "media", name: "Truyền thông / Báo chí", icon: "newspaper", count: 150 },
  { id: "education", name: "Giáo dục / Đào tạo", icon: "book-open", count: 380 },
  { id: "logistics", name: "Logistics / Xuất nhập khẩu", icon: "ship", count: 270 },
];
