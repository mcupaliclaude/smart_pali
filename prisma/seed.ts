import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCore, seedUser } from "./lib/seed-core";
import { requireDatabaseUrl } from "./lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

/** รหัสผ่านทุกบัญชีตัวอย่าง */
export const DEV_PASSWORD = "Passw0rd!vibe";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PROD !== "1") {
    console.error("[seed] ปฏิเสธ: NODE_ENV=production — ใช้ npm run db:bootstrap แทน");
    process.exit(1);
  }
  const core = await seedCore(prisma, { tenantCode: "DEMO", nameTh: "องค์กรตัวอย่าง", nameEn: "Sample Organization" });
  const hash = await bcrypt.hash(DEV_PASSWORD, 12);
  const users = [
    { email: "admin@app.local", name: "ผู้ดูแลสูงสุด", roles: ["SUPER_ADMIN"] },
    { email: "staff@app.local", name: "เจ้าหน้าที่", roles: ["STAFF"] },
    { email: "viewer@app.local", name: "ผู้ดู", roles: ["VIEWER"] },
    { email: "lockme@app.local", name: "บัญชีทดสอบล็อก", roles: ["VIEWER"] },
    { email: "forced@app.local", name: "บัญชีบังคับเปลี่ยนรหัส", roles: ["VIEWER"], mustChangePassword: true },
  ];
  for (const u of users) {
    await seedUser(prisma, core.tenantId, { ...u, passwordHash: hash, roleIds: u.roles.map((c) => core.roleIds[c]) });
  }

  // Seed News Categories
  const categories = [
    { code: "general", nameTh: "ข่าวประชาสัมพันธ์ทั่วไป", nameEn: "General News", seq: 1 },
    { code: "academic", nameTh: "ข่าววิชาการและการศึกษา", nameEn: "Academic & Education", seq: 2 },
    { code: "events", nameTh: "กิจกรรมและบริการสังคม", nameEn: "Events & Activities", seq: 3 },
    { code: "procurement", nameTh: "ประกาศจัดซื้อจัดจ้าง", nameEn: "Procurement", seq: 4 },
    { code: "scholarships", nameTh: "ทุนการศึกษาและรางวัล", nameEn: "Scholarships & Awards", seq: 5 },
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const row = await prisma.newsCategory.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: cat.code } },
      update: { nameTh: cat.nameTh, nameEn: cat.nameEn, seq: cat.seq, isActive: true },
      create: { tenantId: core.tenantId, code: cat.code, nameTh: cat.nameTh, nameEn: cat.nameEn, seq: cat.seq, isActive: true },
    });
    catMap[cat.code] = row.id;
  }

  // Seed Sample News
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@app.local" } });
  const sampleNews = [
    {
      titleTh: "ขอเชิญร่วมงานเปิดบ้านวิชาการประจำปีการศึกษา 2570",
      titleEn: "Invitation to Open House Academic Fair 2027",
      slug: "open-house-academic-fair-2027",
      catCode: "events",
      excerptTh: "ขอเชิญคณาจารย์ นักศึกษา และผู้สนใจทุกท่าน ร่วมกิจกรรมเปิดบ้านวิชาการ นิทรรศการงานวิจัย และการเสวนาพิเศษ",
      excerptEn: "Faculty, students, and the public are invited to join the annual academic open house, research exhibitions, and keynote talks.",
      contentTh: "คณะขอเรียนเชิญคณาจารย์ นักศึกษา และประชาชนทั่วไปเข้าร่วมงานเปิดบ้านวิชาการประจำปี พบกับการนำเสนอผลงานวิจัยระดับชาติ การแนะแนวหลักสูตรการศึกษา และกิจกรรมเวิร์กชอปที่น่าสนใจมากมายตลอด 3 วันเต็ม พร้อมรับเกียรติบัตรการเข้าร่วมกิจกรรม",
      contentEn: "The Faculty cordially invites professors, students, and the general public to attend our Annual Academic Open House. Highlights include national research showcases, curriculum consultations, and insightful workshops with certificates provided.",
      isPinned: true,
      isFeatured: true,
      coverImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
    },
    {
      titleTh: "ประกาศรับสมัครทุนการศึกษาเพื่อการวิจัยระดับบัณฑิตศึกษา ประจำภาคเรียนที่ 1/2570",
      titleEn: "Call for Graduate Research Scholarship Applications (Term 1/2027)",
      slug: "graduate-research-scholarship-2027",
      catCode: "scholarships",
      excerptTh: "เปิดรับสมัครผู้ขอรับทุนสนับสนุนงานวิจัยและการตีพิมพ์ระดับปริญญาโท-เอก จำนวน 10 ทุนการศึกษา",
      excerptEn: "Applications are now open for Master and Doctoral research and publication grants (10 scholarships total).",
      contentTh: "ฝ่ายวิชาการและวิจัยเปิดรับสมัครนักศึกษาระดับบัณฑิตศึกษาเพื่อขอรับทุนสนับสนุนงานวิจัย ประจำปีการศึกษา 2570 เพื่อส่งเสริมการสร้างสรรค์ผลงานวิจัยที่มีคุณภาพในระดับสากล ผู้สนใจสามารถยื่นเอกสารได้ตั้งแต่บัดนี้จนถึงสิ้นเดือนหน้า",
      contentEn: "The Academic and Research Department invites graduate students to apply for research grants for the 2027 academic year to foster high-impact research. Applications are open until the end of next month.",
      isPinned: true,
      isFeatured: false,
      coverImageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
    },
    {
      titleTh: "โครงการอบรมเชิงปฏิบัติการ การสืบค้นคัมภีร์พระไตรปิฎกและวรรณคดีบาลีด้วยเทคโนโลยีดิจิทัล",
      titleEn: "Workshop on Digital Tipitaka and Pali Studies Research Tools",
      slug: "digital-tipitaka-pali-workshop",
      catCode: "academic",
      excerptTh: "ยกระดับการศึกษาพระพุทธศาสนาด้วยเครื่องมือ AI และระบบฐานข้อมูลคัมภีร์ออนไลน์สำหรับนักศึกษาและนักวิจัย",
      excerptEn: "Elevating Buddhist and Pali textual research through AI tools and digital corpus databases for students and scholars.",
      contentTh: "การอบรมเข้มข้นที่จะพาทุกท่านไปทำความรู้จักกับระบบฐานข้อมูลพระไตรปิฎกดิจิทัล และเครื่องมือวิเคราะห์ทางภาษาศาสตร์คอมพิวเตอร์ ช่วยให้การค้นคว้าเทียบเคียงคัมภีร์ทำได้อย่างรวดเร็ว ถูกต้อง และแม่นยำสูง",
      contentEn: "An intensive training workshop exploring digital Tipitaka repositories and computational philology tools to accelerate and elevate textual comparison and research accuracy.",
      isPinned: false,
      isFeatured: false,
      coverImageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80",
    },
  ];

  for (const n of sampleNews) {
    await prisma.newsArticle.upsert({
      where: { tenantId_slug: { tenantId: core.tenantId, slug: n.slug } },
      update: {
        titleTh: n.titleTh,
        titleEn: n.titleEn,
        categoryId: catMap[n.catCode],
        excerptTh: n.excerptTh,
        excerptEn: n.excerptEn,
        contentTh: n.contentTh,
        contentEn: n.contentEn,
        coverImageUrl: n.coverImageUrl,
        isPinned: n.isPinned,
        isFeatured: n.isFeatured,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      create: {
        tenantId: core.tenantId,
        authorId: adminUser?.id,
        titleTh: n.titleTh,
        titleEn: n.titleEn,
        slug: n.slug,
        categoryId: catMap[n.catCode],
        excerptTh: n.excerptTh,
        excerptEn: n.excerptEn,
        contentTh: n.contentTh,
        contentEn: n.contentEn,
        coverImageUrl: n.coverImageUrl,
        isPinned: n.isPinned,
        isFeatured: n.isFeatured,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }

  // Seed Staff Departments
  const staffDepartments = [
    { code: "buddhist_studies", nameTh: "ภาควิชาพระพุทธศาสนา", nameEn: "Department of Buddhist Studies", seq: 1 },
    { code: "pali_philosophy", nameTh: "ภาควิชาภาษาบาลีและปรัชญา", nameEn: "Department of Pali & Philosophy", seq: 2 },
    { code: "meditation_dev", nameTh: "กลุ่มงานพัฒนาวิปัสสนาธุระ", nameEn: "Meditation & Spiritual Studies Unit", seq: 3 },
    { code: "academic_support", nameTh: "งานบริหารและสนับสนุนวิชาการ", nameEn: "Academic & Administrative Support", seq: 4 },
  ];

  const deptMap: Record<string, string> = {};
  for (const d of staffDepartments) {
    const row = await prisma.staffDepartment.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: d.code } },
      update: { nameTh: d.nameTh, nameEn: d.nameEn, seq: d.seq, isActive: true },
      create: { tenantId: core.tenantId, code: d.code, nameTh: d.nameTh, nameEn: d.nameEn, seq: d.seq, isActive: true },
    });
    deptMap[d.code] = row.id;
  }

  // Seed Sample Staff Profiles
  const sampleStaff = [
    {
      prefixTh: "ศ.ดร.",
      prefixEn: "Prof. Dr.",
      firstNameTh: "พระมหาปัญญา",
      lastNameTh: "ญาณวชิโร",
      firstNameEn: "Phramaha Panya",
      lastNameEn: "Nyanavajiro",
      staffType: "ACADEMIC" as const,
      academicRank: "ศาสตราจารย์",
      administrativePositionTh: "คณบดีคณะพุทธศาสตร์",
      administrativePositionEn: "Dean of Faculty",
      deptCode: "buddhist_studies",
      email: "dean@app.local",
      phone: "02-123-4560",
      roomNo: "401",
      education: [
        "ป.ธ.๙ (เปรียญธรรม ๙ ประโยค)",
        "ศศ.ด. (พระพุทธศาสนา) มหาวิทยาลัยออกซฟอร์ด",
        "Ph.D. in Oriental Studies, University of Oxford",
      ],
      researchInterests: [
        "Early Buddhist Philosophy",
        "Pali Philology and Manuscripts",
        "Comparative Religious Epistemology",
      ],
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      seq: 1,
    },
    {
      prefixTh: "รศ.ดร.",
      prefixEn: "Assoc. Prof. Dr.",
      firstNameTh: "สิริพร",
      lastNameTh: "รัตนวงศ์",
      firstNameEn: "Siriporn",
      lastNameEn: "Rattanawong",
      staffType: "ACADEMIC" as const,
      academicRank: "รองศาสตราจารย์",
      administrativePositionTh: "รองคณบดีฝ่ายวิชาการและวิจัย",
      administrativePositionEn: "Associate Dean for Academic Affairs",
      deptCode: "pali_philosophy",
      email: "siriporn.r@app.local",
      phone: "02-123-4561",
      roomNo: "402",
      education: [
        "อ.ด. (ภาษาศาสตร์คอมพิวเตอร์) มหาวิทยาลัยเกียวโต",
        "M.A. in Pali Literature, Harvard University",
      ],
      researchInterests: [
        "Digital Philology",
        "AI in Classical Text Analysis",
        "Sanskrit & Pali Syntax",
      ],
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      seq: 2,
    },
    {
      prefixTh: "ผศ.",
      prefixEn: "Asst. Prof.",
      firstNameTh: "พระครูสมุห์เมธา",
      lastNameTh: "สุทฺธิญาโณ",
      firstNameEn: "Phrakhru Samu Metha",
      lastNameEn: "Suddhinyano",
      staffType: "ACADEMIC" as const,
      academicRank: "ผู้ช่วยศาสตราจารย์",
      administrativePositionTh: "หัวหน้าภาควิชาพระพุทธศาสนา",
      administrativePositionEn: "Head of Buddhist Studies Department",
      deptCode: "buddhist_studies",
      email: "metha.s@app.local",
      phone: "02-123-4562",
      roomNo: "405",
      education: [
        "ป.ธ.๗ (เปรียญธรรม ๗ ประโยค)",
        "พธ.ด. (วิปัสสนาภาวนา)",
      ],
      researchInterests: [
        "Mindfulness and Cognitive Studies",
        "Tipitaka Hermeneutics",
      ],
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      seq: 3,
    },
    {
      prefixTh: "นาย",
      prefixEn: "Mr.",
      firstNameTh: "ธนากร",
      lastNameTh: "เกียรติสกุล",
      firstNameEn: "Thanakorn",
      lastNameEn: "Kiatsakul",
      staffType: "SUPPORT" as const,
      academicRank: null,
      administrativePositionTh: "หัวหน้างานบริการการศึกษาและทะเบียน",
      administrativePositionEn: "Head of Academic Support & Registrar",
      deptCode: "academic_support",
      email: "thanakorn.k@app.local",
      phone: "02-123-4565",
      roomNo: "102",
      education: [
        "ศศ.บ. (การบริหารการศึกษา) มหาวิทยาลัยเชียงใหม่",
      ],
      researchInterests: [
        "Educational Administration",
        "Digital Student Information Services",
      ],
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      seq: 4,
    },
  ];

  for (const s of sampleStaff) {
    await prisma.staffProfile.upsert({
      where: { tenantId_email: { tenantId: core.tenantId, email: s.email.toLowerCase() } },
      update: {
        prefixTh: s.prefixTh,
        prefixEn: s.prefixEn,
        firstNameTh: s.firstNameTh,
        lastNameTh: s.lastNameTh,
        firstNameEn: s.firstNameEn,
        lastNameEn: s.lastNameEn,
        staffType: s.staffType,
        academicRank: s.academicRank,
        administrativePositionTh: s.administrativePositionTh,
        administrativePositionEn: s.administrativePositionEn,
        departmentId: deptMap[s.deptCode],
        phone: s.phone,
        roomNo: s.roomNo,
        education: s.education,
        researchInterests: s.researchInterests,
        avatarUrl: s.avatarUrl,
        seq: s.seq,
        status: "ACTIVE",
      },
      create: {
        tenantId: core.tenantId,
        prefixTh: s.prefixTh,
        prefixEn: s.prefixEn,
        firstNameTh: s.firstNameTh,
        lastNameTh: s.lastNameTh,
        firstNameEn: s.firstNameEn,
        lastNameEn: s.lastNameEn,
        staffType: s.staffType,
        academicRank: s.academicRank,
        administrativePositionTh: s.administrativePositionTh,
        administrativePositionEn: s.administrativePositionEn,
        departmentId: deptMap[s.deptCode],
        email: s.email.toLowerCase(),
        phone: s.phone,
        roomNo: s.roomNo,
        education: s.education,
        researchInterests: s.researchInterests,
        avatarUrl: s.avatarUrl,
        seq: s.seq,
        status: "ACTIVE",
      },
    });
  }

  // Seed Curriculum Programs & Courses
  const samplePrograms = [
    {
      code: "BA-BUD",
      nameTh: "หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา",
      nameEn: "Bachelor of Arts Program in Buddhist Studies",
      degreeTh: "พุทธศาสตรบัณฑิต (พระพุทธศาสนา)",
      degreeEn: "Bachelor of Arts (Buddhist Studies)",
      level: "BACHELOR" as const,
      deptCode: "buddhist_studies",
      totalCredits: 120,
      durationYears: 4,
      tuitionFeeNoteTh: "ประมาณ 18,000 บาท ต่อภาคการศึกษา (มีทุนการศึกษาสำหรับพระภิกษุ-สามเณร)",
      tuitionFeeNoteEn: "Approx. 18,000 THB / semester (Full scholarships available for monks/novices)",
      descriptionTh: "หลักสูตรบูรณาการพุทธธรรมเข้ากับศาสตร์สมัยใหม่ เพื่อการประยุกต์ใช้ในการพัฒนาจิตใจ สังคม และการศึกษาเชิงวิชาการในระดับสากล",
      descriptionEn: "An integrated curriculum combining classical Buddhist philosophy with contemporary interdisciplinary research for mental development and global academic excellence.",
      careerProspects: [
        "อาจารย์/นักวิชาการด้านศาสนาและปรัชญา",
        "นักวิจัยและผู้เชี่ยวชาญด้านจิตตปัญญาศึกษา",
        "บุคลากรทางการศึกษาและหน่วยงานส่งเสริมคุณธรรมจริยธรรม",
      ],
      admissionRequirements: [
        "สำเร็จการศึกษาระดับมัธยมศึกษาตอนปลาย (ม.๖) หรือเทียบเท่า",
        "พระภิกษุสามเณรผู้สอบได้เปรียญธรรม ๓ ประโยคขึ้นไป",
        "มีความสนใจใฝ่รู้ด้านพุทธศาสน์ศึกษา",
      ],
      seq: 1,
      courses: [
        { code: "BS101", nameTh: "ประวัติศาสตร์พระพุทธศาสนา", nameEn: "History of Buddhism", credits: 3, yearLevel: 1, semester: 1 },
        { code: "BS102", nameTh: "วรรณกรรมพระไตรปิฎกศึกษา", nameEn: "Tipitaka Literature Studies", credits: 3, yearLevel: 1, semester: 2 },
        { code: "BS201", nameTh: "พุทธปรัชญาเถรวาทและมหายาน", nameEn: "Theravada and Mahayana Buddhist Philosophy", credits: 3, yearLevel: 2, semester: 1 },
      ],
    },
    {
      code: "MA-PALI",
      nameTh: "หลักสูตรศิลปศาสตรมหาบัณฑิต สาขาวิชาภาษาบาลีและคัมภีร์ศึกษา",
      nameEn: "Master of Arts Program in Pali and Textual Studies",
      degreeTh: "ศิลปศาสตรมหาบัณฑิต (ภาษาบาลีและคัมภีร์ศึกษา)",
      degreeEn: "Master of Arts (Pali and Textual Studies)",
      level: "MASTER" as const,
      deptCode: "pali_philosophy",
      totalCredits: 36,
      durationYears: 2,
      tuitionFeeNoteTh: "ประมาณ 28,000 บาท ต่อภาคการศึกษา",
      tuitionFeeNoteEn: "Approx. 28,000 THB / semester",
      descriptionTh: "หลักสูตรระดับบัณฑิตศึกษาที่มุ่งผลิตผู้เชี่ยวชาญการอ่าน แปล และวิพากษ์คัมภีร์ภาษาบาลี คัมภีร์ใบลาน และการประยุกต์เครื่องมือดิจิทัลในการวิจัย",
      descriptionEn: "Graduate program fostering philologists and researchers skilled in reading, translating, and critical editing of Pali canonical texts and palm-leaf manuscripts.",
      careerProspects: [
        "นักวิจัยคัมภีร์บาลีและภาษาศาสตร์โบราณ",
        "ผู้เชี่ยวชาญการอนุรักษ์เอกสารโบราณและใบลาน",
        "อาจารย์ประจำสถาบันอุดมศึกษา",
      ],
      admissionRequirements: [
        "สำเร็จการศึกษาระดับปริญญาตรีทุกสาขา หรือผู้สอบได้เปรียญธรรม ๙ ประโยค",
        "มีพื้นฐานภาษาบาลีหรือผ่านการทดสอบวัดความรู้",
      ],
      seq: 2,
      courses: [
        { code: "PL501", nameTh: "ไวยากรณ์บาลีขั้นสูงและภาษาศาสตร์เทียบเคียง", nameEn: "Advanced Pali Grammar & Comparative Philology", credits: 3, yearLevel: 1, semester: 1 },
        { code: "PL502", nameTh: "ระเบียบวิธีวิจัยคัมภีร์โบราณดิจิทัล", nameEn: "Digital Textual Research Methodologies", credits: 3, yearLevel: 1, semester: 2 },
      ],
    },
    {
      code: "CERT-MED",
      nameTh: "หลักสูตรประกาศนียบัตรวิปัสสนาภาวนาเพื่อการพัฒนาคุณภาพชีวิต",
      nameEn: "Certificate Program in Mindfulness and Meditation Practice",
      degreeTh: "ประกาศนียบัตรวิปัสสนาภาวนา",
      degreeEn: "Certificate in Meditation Practice",
      level: "CERTIFICATE" as const,
      deptCode: "meditation_dev",
      totalCredits: 12,
      durationYears: 1,
      tuitionFeeNoteTh: "ไม่มีค่าธรรมเนียมการศึกษา (หลักสูตรบริการวิชาการแก่สังคม)",
      tuitionFeeNoteEn: "Free of charge (Academic Social Outreach Program)",
      descriptionTh: "หลักสูตรระยะสั้นเพื่อการอบรมฝึกฝนจิตภาวนาตามแนวสติปัฏฐาน ๔ สำหรับประชาชนทั่วไปและผู้ปฏิบัติงานเพื่อเสริมสร้างสุขภาพจิต",
      descriptionEn: "A comprehensive short-course certificate training participants in the Four Foundations of Mindfulness (Satipatthana) for psychological well-being.",
      careerProspects: [
        "ผู้นำกลุ่มวิปัสสนาและฝึกสติในองค์กร",
        "วิทยากรบรรยายสุขภาพจิตและธรรมะบำบัด",
      ],
      admissionRequirements: [
        "บุคคลทั่วไปอายุ 18 ปีขึ้นไป",
        "สามารถเข้าร่วมการปฏิบัติภาวนาอย่างต่อเนื่องได้",
      ],
      seq: 3,
      courses: [
        { code: "MD101", nameTh: "หลักการและวิธีปฏิบัติสติปัฏฐาน ๔", nameEn: "Principles and Practice of Satipatthana", credits: 3, yearLevel: 1, semester: 1 },
        { code: "MD102", nameTh: "การเจริญสติในชีวิตประจำวันและการจัดการความเครียด", nameEn: "Mindfulness in Daily Life and Stress Management", credits: 3, yearLevel: 1, semester: 1 },
      ],
    },
  ];

  for (const p of samplePrograms) {
    const prog = await prisma.curriculumProgram.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: p.code } },
      update: {
        nameTh: p.nameTh,
        nameEn: p.nameEn,
        degreeTh: p.degreeTh,
        degreeEn: p.degreeEn,
        level: p.level,
        departmentId: deptMap[p.deptCode],
        totalCredits: p.totalCredits,
        durationYears: p.durationYears,
        tuitionFeeNoteTh: p.tuitionFeeNoteTh,
        tuitionFeeNoteEn: p.tuitionFeeNoteEn,
        descriptionTh: p.descriptionTh,
        descriptionEn: p.descriptionEn,
        careerProspects: p.careerProspects,
        admissionRequirements: p.admissionRequirements,
        seq: p.seq,
        status: "ACTIVE",
      },
      create: {
        tenantId: core.tenantId,
        code: p.code,
        nameTh: p.nameTh,
        nameEn: p.nameEn,
        degreeTh: p.degreeTh,
        degreeEn: p.degreeEn,
        level: p.level,
        departmentId: deptMap[p.deptCode],
        totalCredits: p.totalCredits,
        durationYears: p.durationYears,
        tuitionFeeNoteTh: p.tuitionFeeNoteTh,
        tuitionFeeNoteEn: p.tuitionFeeNoteEn,
        descriptionTh: p.descriptionTh,
        descriptionEn: p.descriptionEn,
        careerProspects: p.careerProspects,
        admissionRequirements: p.admissionRequirements,
        seq: p.seq,
        status: "ACTIVE",
      },
    });

    for (const c of p.courses) {
      await prisma.curriculumCourse.upsert({
        where: { programId_code: { programId: prog.id, code: c.code } },
        update: {
          nameTh: c.nameTh,
          nameEn: c.nameEn,
          credits: c.credits,
          yearLevel: c.yearLevel,
          semester: c.semester,
        },
        create: {
          tenantId: core.tenantId,
          programId: prog.id,
          code: c.code,
          nameTh: c.nameTh,
          nameEn: c.nameEn,
          credits: c.credits,
          yearLevel: c.yearLevel,
          semester: c.semester,
        },
      });
    }
  }

  // Seed Sample e-Documents & Approval Steps
  const staffUser = await prisma.user.findUnique({ where: { email: "staff@app.local" } });
  if (adminUser && staffUser) {
    const sampleDocs = [
      {
        docNo: "พธ-2570/0001",
        title: "ขออนุมัติจัดโครงการสัมมนาเชิงปฏิบัติการพุทธนวัตกรรมและปัญญาประดิษฐ์เพื่อการเผยแผ่",
        docType: "PROJECT_PROPOSAL" as const,
        priority: "URGENT" as const,
        content: "ด้วยภาควิชาพระพุทธศาสนามีความประสงค์จะจัดโครงการสัมมนาเชิงปฏิบัติการเพื่อส่งเสริมอาจารย์และนักวิจัยในการประยุกต์ AI เพื่อการศึกษาคัมภีร์พุทธธรรม ระหว่างวันที่ 15-17 ของเดือนหน้า งบประมาณรวมทั้งสิ้น 45,000 บาท จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ",
        submitterId: staffUser.id,
        deptCode: "buddhist_studies",
        status: "IN_REVIEW" as const,
        steps: [
          { approverId: adminUser.id, approverRole: "หัวหน้าภาควิชาพระพุทธศาสนา", stepOrder: 1, decision: "APPROVED" as const, comment: "เห็นควรอนุมัติตามเสนอ เป็นประโยชน์อย่างยิ่งต่องานวิจัยของคณะ", decidedAt: new Date() },
          { approverId: adminUser.id, approverRole: "คณบดีคณะพุทธศาสตร์", stepOrder: 2, decision: "PENDING" as const, comment: null, decidedAt: null },
        ],
      },
      {
        docNo: "พธ-2570/0002",
        title: "บันทึกข้อความขออนุมัติปรับปรุงสื่อการสอนดิจิทัลในห้องปฏิบัติการภาษาบาลี",
        docType: "MEMO" as const,
        priority: "NORMAL" as const,
        content: "กราบเรียน คณบดีคณะพุทธศาสตร์ เพื่อขอความอนุเคราะห์จัดซื้ออุปกรณ์คอมพิวเตอร์และไมโครโฟนบันทึกเสียง สำหรับการบันทึกเสียงอ่านคัมภีร์พระไตรปิฎกภาษาบาลีออนไลน์ของนักศึกษา งบประมาณ 12,500 บาท",
        submitterId: adminUser.id,
        deptCode: "pali_philosophy",
        status: "APPROVED" as const,
        steps: [
          { approverId: adminUser.id, approverRole: "คณบดีคณะพุทธศาสตร์", stepOrder: 1, decision: "APPROVED" as const, comment: "อนุมัติให้ดำเนินการตามระเบียบพัสดุ", decidedAt: new Date() },
        ],
      },
      {
        docNo: "พธ-2570/0003",
        title: "ขออนุมัติจัดซื้อครุภัณฑ์เครื่องขยายเสียงสำหรับอาคารปฏิบัติวิปัสสนาธุระ",
        docType: "PURCHASE_REQ" as const,
        priority: "VERY_URGENT" as const,
        content: "เนื่องด้วยเครื่องขยายเสียงเดิมชำรุดเสียหาย ไม่สามารถรองรับผู้เข้าปฏิบัติธรรมจำนวน 150 ท่านได้ จึงขออนุมัติจัดซื้อชุดเครื่องเสียงทดแทนเร่งด่วน งบประมาณ 24,000 บาท",
        submitterId: staffUser.id,
        deptCode: "meditation_dev",
        status: "SUBMITTED" as const,
        steps: [
          { approverId: adminUser.id, approverRole: "รองคณบดีฝ่ายบริหาร", stepOrder: 1, decision: "PENDING" as const, comment: null, decidedAt: null },
          { approverId: adminUser.id, approverRole: "คณบดีคณะพุทธศาสตร์", stepOrder: 2, decision: "PENDING" as const, comment: null, decidedAt: null },
        ],
      },
    ];

    for (const d of sampleDocs) {
      const doc = await prisma.eDocument.upsert({
        where: { tenantId_docNo: { tenantId: core.tenantId, docNo: d.docNo } },
        update: {
          title: d.title,
          docType: d.docType,
          priority: d.priority,
          content: d.content,
          status: d.status,
          departmentId: deptMap[d.deptCode],
        },
        create: {
          tenantId: core.tenantId,
          docNo: d.docNo,
          title: d.title,
          docType: d.docType,
          priority: d.priority,
          content: d.content,
          submitterId: d.submitterId,
          departmentId: deptMap[d.deptCode],
          status: d.status,
        },
      });

      // Clear and re-create steps for clean idempotent seeding
      await prisma.eDocumentApprovalStep.deleteMany({ where: { documentId: doc.id } });
      for (const s of d.steps) {
        await prisma.eDocumentApprovalStep.create({
          data: {
            tenantId: core.tenantId,
            documentId: doc.id,
            approverId: s.approverId,
            approverRole: s.approverRole,
            stepOrder: s.stepOrder,
            decision: s.decision,
            comment: s.comment,
            decidedAt: s.decidedAt,
          },
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 9. Feature: Reservable Resources & Reservations
  // ---------------------------------------------------------------------------
  const resourcesData = [
    {
      code: "ROOM-AUDITORIUM",
      type: "FACILITY" as const,
      nameTh: "หอประชุมพุทธมณฑล (Mahachula Auditorium)",
      nameEn: "Main Faculty Auditorium",
      capacity: 350,
      location: "อาคารเฉลิมพระเกียรติฯ ชั้น 3",
      amenities: ["เวทีการแสดง", "จอ LED ขนาดใหญ่", "ระบบเสียงสเตอริโอรอบทิศทาง", "ไมโครโฟนไร้สาย 8 ตัว", "ห้องพักรับรอง"],
      imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800",
      seq: 1,
    },
    {
      code: "ROOM-VIP",
      type: "FACILITY" as const,
      nameTh: "ห้องประชุมสภาวิชาการ (Academic Council Room)",
      nameEn: "Executive Meeting Room",
      capacity: 40,
      location: "อาคารสมเด็จพระพุฒาจารย์ ชั้น 2",
      amenities: ["โต๊ะประชุมรูปเกือกม้า", "ไมค์ประจำที่พร้อมกล้องติดตามผู้พูด", "Smart TV 85 นิ้ว", "ระบบ Zoom Room ประชุมทางไกล"],
      imageUrl: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800",
      seq: 2,
    },
    {
      code: "ROOM-MEDITATION",
      type: "FACILITY" as const,
      nameTh: "ศาลาวิปัสสนาธุระ (Vipassana Practice Hall)",
      nameEn: "Meditation Practice Hall",
      capacity: 120,
      location: "เขตปฏิบัติธรรม โซนเงียบสงบ",
      amenities: ["เบาะนั่งสมาธิและอาสนะครบชุด", "ระบบเสียงกระจายทั่วถึง", "เครื่องฟอกอากาศ", "พื้นที่เดินจงกรม"],
      imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800",
      seq: 3,
    },
    {
      code: "VAN-01",
      type: "VEHICLE" as const,
      nameTh: "รถตู้โดยสาร Toyota Commuter (ทะเบียน นข-4521 กทม.)",
      nameEn: "Faculty Van Toyota Commuter (Plate: 4521)",
      capacity: 13,
      location: "จุดจอดรถยนต์คณะ อาคาร 1",
      amenities: ["เครื่องปรับอากาศเย็นฉ่ำ", "เข็มขัดนิรภัยทุกที่นั่ง", "พอร์ตชาร์จ USB", "กล้องหน้ารถและ GPS"],
      imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800",
      seq: 4,
    },
    {
      code: "VAN-02",
      type: "VEHICLE" as const,
      nameTh: "รถตู้รับรองอาคันตุกะพิเศษ VIP (ทะเบียน ฮค-8899 กทม.)",
      nameEn: "VIP Guest Van (Plate: 8899)",
      capacity: 9,
      location: "จุดจอดรถยนต์คณะ อาคาร 1",
      amenities: ["เบาะหนัง Captain Seat นวดไฟฟ้า", "WiFi บนรถ", "ตู้เย็นขนาดเล็ก", "ม่านบังแดดรอบคัน"],
      imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
      seq: 5,
    },
    {
      code: "BUS-01",
      type: "VEHICLE" as const,
      nameTh: "รถบัสปรับอากาศบริการนักศึกษา (ทะเบียน 30-1234 กทม.)",
      nameEn: "Campus Shuttle Bus (Plate: 1234)",
      capacity: 45,
      location: "ลานจอดรถบัส คณะพุทธศาสตร์",
      amenities: ["เครื่องปรับอากาศ", "ไมค์ประกาศ", "พื้นที่เก็บสัมภาระใต้ท้องรถ"],
      imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      seq: 6,
    },
  ];

  const resourceMap: Record<string, string> = {};
  for (const r of resourcesData) {
    const res = await prisma.reservableResource.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: r.code } },
      update: {
        type: r.type,
        nameTh: r.nameTh,
        nameEn: r.nameEn,
        capacity: r.capacity,
        location: r.location,
        amenities: r.amenities,
        imageUrl: r.imageUrl,
        seq: r.seq,
      },
      create: {
        tenantId: core.tenantId,
        code: r.code,
        type: r.type,
        nameTh: r.nameTh,
        nameEn: r.nameEn,
        capacity: r.capacity,
        location: r.location,
        amenities: r.amenities,
        imageUrl: r.imageUrl,
        seq: r.seq,
      },
    });
    resourceMap[r.code] = res.id;
  }

  // Seed Sample Reservations
  const sampleReservations = [
    {
      reservationNo: "RES-2570/0001",
      resourceId: resourceMap["ROOM-VIP"],
      title: "การประชุมคณาจารย์ประจำภาควิชาพระพุทธศาสนา ประจำเดือน",
      applicantName: "พระมหาสมชาย สุทฺธิญาโณ",
      applicantEmail: "somchai@app.local",
      applicantPhone: "081-234-5678",
      departmentName: "ภาควิชาพระพุทธศาสนา",
      userId: adminUser?.id,
      startTime: new Date(Date.now() + 24 * 3600 * 1000), // tomorrow
      endTime: new Date(Date.now() + 27 * 3600 * 1000),
      attendeeCount: 25,
      purpose: "เพื่อพิจารณาแผนการสอนและโครงการบริการวิชาการภาคเรียนใหม่",
      needDriver: false,
      specialRequests: "ขอจัดเตรียมไมโครโฟนตั้งโต๊ะและจอภาพนำเสนอสไลด์",
      status: "APPROVED" as const,
      reviewedById: adminUser?.id,
      reviewedAt: new Date(),
      reviewNote: "อนุมัติเรียบร้อย ได้เตรียมระบบไมโครโฟนและจอภาพให้พร้อมแล้ว",
    },
    {
      reservationNo: "RES-2570/0002",
      resourceId: resourceMap["VAN-01"],
      title: "ขอใช้รถตู้เพื่อนำนิสิตเข้าร่วมงานสัมมนาพระพุทธศาสนานานาชาติ จ.อยุธยา",
      applicantName: "ดร. ปิยะวัฒน์ มงคลศิลป์",
      applicantEmail: "piyawat@app.local",
      applicantPhone: "089-876-5432",
      departmentName: "ภาควิชาภาษาบาลีและสันสกฤต",
      userId: staffUser?.id,
      startTime: new Date(Date.now() + 3 * 24 * 3600 * 1000 + 7 * 3600 * 1000),
      endTime: new Date(Date.now() + 3 * 24 * 3600 * 1000 + 18 * 3600 * 1000),
      attendeeCount: 11,
      purpose: "พานิสิตปริญญาโทเข้าร่วมนำเสนอบทความวิชาการระดับนานาชาติ",
      needDriver: true,
      driverName: "นายประสิทธิ์ ขับขี่ดี",
      specialRequests: "ออกเดินทางเวลา 07:00 น. หน้าอาคาร 1",
      status: "PENDING" as const,
      reviewedById: null,
      reviewedAt: null,
      reviewNote: null,
    },
    {
      reservationNo: "RES-2570/0003",
      resourceId: resourceMap["ROOM-MEDITATION"],
      title: "ขอใช้ศาลาวิปัสสนาธุระจัดกิจกรรมอบรมเจริญสติภาวนาระยะสั้น",
      applicantName: "พระครูปลัดอนันต์ สมาธิโก",
      applicantEmail: "anan@app.local",
      applicantPhone: "086-112-2334",
      departmentName: "ศูนย์พัฒนาการปฏิบัติวิปัสสนาธุระ",
      userId: staffUser?.id,
      startTime: new Date(Date.now() + 5 * 24 * 3600 * 1000 + 13 * 3600 * 1000),
      endTime: new Date(Date.now() + 5 * 24 * 3600 * 1000 + 17 * 3600 * 1000),
      attendeeCount: 80,
      purpose: "อบรมการเจริญสติปัฏฐาน 4 แก่นักศึกษาและประชาชนทั่วไปในวันหยุดสุดสัปดาห์",
      needDriver: false,
      specialRequests: "ขอเปิดเครื่องปรับอากาศและเตรียมเครื่องเสียงพร้อมไมโครโฟนไร้สาย 2 ตัว",
      status: "PENDING" as const,
      reviewedById: null,
      reviewedAt: null,
      reviewNote: null,
    },
  ];

  for (const resv of sampleReservations) {
    if (!resv.resourceId) continue;
    await prisma.resourceReservation.upsert({
      where: {
        tenantId_reservationNo: {
          tenantId: core.tenantId,
          reservationNo: resv.reservationNo,
        },
      },
      update: {
        resourceId: resv.resourceId,
        title: resv.title,
        applicantName: resv.applicantName,
        applicantEmail: resv.applicantEmail,
        applicantPhone: resv.applicantPhone,
        departmentName: resv.departmentName,
        startTime: resv.startTime,
        endTime: resv.endTime,
        attendeeCount: resv.attendeeCount,
        purpose: resv.purpose,
        needDriver: resv.needDriver,
        driverName: resv.driverName,
        specialRequests: resv.specialRequests,
        status: resv.status,
        reviewedById: resv.reviewedById,
        reviewedAt: resv.reviewedAt,
        reviewNote: resv.reviewNote,
      },
      create: {
        tenantId: core.tenantId,
        resourceId: resv.resourceId,
        reservationNo: resv.reservationNo,
        title: resv.title,
        applicantName: resv.applicantName,
        applicantEmail: resv.applicantEmail,
        applicantPhone: resv.applicantPhone,
        departmentName: resv.departmentName,
        userId: resv.userId,
        startTime: resv.startTime,
        endTime: resv.endTime,
        attendeeCount: resv.attendeeCount,
        purpose: resv.purpose,
        needDriver: resv.needDriver,
        driverName: resv.driverName,
        specialRequests: resv.specialRequests,
        status: resv.status,
        reviewedById: resv.reviewedById,
        reviewedAt: resv.reviewedAt,
        reviewNote: resv.reviewNote,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 10. Feature: Meditation Courses & Registrations
  // ---------------------------------------------------------------------------
  const meditationCoursesData = [
    {
      code: "MED-2570/01",
      titleTh: "หลักสูตรอานาปานสติและสติปัฏฐาน 4 สำหรับบุคคลทั่วไป (3 วัน 2 คืน)",
      titleEn: "Mindfulness of Breathing & Four Foundations of Mindfulness (3 Days 2 Nights)",
      format: "RESIDENTIAL" as const,
      level: "BEGINNER" as const,
      startDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() + 12 * 24 * 3600 * 1000),
      location: "ศาลาวิปัสสนาธุระและเรือนพักผู้ปฏิบัติธรรม คณะพุทธศาสตร์",
      maxParticipants: 80,
      instructors: ["พระครูปลัดอนันต์ สมาธิโก", "พระอาจารย์มหาสุเทพ ปภสฺสโร"],
      descriptionTh: "หลักสูตรอบรมการเจริญสติปัฏฐาน 4 ตามแนวพระไตรปิฎก เหมาะสำหรับผู้เริ่มต้นที่ต้องการฝึกการมีสติในชีวิตประจำวัน ปฏิบัติต่อเนื่องในบรรยากาศธรรมชาติอันสงบ",
      descriptionEn: "Introductory retreat focusing on Anapanasati (mindfulness of breath) and mindfulness in daily life, guided by senior meditation masters.",
      schedule: [
        { time: "04:30", activity: "สัญญาณระฆัง ทำวัตรเช้าและเจริญสติ" },
        { time: "07:00", activity: "รับประทานอาหารเช้า" },
        { time: "08:30", activity: "ฟังบรรยายธรรมและสอบอารมณ์" },
        { time: "11:00", activity: "รับประทานอาหารกลางวัน" },
        { time: "13:30", activity: "เดินจงกรมและนั่งสมาธิสลับรอบ" },
        { time: "18:00", activity: "ทำวัตรเย็น สนทนาธรรม" },
        { time: "21:30", activity: "พักผ่อนอย่างมีสติ" },
      ],
      guidelines: [
        "สวมใส่ชุดขาวสุภาพตลอดการอบรม",
        "รักษาศีล 8 อย่างเคร่งครัด",
        "งดเว้นการใช้โทรศัพท์มือถือและอุปกรณ์สื่อสารทุกชนิด",
        "งดพูดคุยคลุกคลีระหว่างการปฏิบัติ (Noble Silence)",
      ],
      feeNote: "ไม่มีค่าลงทะเบียน (สนับสนุนโดยกองทุนวิปัสสนาธุระเพื่อสังคม)",
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
      status: "OPEN" as const,
      seq: 1,
    },
    {
      code: "MED-2570/02",
      titleTh: "คอร์สวิปัสสนากรรมฐานเข้มข้นสำหรับคณาจารย์และนักวิจัย (7 วัน)",
      titleEn: "Intensive Vipassana Retreat for Scholars & Researchers (7 Days)",
      format: "RESIDENTIAL" as const,
      level: "ADVANCED" as const,
      startDate: new Date(Date.now() + 25 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() + 32 * 24 * 3600 * 1000),
      location: "ศูนย์พัฒนาการปฏิบัติวิปัสสนาธุระ โซนกุฏิเดี่ยว",
      maxParticipants: 40,
      instructors: ["พระพรหมบัณฑิต (ศ.ดร.) ที่ปรึกษากิตติมศักดิ์", "พระธรรมวัชรบัณฑิต"],
      descriptionTh: "คอร์สปฏิบัติธรรมเข้มข้นเพื่อพัฒนาปัญญาญาณ การรู้แจ้งรูปนามตามความเป็นจริง เน้นการปฏิบัติเดี่ยวและการสอบอารมณ์แบบตัวต่อตัวทุกวัน",
      descriptionEn: "Intensive 7-day silent retreat designed for scholars, emphasizing vipassana insight meditation and daily individual interviews.",
      schedule: [
        { time: "04:00", activity: "ตื่นนอน เจริญสติภาวนาในกุฏิ" },
        { time: "06:30", activity: "อาหารเช้า" },
        { time: "08:00", activity: "สอบอารมณ์กรรมฐานเดี่ยว" },
        { time: "11:00", activity: "อาหารเพล" },
        { time: "13:00", activity: "เจริญสติภาวนาต่อเนื่อง" },
        { time: "17:00", activity: "ดื่มน้ำปานะ" },
        { time: "18:30", activity: "อบรมธรรมะภาคค่ำ" },
        { time: "22:00", activity: "พักผ่อน" },
      ],
      guidelines: [
        "เข้าสู่ความเงียบสงบอย่างสมบูรณ์ (Noble Silence 100%)",
        "พักกุฏิเดี่ยว ไม่ใช้เครื่องมือสื่อสาร",
        "ผ่านการอบรมขั้นพื้นฐานมาก่อนอย่างน้อย 1 ครั้ง",
      ],
      feeNote: "ไม่มีค่าใช้จ่าย มีอาหารมังสวิรัติและน้ำปานะบริการ",
      imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800",
      status: "OPEN" as const,
      seq: 2,
    },
    {
      code: "MED-2570/03",
      titleTh: "วันแห่งสติ: อบรมการเจริญสติในชีวิตการทำงาน (One-Day Mindfulness for Life)",
      titleEn: "One-Day Mindfulness for Modern Life & Workplace Wellbeing",
      format: "ONE_DAY" as const,
      level: "BEGINNER" as const,
      startDate: new Date(Date.now() + 15 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 3600 * 1000),
      location: "อาคารเรียนรวมพุทธศาสตร์ ชั้น 4",
      maxParticipants: 100,
      instructors: ["ดร. ปิยะวัฒน์ มงคลศิลป์", "แม่ชีชดช้อย ธรรมรักษ์"],
      descriptionTh: "หลักสูตรไป-กลับ 1 วัน เน้นการนำการเจริญสติ (Mindfulness) ไปประยุกต์ใช้ลดความเครียด เพิ่มสมาธิและประสิทธิภาพในการทำงานและการดำเนินชีวิต",
      descriptionEn: "A practical 1-day non-residential workshop on applying Buddhist mindfulness techniques to manage stress and cultivate inner calm.",
      schedule: [
        { time: "08:30", activity: "ลงทะเบียนรับเอกสาร" },
        { time: "09:00", activity: "บรรยาย: ศิลปะแห่งการรู้ตัวในชีวิตประจำวัน" },
        { time: "10:30", activity: "ฝึกสมาธิเบื้องต้นและการผ่อนคลายร่างกาย" },
        { time: "12:00", activity: "รับประทานอาหารกลางวันอย่างมีสติ (Mindful Eating)" },
        { time: "13:30", activity: "โยคะสติและการเจริญสติด้วยการเดิน" },
        { time: "16:00", activity: "ถาม-ตอบ แลกเปลี่ยนประสบการณ์ และปิดการอบรม" },
      ],
      guidelines: [
        "สวมเสื้อผ้าที่ขยับตัวได้สะดวก สุภาพ ไม่จำเป็นต้องเป็นชุดขาว",
        "นำกระบอกน้ำดื่มส่วนตัวมาด้วย",
      ],
      feeNote: "ไม่มีค่าลงทะเบียน รวมอาหารกลางวันและของว่าง",
      imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800",
      status: "OPEN" as const,
      seq: 3,
    },
  ];

  const courseMap: Record<string, string> = {};
  for (const c of meditationCoursesData) {
    const course = await prisma.meditationCourse.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: c.code } },
      update: {
        titleTh: c.titleTh,
        titleEn: c.titleEn,
        format: c.format,
        level: c.level,
        startDate: c.startDate,
        endDate: c.endDate,
        location: c.location,
        maxParticipants: c.maxParticipants,
        instructors: c.instructors,
        descriptionTh: c.descriptionTh,
        descriptionEn: c.descriptionEn,
        schedule: c.schedule,
        guidelines: c.guidelines,
        feeNote: c.feeNote,
        imageUrl: c.imageUrl,
        status: c.status,
        seq: c.seq,
      },
      create: {
        tenantId: core.tenantId,
        code: c.code,
        titleTh: c.titleTh,
        titleEn: c.titleEn,
        format: c.format,
        level: c.level,
        startDate: c.startDate,
        endDate: c.endDate,
        location: c.location,
        maxParticipants: c.maxParticipants,
        instructors: c.instructors,
        descriptionTh: c.descriptionTh,
        descriptionEn: c.descriptionEn,
        schedule: c.schedule,
        guidelines: c.guidelines,
        feeNote: c.feeNote,
        imageUrl: c.imageUrl,
        status: c.status,
        seq: c.seq,
      },
    });
    courseMap[c.code] = course.id;
  }

  // Seed Sample Registrations
  const sampleRegistrations = [
    {
      courseId: courseMap["MED-2570/01"],
      registrationNo: "REG-MED-2570/0001",
      fullNameTh: "นายวิศรุต สันติธรรม",
      fullNameEn: "Mr. Wissarut Santitham",
      nationalId: "1100400123456",
      gender: "MALE",
      age: 32,
      phone: "081-998-7766",
      email: "wissarut@example.com",
      occupation: "วิศวกรซอฟต์แวร์",
      address: "แขวงจตุจักร เขตจตุจักร กรุงเทพฯ",
      emergencyContactName: "นางสมใจ สันติธรรม (มารดา)",
      emergencyContactPhone: "089-111-2233",
      medicalConditions: "ไม่มี",
      dietaryRequirements: "อาหารมังสวิรัติ",
      experience: "เคยฝึกสมาธิเบื้องต้นด้วยตนเอง 1 ปี",
      roomAssigned: "เรือนพักชาย กุฏิ 102",
      status: "CONFIRMED" as const,
      reviewedById: adminUser?.id,
      reviewedAt: new Date(),
      reviewNote: "ยืนยันสิทธิ์เรียบร้อย จัดสรรห้องพักกุฏิ 102 โซนริมธาร",
    },
    {
      courseId: courseMap["MED-2570/01"],
      registrationNo: "REG-MED-2570/0002",
      fullNameTh: "นางสาวศิริพร บุญเจริญ",
      fullNameEn: "Ms. Siriporn Booncharoen",
      nationalId: "3100500987654",
      gender: "FEMALE",
      age: 28,
      phone: "086-554-4332",
      email: "siriporn@example.com",
      occupation: "ครูผู้ช่วย",
      address: "อ.เมือง จ.ปทุมธานี",
      emergencyContactName: "นายประเสริฐ บุญเจริญ (บิดา)",
      emergencyContactPhone: "081-444-5555",
      medicalConditions: "โรคภูมิแพ้อากาศ",
      dietaryRequirements: "ทานได้ทั่วไป",
      experience: "ไม่เคยเข้าคอร์สปฏิบัติธรรมมาก่อน",
      roomAssigned: null,
      status: "PENDING" as const,
      reviewedById: null,
      reviewedAt: null,
      reviewNote: null,
    },
    {
      courseId: courseMap["MED-2570/03"],
      registrationNo: "REG-MED-2570/0003",
      fullNameTh: "ดร. กานดา รัตนมณี",
      fullNameEn: "Dr. Kanda Rattanamanee",
      nationalId: "1100200887766",
      gender: "FEMALE",
      age: 45,
      phone: "083-221-1998",
      email: "kanda@example.com",
      occupation: "อาจารย์มหาวิทยาลัย",
      address: "เขตพญาไท กรุงเทพฯ",
      emergencyContactName: "นายพิชัย รัตนมณี (สามี)",
      emergencyContactPhone: "081-332-2110",
      medicalConditions: "ไม่มี",
      dietaryRequirements: "อาหารเจ",
      experience: "ปฏิบัติธรรมเป็นประจำ",
      roomAssigned: null,
      status: "CONFIRMED" as const,
      reviewedById: adminUser?.id,
      reviewedAt: new Date(),
      reviewNote: "ยืนยันสิทธิ์เข้าร่วมอบรม 1 วัน",
    },
  ];

  for (const reg of sampleRegistrations) {
    if (!reg.courseId) continue;
    await prisma.meditationRegistration.upsert({
      where: {
        tenantId_registrationNo: {
          tenantId: core.tenantId,
          registrationNo: reg.registrationNo,
        },
      },
      update: {
        courseId: reg.courseId,
        fullNameTh: reg.fullNameTh,
        fullNameEn: reg.fullNameEn,
        gender: reg.gender,
        age: reg.age,
        phone: reg.phone,
        email: reg.email,
        occupation: reg.occupation,
        emergencyContactName: reg.emergencyContactName,
        emergencyContactPhone: reg.emergencyContactPhone,
        dietaryRequirements: reg.dietaryRequirements,
        roomAssigned: reg.roomAssigned,
        status: reg.status,
        reviewedById: reg.reviewedById,
        reviewedAt: reg.reviewedAt,
        reviewNote: reg.reviewNote,
      },
      create: {
        tenantId: core.tenantId,
        courseId: reg.courseId,
        registrationNo: reg.registrationNo,
        fullNameTh: reg.fullNameTh,
        fullNameEn: reg.fullNameEn,
        nationalId: reg.nationalId,
        gender: reg.gender,
        age: reg.age,
        phone: reg.phone,
        email: reg.email,
        occupation: reg.occupation,
        address: reg.address,
        emergencyContactName: reg.emergencyContactName,
        emergencyContactPhone: reg.emergencyContactPhone,
        medicalConditions: reg.medicalConditions,
        dietaryRequirements: reg.dietaryRequirements,
        experience: reg.experience,
        roomAssigned: reg.roomAssigned,
        status: reg.status,
        reviewedById: reg.reviewedById,
        reviewedAt: reg.reviewedAt,
        reviewNote: reg.reviewNote,
      },
    });
  }

  // -------------------------------------------------------------------------
  // 7. Seed: Alumni Members & Stories (Feature 7)
  // -------------------------------------------------------------------------
  const sampleAlumni = [
    {
      fullNameTh: "พระครูวิมลธรรมทัศน์",
      fullNameEn: "Phrakhru Vimonthammathat",
      studentId: "5301010023",
      graduationYearBe: 2555,
      degreeLevel: "MASTER" as const,
      majorTh: "สาขาวิชาพระพุทธศาสนา",
      majorEn: "Master of Arts in Buddhist Studies",
      currentWorkplace: "วัดสว่างอารมณ์ และศูนย์การเรียนรู้ชุมชน",
      jobTitle: "เจ้าอาวาส / ประธานศูนย์พัฒนาคุณธรรม",
      phone: "081-443-2211",
      email: "vimon.dhamma@example.org",
      isPublic: true,
      isSpotlight: true,
      spotlightQuoteTh: "ธรรมะคือศาสตร์แห่งการพัฒนาชีวิตและปัญญาอันแท้จริง บัณฑิตพุทธศาสตร์ต้องเป็นผู้นำทางจิตวิญญาณแก่สังคม",
      spotlightQuoteEn: "Dhamma is the authentic science of life transformation and wisdom.",
      avatarUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80",
      status: "VERIFIED" as const,
    },
    {
      fullNameTh: "ศ.ดร.กิตติศักดิ์ เจริญพรหม",
      fullNameEn: "Prof. Dr. Kittisak Charoenprom",
      studentId: "4801020015",
      graduationYearBe: 2550,
      degreeLevel: "DOCTORAL" as const,
      majorTh: "สาขาวิชาปรัชญาและศาสนา",
      majorEn: "Ph.D. in Philosophy and Religion",
      currentWorkplace: "คณะมนุษยศาสตร์และสังคมศาสตร์ มหาวิทยาลัยธรรมศาสตร์",
      jobTitle: "ศาสตราจารย์เกียรติคุณ / ผู้เชี่ยวชาญคัมภีร์พุทธธรรม",
      phone: "089-876-5432",
      email: "kittisak.char@example.ac.th",
      isPublic: true,
      isSpotlight: true,
      spotlightQuoteTh: "รากฐานคัมภีร์พุทธบาลีคือขุมทรัพย์ทางปัญญาที่สามารถนำมาประยุกต์ตอบโจทย์วิกฤตจริยธรรมโลกยุค AI ได้อย่างทรงคุณค่า",
      spotlightQuoteEn: "Pali Buddhist roots provide profound insights that resolve contemporary ethical crises.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      status: "VERIFIED" as const,
    },
    {
      fullNameTh: "ผศ.ดร.อรทัย รักษ์ศิริ",
      fullNameEn: "Asst. Prof. Dr. Orathai Raksiri",
      studentId: "5801030044",
      graduationYearBe: 2561,
      degreeLevel: "MASTER" as const,
      majorTh: "สาขาวิชาสันติศึกษาและพุทธวิธี",
      majorEn: "Master of Arts in Peace Studies",
      currentWorkplace: "สถาบันการทูตและองค์กรความร่วมมือระหว่างประเทศ",
      jobTitle: "นักวิจัยอาวุโสด้านสันติวิธีและการไกล่เกลี่ยข้อพิพาท",
      phone: "084-555-7890",
      email: "orathai.peace@example.org",
      isPublic: true,
      isSpotlight: true,
      spotlightQuoteTh: "การรับฟังด้วยใจที่ไร้อคติและเมตตาธรรม คือกุญแจสำคัญในการคลี่คลายทุกความขัดแย้งของมวลมนุษยชาติ",
      spotlightQuoteEn: "Empathetic listening and loving-kindness resolve deep-seated human conflicts.",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      status: "VERIFIED" as const,
    },
    {
      fullNameTh: "นายฐิติวัฒน์ วาจาสัจจะ",
      fullNameEn: "Mr. Thitiwat Vajasajja",
      studentId: "6001040089",
      graduationYearBe: 2563,
      degreeLevel: "BACHELOR" as const,
      majorTh: "สาขาวิชาพุทธจิตวิทยา",
      majorEn: "Bachelor of Arts in Buddhist Psychology",
      currentWorkplace: "Mind Wellness Center Thailand",
      jobTitle: "นักจิตวิทยาการปรึกษา / ที่ปรึกษาองค์กรด้าน Well-being",
      phone: "086-123-9988",
      email: "thitiwat.mind@example.com",
      isPublic: true,
      isSpotlight: false,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      status: "VERIFIED" as const,
    },
    {
      fullNameTh: "พระมหาพงศ์พันธุ์ ธมฺมโชโต",
      fullNameEn: "Phra Maha Pongphan Dhammachoto",
      studentId: "6201010052",
      graduationYearBe: 2565,
      degreeLevel: "BACHELOR" as const,
      majorTh: "สาขาวิชาภาษาบาลีและพุทธศาสนา",
      majorEn: "Bachelor of Arts in Pali and Buddhist Studies",
      currentWorkplace: "สำนักเรียนพระปริยัติธรรม วัดเบญจมบพิตรดุสิตวนาราม",
      jobTitle: "อาจารย์ใหญ่ฝ่ายบาลีศึกษา / พระธรรมทูต",
      phone: "082-998-1144",
      email: "pongphan.pali@example.org",
      isPublic: true,
      isSpotlight: false,
      avatarUrl: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80",
      status: "VERIFIED" as const,
    },
  ];

  for (const m of sampleAlumni) {
    const existing = await prisma.alumniMember.findFirst({
      where: { tenantId: core.tenantId, fullNameTh: m.fullNameTh },
    });
    if (!existing) {
      await prisma.alumniMember.create({
        data: {
          tenantId: core.tenantId,
          ...m,
        },
      });
    }
  }

  const sampleStories = [
    {
      titleTh: "จากบัณฑิตพุทธศาสตร์ สู่การขับเคลื่อนสันติภาพในระดับสากล",
      titleEn: "From Buddhism Graduate to International Peace Mediator",
      alumniName: "ผศ.ดร.อรทัย รักษ์ศิริ",
      graduationYearBe: 2561,
      degreeLevel: "MASTER" as const,
      summaryTh: "เรื่องราวของศิษย์เก่าผู้ผสานพุทธสันติวิธีและหลักอหิงสา เข้ากับการเจรจาไกล่เกลี่ยความขัดแย้งในเวทีระดับนานาชาติ",
      summaryEn: "How Buddhist peace methods and non-violence principles are applied to mediate international conflicts.",
      contentTh: "ผศ.ดร.อรทัย รักษ์ศิริ ได้นำหลักการสื่อสารด้วยสติ (Mindful Communication) และอหิงสธรรมที่ได้ศึกษาจากคณะพุทธศาสตร์ ไปประยุกต์ใช้ในการฝึกอบรมนักการทูตและองค์กรภาคประชาสังคม...",
      contentEn: "Dr. Orathai integrated mindful communication and non-violence learned from the Faculty into international diplomacy workshops...",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
      published: true,
      seq: 1,
    },
    {
      titleTh: "การบูรณาการหลักไตรสิกขากับงานบริหารจัดการองค์กรและชุมชน",
      titleEn: "Integrating Trisikkha with Modern Community & Organizational Management",
      alumniName: "พระครูวิมลธรรมทัศน์",
      graduationYearBe: 2555,
      degreeLevel: "MASTER" as const,
      summaryTh: "ต้นแบบการพัฒนาชุมชนอย่างยั่งยืน ด้วยการนำศีล สมาธิ ปัญญา มาเป็นแกนกลางสร้างสัมมาชีพและความสมานฉันท์",
      summaryEn: "A sustainable community development model integrating Morality, Concentration, and Wisdom.",
      contentTh: "ศูนย์การเรียนรู้ชุมชนที่ก่อตั้งโดยพระครูวิมลธรรมทัศน์ ได้สร้างงานสร้างอาชีพให้แก่ชาวบ้านกว่า 500 ครัวเรือน...",
      contentEn: "The community center founded by Phrakhru Vimonthammathat has empowered over 500 local households...",
      imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
      published: true,
      seq: 2,
    },
    {
      titleTh: "บทบาทนักจิตวิทยาแนวพุทธ ในการดูแลสุขภาพใจคนรุ่นใหม่",
      titleEn: "Buddhist Psychological Counseling: Healing Modern Minds",
      alumniName: "นายฐิติวัฒน์ วาจาสัจจะ",
      graduationYearBe: 2563,
      degreeLevel: "BACHELOR" as const,
      summaryTh: "การผสมผสานเทคนิคจิตบำบัดสมัยใหม่เข้ากับอานาปานสติ เพื่อบำบัดภาวะหมดไฟ (Burnout) และโรคซึมเศร้าในคนทำงาน",
      summaryEn: "Combining contemporary psychotherapy with mindfulness of breathing to combat burnout and depression.",
      contentTh: "นายฐิติวัฒน์ วาจาสัจจะ ประยุกต์ใช้การเจริญสติแบบรู้ทันความคิด (Metacognition) ช่วยฟื้นฟูสุขภาพจิตคนรุ่นใหม่...",
      contentEn: "Mr. Thitiwat applies Buddhist metacognitive awareness to restore mental wellness for corporate workforces...",
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
      published: true,
      seq: 3,
    },
  ];

  for (const s of sampleStories) {
    const existing = await prisma.alumniStory.findFirst({
      where: { tenantId: core.tenantId, titleTh: s.titleTh },
    });
    if (!existing) {
      await prisma.alumniStory.create({
        data: {
          tenantId: core.tenantId,
          ...s,
        },
      });
    }
  }

  console.log(`[seed] เสร็จ — login: admin@app.local / ${DEV_PASSWORD}`);
}

main().finally(() => prisma.$disconnect());
