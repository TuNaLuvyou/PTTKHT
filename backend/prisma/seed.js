/**
 * Database seeding script — plain-JS port of backend/src/seed.ts
 *
 * Lives in `prisma/` so it sits next to the schema and runs through Prisma's
 * own seed hook:
 *   npm run seed          →  node prisma/seed.js
 *   npx prisma db seed    →  same thing
 *
 * Seeds: global settings, demo users (employer/candidate/admin), sample jobs
 * (via jobService.create so all business rules apply), CvScores and
 * applications, plus admin notifications.
 */
const bcrypt = require('bcrypt');

const { prisma, connectDB, disconnectDB } = require('../src/config/prisma');
const userService = require('../src/services/user.service');
const jobService = require('../src/services/job.service');
const { normalizeJson } = require('../src/utils/serialize');

async function bootstrap() {
  await connectDB();

  console.log('--- Starting Database Seeding ---');

  // 1. Seed Settings (must exist before any security checks)
  const existingSettings = await prisma.settings.findUnique({
    where: { key: 'global' },
  });
  if (!existingSettings) {
    console.log('Seeding global settings...');
    await prisma.settings.create({
      data: {
        key: 'global',
        site: {
        siteName: 'NexCV',
        siteUrl: 'https://nexcv.vn',
        contactEmail: 'support@nexcv.vn',
        contactPhone: '0901234567',
        maintenanceMode: false,
      },
      ai: {
        cvScoreEnabled: true,
        maxFileSizeMB: 10,
        supportedFormats: ['pdf', 'doc', 'docx'],
        processingTimeoutSec: 60,
        dailyScoreLimit: 5,
      },
      jobs: {
        requireApproval: false,
        maxJobsPerEmployer: 20,
        featuredJobPrice: 0,
        jobExpiryDays: 90,
        autoCloseExpired: true,
      },
      users: {
        emailVerificationRequired: false,
        employerVerificationRequired: false,
        maxSavedJobs: 50,
      },
      security: {
        passwordMinLength: 6,
        maxLoginAttempts: 5,
        sessionTimeoutMin: 60,
        mfaEnabled: false,
        rbacEnabled: false,
        auditLogEnabled: true,
      },
      },
    });
  }

  // 2. Create Employer
  const employerEmail = 'employer_demo@nexcv.vn';
  let employer = await userService.findByEmail(employerEmail);

  if (!employer) {
    console.log('Creating demo employer...');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    employer = await userService.create({
      email: employerEmail,
      password: hashedPassword,
      name: 'NexCV Recruitment',
      role: 'employer',
      companyName: 'NexCV Technology',
      companyWebsite: 'https://nexcv.vn',
      industry: 'Technology',
      location: 'TP. Hồ Chí Minh',
    });
  }

  // 2.5 Create Candidate (matching mock data)
  const candidateEmail = 'demo@nexcv.vn';
  let candidate = await userService.findByEmail(candidateEmail);
  if (!candidate) {
    console.log('Creating demo candidate...');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    candidate = await userService.create({
      email: candidateEmail,
      password: hashedPassword,
      name: 'Nguyễn Văn An',
      role: 'candidate',
      phone: '0901234567',
      location: 'TP. Hồ Chí Minh',
      title: 'Frontend Developer',
      bio: 'Passionate developer with 3 years of experience in React and TypeScript.',
      skills: ['React', 'TypeScript', 'Node.js', 'TailwindCSS'],
    });
  } else {
    // Update existing candidate with richer profile
    await userService.update(candidate._id.toString(), {
      phone: candidate.phone || '0901234567',
      location: candidate.location || 'TP. Hồ Chí Minh',
      title: candidate.title || 'Frontend Developer',
      bio:
        candidate.bio ||
        'Passionate developer with 3 years of experience in React and TypeScript.',
      skills: candidate.skills?.length
        ? candidate.skills
        : ['React', 'TypeScript', 'Node.js', 'TailwindCSS'],
    });
  }

  // 2.6 Create Employer account matching mock data (employer@nexcv.vn)
  const mockEmployerEmail = 'employer@nexcv.vn';
  let mockEmployer = await userService.findByEmail(mockEmployerEmail);
  if (!mockEmployer) {
    console.log('Creating mock employer account...');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    mockEmployer = await userService.create({
      email: mockEmployerEmail,
      password: hashedPassword,
      name: 'Trần Thị Bích',
      role: 'employer',
      phone: '0909000001',
      companyName: 'Công ty TNHH NexCV',
      companyWebsite: 'https://nexcv.vn',
      industry: 'Công nghệ thông tin',
      verified: true,
    });
  }

  // 2.7 Create Admin
  const adminEmail = 'admin@nexcv.vn';
  let admin = await userService.findByEmail(adminEmail);
  if (!admin) {
    console.log('Creating demo admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    admin = await userService.create({
      email: adminEmail,
      password: hashedPassword,
      name: 'System Admin',
      role: 'admin',
    });
  }

  // 3. Create Sample Jobs
  const mockJobs = [
    {
      title: 'Senior Frontend Developer (React)',
      employerId: employer._id,
      companyName: 'NexCV Technology',
      location: 'TP. Hồ Chí Minh',
      salary: '25 - 40 triệu',
      salaryMin: 25000000,
      salaryMax: 40000000,
      category: 'Công nghệ thông tin',
      type: 'Full-time',
      level: 'Senior',
      tags: ['React', 'TypeScript', 'Tailwind'],
      description:
        'Chúng tôi đang tìm kiếm Senior Frontend Developer gia nhập đội ngũ phát triển sản phẩm NexCV...',
      requirements: [
        'Ít nhất 3 năm kinh nghiệm React',
        'Thành thạo TypeScript',
        'Kỹ năng giải quyết vấn đề tốt',
      ],
      benefits: [
        'Lương thưởng cạnh tranh',
        'Bảo hiểm cao cấp',
        'Môi trường làm việc năng động',
      ],
      status: 'active',
      featured: true,
    },
    {
      title: 'Node.js Backend Developer',
      employerId: employer._id,
      companyName: 'NexCV Technology',
      location: 'Hà Nội',
      salary: '20 - 35 triệu',
      salaryMin: 20000000,
      salaryMax: 35000000,
      category: 'Công nghệ thông tin',
      type: 'Full-time',
      level: 'Middle',
      tags: ['Node.js', 'NestJS', 'MongoDB'],
      description:
        'Phát triển các API hệ thống cho nền tảng tuyển dụng sử dụng NestJS...',
      requirements: [
        'Kinh nghiệm với Node.js ít nhất 2 năm',
        'Hiểu biết về MongoDB',
        'Ưu tiên biết NestJS',
      ],
      benefits: ['Thưởng dự án', 'Laptop Macbook Pro', 'Du lịch hàng năm'],
      status: 'active',
      featured: false,
    },
    {
      title: 'UI/UX Designer',
      employerId: employer._id,
      companyName: 'NexCV Technology',
      location: 'TP. Hồ Chí Minh',
      salary: 'Thoả thuận',
      salaryMin: 0,
      salaryMax: 0,
      category: 'Thiết kế',
      type: 'Full-time',
      level: 'Junior',
      tags: ['Figma', 'UI/UX', 'Product Design'],
      description:
        'Thiết kế trải nghiệm người dùng cho ứng dụng web và mobile...',
      requirements: [
        'Sử dụng thành thạo Figma',
        'Có portfolio tốt',
        'Yêu thích thiết kế hiện đại',
      ],
      benefits: [
        'Môi trường sáng tạo',
        'Trà chiều hàng ngày',
        'Chế độ đào tạo',
      ],
      status: 'active',
      featured: false,
    },
    {
      title: 'Intern Recruitment Consultant',
      employerId: employer._id,
      companyName: 'NexCV Technology',
      location: 'Đà Nẵng',
      salary: '5 - 7 triệu',
      salaryMin: 5000000,
      salaryMax: 7000000,
      category: 'Nhân sự',
      type: 'Internship',
      level: 'Intern',
      tags: ['HR', 'Recruitment', 'Communication'],
      description:
        'Hỗ trợ tìm kiếm và sàng lọc ứng viên tiềm năng cho các vị trí công nghệ...',
      requirements: [
        'Sinh viên năm cuối chuyên ngành nhân sự/ngoại ngữ',
        'Giao tiếp tốt',
        'Nhanh nhẹn',
      ],
      benefits: [
        'Hỗ trợ dấu thực tập',
        'Cơ hội trở thành nhân viên chính thức',
        'Lương thực tập cạnh tranh',
      ],
      status: 'active',
      featured: false,
    },
    // ── Draft job chưa đăng ──
    {
      title: 'Product Designer (Draft)',
      employerId: employer._id,
      companyName: 'NexCV Technology',
      location: 'TP. Hồ Chí Minh',
      salary: 'Thoả thuận',
      salaryMin: 0,
      salaryMax: 0,
      category: 'Thiết kế',
      type: 'Full-time',
      level: 'Middle',
      tags: ['Figma', 'UX Research', 'Design System'],
      description:
        '[Bản nháp] Thiết kế hệ thống design system cho toàn bộ nền tảng NexCV...',
      requirements: ['Kinh nghiệm thiết kế design system', 'Thành thạo Figma'],
      benefits: ['Môi trường sáng tạo'],
      status: 'draft',
      featured: false,
    },
    // ── Expired job (đã hết hạn tuyển dụng) ──
    {
      title: 'Python Developer (Expired)',
      employerId: employer._id,
      companyName: 'NexCV Technology',
      location: 'Đà Nẵng',
      salary: '18 - 25 triệu',
      salaryMin: 18000000,
      salaryMax: 25000000,
      category: 'Công nghệ thông tin',
      type: 'Full-time',
      level: 'Junior',
      tags: ['Python', 'Django', 'REST API'],
      description: 'Phát triển API backend cho nền tảng NexCV...',
      requirements: ['Kinh nghiệm Python 1 năm', 'Hiểu biết Django'],
      benefits: ['Laptop', 'Bảo hiểm'],
      status: 'expired',
      featured: false,
    },
    // ── 10 tin mới – đa công ty và lĩnh vực ──
    {
      title: 'Data Analyst',
      employerId: employer._id,
      companyName: 'VinBigData',
      location: 'Hà Nội',
      salary: '18 - 28 triệu',
      salaryMin: 18000000,
      salaryMax: 28000000,
      category: 'Công nghệ thông tin',
      type: 'Full-time',
      level: 'Middle',
      tags: ['Python', 'SQL', 'Power BI', 'Data Analysis', 'Excel'],
      description:
        'VinBigData tìm kiếm Data Analyst có khả năng phân tích dữ liệu lớn, xây dựng dashboard và hỗ trợ ra quyết định kinh doanh. Bạn sẽ làm việc cùng các kỹ sư ML và đội ngũ sản phẩm trong môi trường dữ liệu quy mô lớn.',
      requirements: [
        'Thành thạo Python và SQL',
        'Kinh nghiệm với Power BI hoặc Tableau',
        'Tư duy phân tích tốt',
        'Ít nhất 1 năm kinh nghiệm DA',
      ],
      benefits: [
        'Lương tháng 13',
        'BHYT nâng cao',
        'Làm việc với dữ liệu thực quy mô triệu bản ghi',
      ],
      status: 'active',
      featured: true,
    },
    {
      title: 'DevOps Engineer',
      employerId: employer._id,
      companyName: 'FPT Software',
      location: 'TP. Hồ Chí Minh',
      salary: '30 - 50 triệu',
      salaryMin: 30000000,
      salaryMax: 50000000,
      category: 'Công nghệ thông tin',
      type: 'Full-time',
      level: 'Senior',
      tags: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux'],
      description:
        'FPT Software tuyển DevOps Engineer phụ trách xây dựng hạ tầng cloud, tự động hóa CI/CD và giám sát hệ thống cho các dự án outsource quy mô quốc tế. Cơ hội làm việc với khách hàng Nhật Bản, Mỹ, Châu Âu.',
      requirements: [
        'Ít nhất 3 năm kinh nghiệm DevOps',
        'Thành thạo Docker và Kubernetes',
        'Kinh nghiệm AWS/GCP/Azure',
        'Hiểu biết về IaC (Terraform, Ansible)',
      ],
      benefits: [
        'Onsite nước ngoài',
        'Lương thưởng dự án',
        'Chứng chỉ AWS được hỗ trợ chi phí',
      ],
      status: 'active',
      featured: false,
    },
    {
      title: 'Digital Marketing Manager',
      employerId: employer._id,
      companyName: 'Shopee Vietnam',
      location: 'TP. Hồ Chí Minh',
      salary: '25 - 45 triệu',
      salaryMin: 25000000,
      salaryMax: 45000000,
      category: 'Marketing',
      type: 'Full-time',
      level: 'Senior',
      tags: [
        'SEO',
        'SEM',
        'Google Ads',
        'Facebook Ads',
        'Content Marketing',
        'Analytics',
      ],
      description:
        'Shopee Vietnam tìm kiếm Digital Marketing Manager để lên chiến lược và triển khai các chiến dịch quảng cáo online cho thương hiệu. Bạn sẽ quản lý ngân sách marketing, phân tích hiệu quả chiến dịch và dẫn dắt team marketing khoảng 8 người.',
      requirements: [
        'Ít nhất 4 năm kinh nghiệm Digital Marketing',
        'Thành thạo Google Ads và Facebook Ads',
        'Kỹ năng phân tích dữ liệu (Google Analytics, Mixpanel)',
        'Kinh nghiệm quản lý team',
      ],
      benefits: [
        'Stock options',
        'Ngân sách học tập 20 triệu/năm',
        'Môi trường startup quốc tế',
      ],
      status: 'active',
      featured: true,
    },
    {
      title: 'Kế Toán Tổng Hợp',
      employerId: employer._id,
      companyName: 'Vinamilk',
      location: 'TP. Hồ Chí Minh',
      salary: '12 - 18 triệu',
      salaryMin: 12000000,
      salaryMax: 18000000,
      category: 'Kế toán / Tài chính',
      type: 'Full-time',
      level: 'Middle',
      tags: ['Kế toán', 'MISA', 'Excel', 'Thuế', 'Báo cáo tài chính'],
      description:
        'Vinamilk tuyển Kế Toán Tổng Hợp phụ trách hạch toán kế toán, lập báo cáo tài chính định kỳ, kê khai thuế và hỗ trợ kiểm toán nội bộ. Đây là vị trí quan trọng trong bộ máy tài chính của tập đoàn.',
      requirements: [
        'Tốt nghiệp chuyên ngành Kế toán / Kiểm toán / Tài chính',
        'Thành thạo phần mềm MISA hoặc SAP',
        'Kinh nghiệm ít nhất 2 năm',
        'Chứng chỉ kế toán viên là lợi thế',
      ],
      benefits: [
        'Lương tháng 13 + thưởng KPI',
        'BHXH đầy đủ',
        'Phụ cấp ăn trưa',
      ],
      status: 'active',
      featured: false,
    },
    {
      title: 'Product Manager',
      employerId: employer._id,
      companyName: 'MoMo',
      location: 'TP. Hồ Chí Minh',
      salary: '40 - 70 triệu',
      salaryMin: 40000000,
      salaryMax: 70000000,
      category: 'Quản lý sản phẩm',
      type: 'Full-time',
      level: 'Senior',
      tags: [
        'Product Management',
        'Agile',
        'Scrum',
        'User Research',
        'Fintech',
        'OKR',
      ],
      description:
        'MoMo tìm kiếm Product Manager tài năng để định hướng và phát triển các tính năng mới cho siêu ứng dụng thanh toán hàng đầu Việt Nam với 30+ triệu người dùng. Bạn sẽ làm việc với data, UX, engineering và business để tạo ra sản phẩm có impact lớn.',
      requirements: [
        'Ít nhất 3 năm kinh nghiệm PM ở môi trường tech',
        'Hiểu biết sâu về lĩnh vực Fintech hoặc payments',
        'Kỹ năng phân tích dữ liệu để ra quyết định',
        'Tiếng Anh giao tiếp thành thạo',
      ],
      benefits: [
        'ESOP',
        'MacBook + màn hình 4K',
        'Ngân sách team building hàng quý',
      ],
      status: 'active',
      featured: true,
    },
    {
      title: 'Kỹ Sư Cơ Điện Tử (Embedded Systems)',
      employerId: employer._id,
      companyName: 'Bosch Vietnam',
      location: 'Hà Nội',
      salary: '22 - 35 triệu',
      salaryMin: 22000000,
      salaryMax: 35000000,
      category: 'Kỹ thuật / Cơ khí',
      type: 'Full-time',
      level: 'Middle',
      tags: ['C/C++', 'Embedded Linux', 'RTOS', 'CAN Bus', 'Automotive', 'IoT'],
      description:
        'Bosch Vietnam tuyển Kỹ Sư Embedded Systems gia nhập đội ngũ R&D phát triển phần mềm nhúng cho các sản phẩm ô tô và IoT công nghiệp. Cơ hội làm việc với tiêu chuẩn quốc tế AUTOSAR và ISO 26262.',
      requirements: [
        'Tốt nghiệp kỹ thuật điện tử / cơ điện tử / CNTT',
        'Thành thạo C/C++ cho embedded systems',
        'Kiến thức về RTOS (FreeRTOS, Zephyr)',
        'Ưu tiên có kinh nghiệm automotive',
      ],
      benefits: [
        'Môi trường làm việc quốc tế',
        'Cơ hội đào tạo tại Đức',
        'Phụ cấp xe đưa đón',
      ],
      status: 'active',
      featured: false,
    },
    {
      title: 'Chuyên Viên Tư Vấn Bất Động Sản',
      employerId: employer._id,
      companyName: 'Vinhomes',
      location: 'TP. Hồ Chí Minh',
      salary: '8 triệu + hoa hồng',
      salaryMin: 8000000,
      salaryMax: 50000000,
      category: 'Bất động sản',
      type: 'Full-time',
      level: 'Junior',
      tags: ['Sales', 'BDS', 'Tư vấn khách hàng', 'CRM', 'Bất động sản'],
      description:
        'Vinhomes tuyển Chuyên Viên Tư Vấn Bán Hàng cho các dự án căn hộ cao cấp. Bạn sẽ tiếp cận và tư vấn khách hàng tiềm năng, giới thiệu sản phẩm và chốt giao dịch. Thu nhập không giới hạn dựa trên hoa hồng.',
      requirements: [
        'Tốt nghiệp cao đẳng trở lên',
        'Kỹ năng giao tiếp và thuyết phục tốt',
        'Yêu thích công việc kinh doanh',
        'Ngoại hình tốt, tác phong chuyên nghiệp',
      ],
      benefits: [
        'Hoa hồng hấp dẫn',
        'Đào tạo bài bản',
        'Văn phòng tại các tòa nhà Vinhomes',
      ],
      status: 'active',
      featured: false,
    },
    {
      title: 'Bác Sĩ Đa Khoa',
      employerId: employer._id,
      companyName: 'Bệnh Viện Vinmec',
      location: 'Hà Nội',
      salary: '25 - 50 triệu',
      salaryMin: 25000000,
      salaryMax: 50000000,
      category: 'Y tế / Sức khỏe',
      type: 'Full-time',
      level: 'Middle',
      tags: [
        'Y khoa',
        'Chẩn đoán',
        'Điều trị',
        'Nội khoa',
        'Bệnh viện quốc tế',
      ],
      description:
        'Vinmec International Hospital tuyển Bác Sĩ Đa Khoa làm việc tại Trung tâm Y tế quốc tế Hà Nội. Bạn sẽ thăm khám, chẩn đoán và điều trị cho bệnh nhân trong môi trường bệnh viện tiêu chuẩn JCI quốc tế.',
      requirements: [
        'Tốt nghiệp Đại học Y',
        'Có chứng chỉ hành nghề bác sĩ đa khoa',
        'Tiếng Anh giao tiếp tốt (ưu tiên)',
        'Ít nhất 2 năm kinh nghiệm lâm sàng',
      ],
      benefits: [
        'Bảo hiểm sức khỏe cao cấp cho cả gia đình',
        'Đào tạo nước ngoài hàng năm',
        'Môi trường quốc tế chuyên nghiệp',
      ],
      status: 'active',
      featured: true,
    },
    {
      title: 'Content Creator / Video Editor',
      employerId: employer._id,
      companyName: 'Yeah1 Group',
      location: 'TP. Hồ Chí Minh',
      salary: '10 - 18 triệu',
      salaryMin: 10000000,
      salaryMax: 18000000,
      category: 'Truyền thông / Báo chí',
      type: 'Full-time',
      level: 'Junior',
      tags: [
        'Adobe Premiere',
        'After Effects',
        'Content',
        'Social Media',
        'YouTube',
        'TikTok',
      ],
      description:
        'Yeah1 tìm kiếm Content Creator kiêm Video Editor đam mê sáng tạo nội dung cho các kênh YouTube và TikTok với hàng triệu subscribers. Bạn sẽ lên ý tưởng, quay và dựng video cho các dự án giải trí, du lịch, lifestyle.',
      requirements: [
        'Thành thạo Premiere Pro và After Effects',
        'Hiểu biết về xu hướng mạng xã hội',
        'Sáng tạo và bắt trend nhanh',
        'Portfolio video ấn tượng',
      ],
      benefits: [
        'Môi trường sáng tạo, trẻ trung',
        'Thiết bị quay phim chuyên nghiệp',
        'Cơ hội làm việc với KOL và nghệ sĩ nổi tiếng',
      ],
      status: 'active',
      featured: false,
    },
    {
      title: 'Giáo Viên Tiếng Anh (IELTS)',
      employerId: employer._id,
      companyName: 'British Council Vietnam',
      location: 'Hà Nội',
      salary: '15 - 30 triệu',
      salaryMin: 15000000,
      salaryMax: 30000000,
      category: 'Giáo dục / Đào tạo',
      type: 'Part-time',
      level: 'Middle',
      tags: [
        'IELTS',
        'Tiếng Anh',
        'Giảng dạy',
        'TESOL',
        'CELTA',
        'Academic English',
      ],
      description:
        'British Council Vietnam tuyển Giáo Viên Tiếng Anh chuyên luyện thi IELTS tại trung tâm. Bạn sẽ dạy các lớp nhỏ (tối đa 12 học viên), thiết kế giáo án và theo dõi tiến độ học tập của từng học viên.',
      requirements: [
        'Bằng cử nhân bất kỳ',
        'Điểm IELTS 8.0+ hoặc chứng chỉ CELTA/DELTA/TESOL',
        'Kinh nghiệm giảng dạy IELTS ít nhất 1 năm',
        'Giao tiếp tiếng Anh như người bản ngữ',
      ],
      benefits: [
        'Lịch dạy linh hoạt',
        'Được đào tạo nghiệp vụ bởi British Council',
        'Thư giới thiệu quốc tế',
      ],
      status: 'active',
      featured: false,
    },
    {
      title: 'Supply Chain Analyst',
      employerId: employer._id,
      companyName: 'Samsung Electronics Vietnam',
      location: 'Hà Nội',
      salary: '20 - 32 triệu',
      salaryMin: 20000000,
      salaryMax: 32000000,
      category: 'Logistics / Xuất nhập khẩu',
      type: 'Full-time',
      level: 'Middle',
      tags: [
        'Supply Chain',
        'SAP',
        'Excel',
        'Logistics',
        'Inventory',
        'ERP',
        'Demand Planning',
      ],
      description:
        'Samsung Electronics Vietnam tuyển Supply Chain Analyst phụ trách phân tích và tối ưu hóa chuỗi cung ứng cho nhà máy sản xuất điện thoại và thiết bị điện tử tại Việt Nam. Đây là cơ hội làm việc trong môi trường sản xuất quy mô lớn cấp độ toàn cầu.',
      requirements: [
        'Tốt nghiệp Logistics / Kinh tế / Kỹ thuật công nghiệp',
        'Thành thạo SAP và Excel nâng cao',
        'Kinh nghiệm phân tích dữ liệu chuỗi cung ứng',
        'Tiếng Anh và/hoặc tiếng Hàn là lợi thế',
      ],
      benefits: [
        'Làm việc với Samsung Hàn Quốc',
        'Phụ cấp nhà ở và đi lại',
        'Chương trình phúc lợi theo tiêu chuẩn tập đoàn toàn cầu',
      ],
      status: 'active',
      featured: false,
    },
  ];

  console.log('Creating sample jobs...');
  let frontendJob = null;

  // Clear old jobs, applications, and scores for a clean test environment
  await prisma.job.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.cvScore.deleteMany({});

  for (const jobData of mockJobs) {
    const { employerId, ...rest } = jobData;
    const created = await jobService.create(rest, String(employer._id));
    if (created.title.includes('Senior Frontend Developer')) {
      frontendJob = created;
    }
  }

  // 4. Seed Candidates and Applications
  console.log('Seeding candidate accounts and applications...');

  // Candidate 1: Nguyễn Văn An
  const candidate1Email = 'candidate_demo1@nexcv.vn';
  let candidate1 = await prisma.user.findUnique({
    where: { email: candidate1Email },
  });
  if (!candidate1) {
    console.log('Creating candidate Nguyễn Văn An...');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    candidate1 = await prisma.user.create({
      data: {
        email: candidate1Email,
        password: hashedPassword,
        name: 'Nguyễn Văn An',
        role: 'candidate',
      },
    });
  }

  // Candidate 2: Trần Thị Bích
  const candidate2Email = 'candidate_demo2@nexcv.vn';
  let candidate2 = await prisma.user.findUnique({
    where: { email: candidate2Email },
  });
  if (!candidate2) {
    console.log('Creating candidate Trần Thị Bích...');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    candidate2 = await prisma.user.create({
      data: {
        email: candidate2Email,
        password: hashedPassword,
        name: 'Trần Thị Bích',
        role: 'candidate',
      },
    });
  }

  if (frontendJob) {
    // Clear old applications for clean seeding
    await prisma.application.deleteMany({
      where: { jobId: String(frontendJob._id) },
    });
    await prisma.cvScore.deleteMany({
      where: { jobId: String(frontendJob._id) },
    });

    console.log(`Seeding applications for job: ${frontendJob.title}...`);

    // Create CvScore for Nguyễn Văn An
    const mockAnalysis = {
      overall: 85,
      grade: 'A',
      gradeLabel: 'Tốt',
      strengths: [
        'Kinh nghiệm vững vàng với React và TypeScript',
        'Kỹ năng làm việc nhóm tốt',
      ],
      improvements: ['Nên bổ sung thêm kiến thức về Docker/CI-CD'],
      categories: [
        {
          key: 'skills_match',
          label: 'Kỹ năng',
          score: 88,
          feedback: 'Đáp ứng 90% kỹ năng yêu cầu',
          suggestions: ['Học thêm Next.js'],
        },
        {
          key: 'experience',
          label: 'Kinh nghiệm',
          score: 85,
          feedback: '3 năm kinh nghiệm thực tế',
          suggestions: [],
        },
        {
          key: 'education',
          label: 'Học vấn',
          score: 80,
          feedback: 'Đại học chuyên ngành CNTT',
          suggestions: [],
        },
        {
          key: 'format',
          label: 'Trình bày',
          score: 90,
          feedback: 'CV thiết kế đẹp, rõ ràng',
          suggestions: [],
        },
        {
          key: 'keywords',
          label: 'Từ khóa ATS',
          score: 82,
          feedback: 'Chứa nhiều từ khóa liên quan như React, Redux',
          suggestions: [],
        },
      ],
    };

    const mockPdfBuffer1 = Buffer.from(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
72 712 Td
(CV Nguyen Van An - Senior Frontend Developer) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000213 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
308
%%EOF`);

    const mockPdfBuffer2 = Buffer.from(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
72 712 Td
(CV Tran Thi Bich - UI/UX Designer) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000213 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
308
%%EOF`);

    const cvScore = await prisma.cvScore.create({
      data: {
        userId: candidate1.id,
        jobId: String(frontendJob._id),
        cvUrl: 'cv_nguyen_van_an.pdf',
        score: 85,
        analysis: normalizeJson(mockAnalysis),
        type: 'candidate_self_score',
        pdfBuffer: mockPdfBuffer1,
      },
    });

    const cvScoreBich = await prisma.cvScore.create({
      data: {
        userId: candidate2.id,
        cvUrl: 'cv_tran_thi_bich.pdf',
        score: 70,
        analysis: normalizeJson({
          overall: 70,
          grade: 'B',
          gradeLabel: 'Khá',
          strengths: ['Giao diện bắt mắt'],
          improvements: ['Cần bổ sung thêm kỹ năng React nâng cao'],
          categories: [],
        }),
        type: 'general_analysis',
        pdfBuffer: mockPdfBuffer2,
      },
    });

    // Create Application for Nguyễn Văn An (With existing score!)
    await prisma.application.create({
      data: {
        jobId: String(frontendJob._id),
        candidateId: candidate1.id,
        coverLetter:
          'Tôi là lập trình viên React với hơn 3 năm kinh nghiệm làm việc thực tế, mong muốn được gia nhập đội ngũ NexCV...',
        cvId: String(cvScore.id),
        status: 'pending',
        aiScoreId: cvScore.id,
      },
    });

    // Create Application for Trần Thị Bích (Without score, so recruiter can click Score manually!)
    await prisma.application.create({
      data: {
        jobId: String(frontendJob._id),
        candidateId: candidate2.id,
        coverLetter:
          'Em chào anh chị, em có 2 năm kinh nghiệm thiết kế giao diện ReactJS, em rất mong được phỏng vấn...',
        cvId: 'cv_tran_thi_bich.pdf',
        status: 'reviewing',
      },
    });

    console.log('Seeding applications done!');

    // ── Additional applications with different statuses ──
    // Application for candidate_demo1 (Nguyễn Văn An) - rejected
    await prisma.application.create({
      data: {
        jobId: String(frontendJob._id),
        candidateId: candidate1.id,
        coverLetter: 'Đây là đơn ứng tuyển với trạng thái rejected...',
        cvId: String(cvScore.id),
        status: 'rejected',
        aiScoreId: cvScore.id,
      },
    });

    // Application for candidate_demo2 (Trần Thị Bích) - interview
    await prisma.application.create({
      data: {
        jobId: String(frontendJob._id),
        candidateId: candidate2.id,
        coverLetter: 'Em rất vui khi được mời phỏng vấn...',
        cvId: 'cv_tran_thi_bich.pdf',
        status: 'interview',
      },
    });

    console.log('Additional application statuses seeded!');

    // keep references used (silence unused warnings in some linters)
    void cvScoreBich;
  }

  // 5. Seed Admin Notifications
  console.log('Seeding admin notifications...');
  const existingNotifsCount = await prisma.notification.count();
  if (existingNotifsCount === 0) {
    await prisma.notification.createMany({
      data: [
        {
          title: 'Ứng viên mới đăng ký',
          message: 'Ứng viên mới đăng ký: Nguyễn Văn X',
          type: 'info',
          read: true,
        },
        {
          title: 'Tin tuyển dụng mới cần duyệt',
          message: 'Tin tuyển dụng mới cần duyệt: UI/UX Designer',
          type: 'info',
          read: false,
        },
        {
          title: 'CV được chấm điểm',
          message: 'CV được chấm điểm: 91/100 (Xuất sắc)',
          type: 'success',
          read: false,
        },
        {
          title: 'Tin đăng bị báo cáo',
          message: 'Tin đăng bị báo cáo: "Nhân viên Marketing"',
          type: 'warning',
          read: false,
        },
        {
          title: 'NTD mới cần xác minh',
          message: 'NTD mới cần xác minh: Startup ABC',
          type: 'info',
          read: true,
        },
      ],
    });
    console.log('Admin notifications seeded!');
  }

  console.log('--- Seeding Completed Successfully! ---');
  await disconnectDB();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
