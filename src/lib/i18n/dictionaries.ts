import * as contentId from "./content_id";
import * as contentEn from "./content_en";
import * as contentZh from "./content_zh";

export type Language = "id" | "en" | "zh-CN";

const commonLabelsId = {
  // Navigation
  consultNow: "Konsultasi Sekarang",
  chatWa: "Chat WhatsApp",
  programs: "Program",
  
  // Package Cards
  included: "Termasuk:",
  bisaCustomized: "*(Bisa Customized, silahkan diskusi dengan admin)",
  popular: "Populer",
  
  // Hero
  trustBadge: "Les Privat • Homeschooling • Pendampingan ABK",
  personalApproach: "Pendekatan personal",
  experiencedTeachers: "Guru sabar & berpengalaman",
  coverageAreas: "Jakarta Utara, Pusat, Timur",

  // Hero badges
  trusted: "Dipercaya",
  parentsInJkt: "Orang Tua di Jakarta",
  personal: "Personal",
  andFun: "& Menyenangkan",
  

  // Sections
  whyChooseUs: "Kenapa Memilih Kami?",
  serviceAreas: "Area Layanan Kami",
  ourGallery: "Galeri Belajar",
  howToRegister: "Cara Mendaftar",
  founderTitle: "Pendiri MSA Education",
  testimonialsTitle: "Testimoni Orang Tua",
  faqTitle: "FAQ",
  contactUs: "Hubungi Kami",
  
  // Contact Form
  fullName: "Nama Lengkap",
  childAge: "Usia / Kelas Anak",
  phoneNumber: "Nomor WhatsApp",
  messageOptions: "Program yang Diminati",
  selectProgram: "Pilih Program...",
  sendToWa: "Kirim via WhatsApp",
  
  // Others
  month: "/bulan",
  contactAdmin: "Hubungi Admin",
  seeAllAreas: "Lihat Seluruh Area Layanan",
  watchVideo: "Tonton Video"
};

const commonLabelsEn = {
  // Navigation
  consultNow: "Consult Now",
  chatWa: "WhatsApp Chat",
  programs: "Programs",
  
  // Package Cards
  included: "Included:",
  bisaCustomized: "*(Customizable, please discuss with admin)",
  popular: "Popular",
  
  // Hero
  trustBadge: "Private Tutoring • Homeschooling • Special Needs",
  personalApproach: "Personalized approach",
  experiencedTeachers: "Patient & experienced teachers",
  coverageAreas: "North, Central, East Jakarta",

  // Hero badges
  trusted: "Trusted",
  parentsInJkt: "Parents in Jakarta",
  personal: "Personal",
  andFun: "& Fun",

  // Sections
  whyChooseUs: "Why Choose Us?",
  serviceAreas: "Our Service Areas",
  ourGallery: "Learning Gallery",
  howToRegister: "How to Register",
  founderTitle: "Founder of MSA Education",
  testimonialsTitle: "Parent Testimonials",
  faqTitle: "FAQ",
  contactUs: "Contact Us",
  
  // Contact Form
  fullName: "Full Name",
  childAge: "Child's Age / Grade",
  phoneNumber: "WhatsApp Number",
  messageOptions: "Program of Interest",
  selectProgram: "Select Program...",
  sendToWa: "Send via WhatsApp",
  
  // Others
  month: "/month",
  contactAdmin: "Contact Admin",
  seeAllAreas: "View All Service Areas",
  watchVideo: "Watch Video"
};

const commonLabelsZh = {
  // Navigation
  consultNow: "立即咨询",
  chatWa: "WhatsApp 聊天",
  programs: "课程项目",
  
  // Package Cards
  included: "包含内容：",
  bisaCustomized: "*(可定制，请联系管理员)",
  popular: "热门",
  
  // Hero
  trustBadge: "私人辅导 • 家庭教育 • 特殊需要教育",
  personalApproach: "个性化教学",
  experiencedTeachers: "耐心且经验丰富的教师",
  coverageAreas: "雅加达北部、中部、东部",

  // Hero badges
  trusted: "深受信任",
  parentsInJkt: "雅加达家长",
  personal: "个性化",
  andFun: "且充满乐趣",

  // Sections
  whyChooseUs: "为什么选择我们？",
  serviceAreas: "我们的服务区域",
  ourGallery: "学习图库",
  howToRegister: "如何报名",
  founderTitle: "MSA Education 创始人",
  testimonialsTitle: "家长评价",
  faqTitle: "常见问题 (FAQ)",
  contactUs: "联系我们",
  
  // Contact Form
  fullName: "姓名",
  childAge: "孩子年龄/年级",
  phoneNumber: "WhatsApp 号码",
  messageOptions: "感兴趣的项目",
  selectProgram: "选择项目...",
  sendToWa: "通过 WhatsApp 发送",
  
  // Others
  month: "/月",
  contactAdmin: "联系管理员",
  seeAllAreas: "查看所有服务区域",
  watchVideo: "观看视频"
};

export const dictionaries: Record<Language, any> = {
  id: {
    ...contentId,
    ui: commonLabelsId
  },
  en: {
    ...contentEn,
    ui: commonLabelsEn
  },
  "zh-CN": {
    ...contentZh,
    ui: commonLabelsZh
  }
};

export type TranslationType = typeof dictionaries.id;
