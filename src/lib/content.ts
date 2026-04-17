// ============================================================
// MSA Education - Central Content Configuration
// ============================================================
// Edit this file to update all website content.
// All text, links, images, and data are centralized here.
// ============================================================

// ---- CONTACT & BUSINESS INFO ----
export const contactInfo = {
  whatsapp: "6281297212113",
  whatsappDisplay: "0812-9721-2113",
  whatsappLink: "https://wa.me/6281297212113",
  email: "[EMAIL_ADDRESS]",
  address: "[BUSINESS_ADDRESS]",
  googleMapsEmbed: "[GOOGLE_MAPS_EMBED_URL]",
  brandName: "MSA Education",
  tagline: "Pendampingan Belajar yang Hangat, Personal, dan Bermakna",
};

// ---- FOUNDER INFO ----
export const founderInfo = {
  name: "Miss Sita",
  photo: "/images/founder.jpg", // Replace with actual photo
  role: "Pendiri & Pendidik Utama",
  bio: "Dengan latar belakang pendidikan dan pengalaman mengajar anak-anak dari berbagai usia dan kebutuhan belajar, MSA Education didirikan dengan satu tujuan sederhana: membantu setiap anak belajar dengan cara yang paling sesuai untuknya. Kami percaya bahwa setiap anak istimewa dan berhak mendapatkan pendampingan yang sabar, hangat, dan penuh perhatian.",
  philosophy:
    "Setiap anak memiliki ritme belajarnya sendiri. Tugas kita bukan memaksa mereka berlari, melainkan menemani mereka melangkah — dengan sabar, hangat, dan penuh makna.",
  values: [
    "Sabar dalam setiap proses belajar",
    "Personal dan penuh perhatian",
    "Hangat seperti keluarga",
    "Bertahap sesuai kemampuan anak",
    "Suportif dan tidak menghakimi",
  ],
};

// ---- HERO SECTION ----
export const heroContent = {
  headline: "Belajar Jadi Lebih Bermakna dengan Pendampingan yang Tepat",
  subheadline:
    "Les privat, homeschooling, dan pendampingan belajar anak berkebutuhan khusus — dengan pendekatan personal, hangat, dan menyenangkan untuk anak usia Toddler hingga SD.",
  ctaPrimary: "Konsultasi Sekarang",
  ctaSecondary: "Lihat Program",
  heroImage: "/images/hero-child-learning.jpg",
};

// ---- TRUST / WHY MSA SECTION ----
export const trustHighlights = [
  {
    icon: "Heart",
    title: "Pendekatan Personal",
    description:
      "Setiap anak mendapatkan perhatian penuh dan metode belajar yang disesuaikan dengan keunikan mereka.",
  },
  {
    icon: "Sparkles",
    title: "Belajar Sesuai Kebutuhan",
    description:
      "Program dirancang berdasarkan kebutuhan, minat, dan kecepatan belajar masing-masing anak.",
  },
  {
    icon: "Sun",
    title: "Suasana Hangat & Menyenangkan",
    description:
      "Belajar dalam suasana yang nyaman, tanpa tekanan, dan dipenuhi semangat positif.",
  },
  {
    icon: "MessageCircleHeart",
    title: "Komunikasi dengan Orang Tua",
    description:
      "Orang tua selalu mendapat update perkembangan belajar anak secara berkala dan transparan.",
  },
  {
    icon: "ShieldCheck",
    title: "Fokus Perkembangan & Kenyamanan",
    description:
      "Prioritas utama kami adalah perkembangan holistik dan kenyamanan anak saat belajar.",
  },
  {
    icon: "Users",
    title: "Inklusif & Mendukung",
    description:
      "Kami menyambut semua anak, termasuk anak berkebutuhan khusus, dengan pendekatan yang penuh pengertian.",
  },
];

// ---- SERVICES ----
export const services = [
  {
    id: "les-privat",
    icon: "BookOpen",
    title: "Les Privat / Tutoring",
    shortDescription:
      "Pendampingan belajar personal di rumah untuk anak usia Toddler hingga SD, dengan kurikulum yang disesuaikan.",
    forWhom: "Anak usia Toddler, TK, dan SD Kelas 1-6",
    benefits: [
      "Belajar satu-satu dengan guru yang sabar",
      "Materi disesuaikan dengan kebutuhan anak",
      "Jadwal fleksibel sesuai waktu keluarga",
      "Fokus pada pemahaman, bukan sekadar menghafal",
      "Laporan perkembangan berkala",
    ],
    activities: [
      "Pendampingan membaca, menulis, berhitung",
      "Bantuan pekerjaan rumah (PR)",
      "Latihan soal dan persiapan ulangan",
      "Pembelajaran tematik dan kreatif",
      "Stimulasi minat belajar anak",
    ],
    cta: "Konsultasi Les Privat",
    fullDescription:
      "Les privat MSA Education hadir langsung ke rumah Anda, memberikan pendampingan belajar yang personal dan nyaman. Guru kami tidak hanya mengajar materi pelajaran, tetapi juga membangun hubungan yang hangat dengan anak agar proses belajar terasa menyenangkan dan bermakna.",
    image: "/images/service-tutoring.jpg",
  },
  {
    id: "homeschooling",
    icon: "Home",
    title: "Homeschooling Support",
    shortDescription:
      "Dukungan belajar terstruktur untuk keluarga yang memilih jalur homeschooling, dengan pendekatan yang fleksibel.",
    forWhom: "Keluarga homeschooling dengan anak usia TK dan SD",
    benefits: [
      "Kurikulum fleksibel sesuai visi keluarga",
      "Pendampingan akademik terstruktur",
      "Membantu orang tua mengelola materi belajar",
      "Evaluasi berkala untuk memantau kemajuan",
      "Lingkungan belajar yang nyaman di rumah",
    ],
    activities: [
      "Penyusunan rencana belajar mingguan",
      "Pembelajaran tematik dan project-based",
      "Pendampingan calistung dan akademik dasar",
      "Pengembangan keterampilan sosial dan emosional",
      "Dokumentasi dan portofolio belajar",
    ],
    cta: "Konsultasi Homeschooling",
    fullDescription:
      "Kami memahami bahwa setiap keluarga homeschooling memiliki alasan dan pendekatan yang unik. MSA Education hadir untuk mendukung perjalanan belajar anak di rumah dengan program yang terstruktur namun tetap fleksibel, sesuai dengan nilai dan kebutuhan keluarga.",
    image: "/images/service-homeschooling.jpg",
  },
  {
    id: "pendampingan-abk",
    icon: "HeartHandshake",
    title: "Pendampingan Belajar Anak Berkebutuhan Khusus",
    shortDescription:
      "Dukungan belajar yang disesuaikan untuk anak berkebutuhan khusus (ABK), dengan pendekatan sabar, bertahap, dan penuh perhatian.",
    forWhom:
      "Anak berkebutuhan khusus usia Toddler hingga SD yang membutuhkan pendampingan belajar personal",
    benefits: [
      "Pendekatan individual sesuai kebutuhan anak",
      "Guru yang sabar dan terlatih",
      "Program belajar yang fleksibel dan bertahap",
      "Fokus pada kenyamanan dan keamanan anak",
      "Komunikasi rutin dengan orang tua",
    ],
    activities: [
      "Stimulasi belajar sesuai tahap perkembangan",
      "Aktivitas belajar yang menyenangkan dan mendukung",
      "Latihan keterampilan dasar akademik",
      "Pengembangan kemandirian belajar",
      "Aktivitas yang mendukung fokus dan konsentrasi",
    ],
    cta: "Konsultasi Pendampingan ABK",
    fullDescription:
      "Setiap anak berhak mendapatkan pendampingan belajar yang sesuai dengan kebutuhannya. MSA Education menyediakan dukungan belajar yang dirancang khusus untuk anak berkebutuhan khusus, dengan pendekatan yang sabar, hangat, dan penuh pengertian. Kami fokus pada kenyamanan anak dan bekerja sama erat dengan orang tua untuk memastikan setiap langkah belajar bermakna.",
    image: "/images/service-abk-support.jpg",
  },
];

// ---- AGE GROUPS ----
export const ageGroups = [
  {
    id: "toddler",
    label: "Toddler",
    ageRange: "1.5 - 3 tahun",
    icon: "Baby",
    color: "peach",
    description:
      "Stimulasi awal melalui bermain, eksplorasi, dan interaksi yang hangat untuk membangun fondasi belajar yang kuat.",
    approach:
      "Bermain sambil belajar dengan pendekatan sensorik dan motorik yang menyenangkan.",
    image: "/images/age-toddler.jpg",
  },
  {
    id: "tk",
    label: "TK",
    ageRange: "4 - 6 tahun",
    icon: "Palette",
    color: "mint",
    description:
      "Persiapan sekolah yang menyenangkan — membaca, menulis, berhitung, dan keterampilan sosial dasar.",
    approach:
      "Belajar terstruktur namun tetap menyenangkan, dengan aktivitas kreatif dan eksplorasi.",
    image: "/images/age-tk.jpg",
  },
  {
    id: "sd-1-3",
    label: "SD Kelas 1-3",
    ageRange: "6 - 9 tahun",
    icon: "BookOpen",
    color: "sky",
    description:
      "Pendampingan akademik dasar yang solid — membangun kebiasaan belajar yang baik dan pemahaman konsep.",
    approach:
      "Fokus pada pemahaman, bukan menghafal. Membangun rasa percaya diri dan kemandirian belajar.",
    image: "/images/age-sd-lower.jpg",
  },
  {
    id: "sd-4-6",
    label: "SD Kelas 4-6",
    ageRange: "9 - 12 tahun",
    icon: "GraduationCap",
    color: "yellow",
    description:
      "Penguatan materi akademik yang lebih dalam, bantuan PR, dan persiapan untuk jenjang berikutnya.",
    approach:
      "Pendampingan intensif dengan evaluasi berkala, target belajar, dan komunikasi aktif dengan orang tua.",
    image: "/images/age-sd-upper.jpg",
  },
];

// ---- HOW IT WORKS ----
export const howItWorks = [
  {
    step: 1,
    icon: "MessageSquare",
    title: "Konsultasi Kebutuhan Anak",
    description:
      "Orang tua berbagi tentang kebutuhan, karakter, dan harapan belajar anak melalui konsultasi awal.",
  },
  {
    step: 2,
    icon: "ClipboardList",
    title: "Penyesuaian Program Belajar",
    description:
      "Kami menyusun program belajar yang disesuaikan dengan kebutuhan dan kondisi anak.",
  },
  {
    step: 3,
    icon: "BookHeart",
    title: "Pendampingan Belajar",
    description:
      "Guru pendamping hadir ke rumah dengan pendekatan yang hangat, sabar, dan menyenangkan.",
  },
  {
    step: 4,
    icon: "BarChart3",
    title: "Evaluasi & Komunikasi Berkala",
    description:
      "Orang tua mendapat laporan perkembangan dan evaluasi secara berkala untuk memastikan progres anak.",
  },
];

// ---- PRICING / PACKAGES ----
export const pricingPackages = [
  {
    id: "tumbuh-ceria",
    name: "Paket Tumbuh Ceria",
    target: "Toddler / TK",
    frequency: "1x tatap muka/minggu",
    duration: "60 menit",
    focus:
      "Stimulasi belajar awal, bermain sambil belajar, kesiapan sekolah",
    price: "Rp 600.000",
    period: "/ bulan",
    features: [
      "Stimulasi belajar awal",
      "Bermain sambil belajar",
      "Kesiapan sekolah",
      "Pendekatan sensorik & motorik",
      "Laporan perkembangan",
    ],
    highlighted: false,
    cta: "Pilih Paket Ini",
    color: "peach",
  },
  {
    id: "pintar-bertumbuh-tk",
    name: "Paket Pintar Bertumbuh TK",
    target: "TK / Pra-SD",
    frequency: "2x tatap muka/minggu",
    duration: "60 menit",
    focus:
      "Pendampingan calistung, persiapan masuk SD, pemahaman dasar konsep",
    price: "Rp 1.200.000",
    period: "/ bulan",
    features: [
      "Pendampingan calistung",
      "Pemahaman konsep dasar",
      "Persiapan masuk SD",
      "Evaluasi berkala",
      "Komunikasi dengan orang tua",
    ],
    highlighted: true,
    cta: "Pilih Paket Ini",
    color: "sky",
  },
  {
    id: "pintar-bertumbuh-sd",
    name: "Paket Pintar Bertumbuh SD",
    target: "SD Kelas 1-6",
    frequency: "2x tatap muka/minggu",
    duration: "60 menit",
    focus:
      "Pendampingan akademik SD, bantuan PR, pemahaman materi sekolah",
    price: "Rp 1.600.000",
    period: "/ bulan",
    features: [
      "Pendampingan akademik SD",
      "Bantuan PR & tugas sekolah",
      "Pemahaman materi pelajaran",
      "Evaluasi & laporan berkala",
      "Komunikasi dengan orang tua",
    ],
    highlighted: true,
    cta: "Pilih Paket Ini",
    color: "sky",
  },
  {
    id: "fokus-prestasi",
    name: "Paket Fokus Prestasi",
    target: "SD Kelas 1-6",
    frequency: "3x tatap muka/minggu",
    duration: "60 menit",
    focus: "Akademik lebih intensif, PR, evaluasi berkala, target belajar",
    price: "Rp 2.400.000",
    period: "/ bulan",
    features: [
      "Akademik lebih intensif",
      "Bantuan PR & latihan soal",
      "Evaluasi berkala & target",
      "Persiapan ulangan",
      "Laporan bulanan lengkap",
    ],
    highlighted: false,
    cta: "Pilih Paket Ini",
    color: "mint",
  },
  {
    id: "pendampingan-personal",
    name: "Paket Pendampingan Personal",
    target: "Kebutuhan Khusus / Fleksibel",
    frequency: "Jadwal fleksibel",
    duration: "Disesuaikan",
    focus:
      "Program sesuai kebutuhan anak dan hasil konsultasi, termasuk pendampingan anak berkebutuhan khusus",
    price: "Hubungi Admin",
    period: "",
    features: [
      "Program sepenuhnya personal",
      "Jadwal & durasi fleksibel",
      "Pendekatan individual",
      "Termasuk pendampingan ABK",
      "Konsultasi mendalam",
    ],
    highlighted: false,
    cta: "Konsultasi Sekarang",
    color: "yellow",
  },
];

export const pricingNote =
  "* Waktu dan harga tidak mengikat, bisa konsultasi dengan admin/tutor/pembimbing langsung dan bisa fleksibel sesuai kebutuhan anak / orang tua.";

// ---- SERVICE AREAS ----
export const serviceAreas = [
  {
    name: "Jakarta Utara",
    description:
      "Melayani area Sunter, Kelapa Gading, Tanjung Priok, Koja, dan sekitarnya.",
    icon: "MapPin",
  },
  {
    name: "Jakarta Pusat",
    description:
      "Melayani area Cempaka Putih, Kemayoran, Senen, Menteng, dan sekitarnya.",
    icon: "MapPin",
  },
  {
    name: "Jakarta Timur",
    description:
      "Melayani area Pulomas, Rawamangun, Cakung, Duren Sawit, dan sekitarnya.",
    icon: "MapPin",
  },
];

// ---- GALLERY ----
export const galleryItems = [
  { id: 1, src: "/images/uploaded/photo-1.jpeg", alt: "Momen Belajar", caption: "Momen Belajar" },
  { id: 2, src: "/images/uploaded/photo-2.jpeg", alt: "Keseruan Belajar", caption: "Keseruan Belajar" },
  { id: 3, src: "/images/uploaded/photo-3.jpeg", alt: "Aktivitas Menyenangkan", caption: "Aktivitas Menyenangkan" },
  { id: 4, src: "/images/uploaded/photo-4.jpeg", alt: "Kebersamaan", caption: "Kebersamaan" },
  { id: 5, src: "/images/uploaded/photo-5.jpeg", alt: "Belajar Interaktif", caption: "Belajar Interaktif" },
  { id: 6, src: "/images/uploaded/photo-6.jpeg", alt: "Antusiasme Belajar", caption: "Antusiasme Belajar" },
  { id: 7, src: "/images/uploaded/photo-7.jpeg", alt: "Fokus Belajar", caption: "Fokus Belajar" },
  { id: 8, src: "/images/uploaded/photo-8.jpeg", alt: "Lingkungan Mendukung", caption: "Lingkungan Mendukung" },
  { id: 9, src: "/images/uploaded/photo-9.jpeg", alt: "Keceriaan Anak", caption: "Keceriaan Anak" },
  { id: 10, src: "/images/uploaded/photo-10.jpeg", alt: "Pendekatan Personal", caption: "Pendekatan Personal" },
  { id: 11, src: "/images/uploaded/photo-11.jpeg", alt: "Berkembang Bersama", caption: "Berkembang Bersama" },
];

// ---- VIDEO EMBEDS ----
export const videoEmbeds = [
  {
    id: 1,
    title: "Mengenal MSA Education",
    embedUrl: "/videos/MSA__Pendekatan_Personal.mp4",
    thumbnail: "/images/video-thumb-1.jpg",
  },
  {
    id: 2,
    title: "Kosakata Rumah - Mempelajari Bagian-Bagian Rumah untuk Anak-Anak",
    embedUrl: "https://www.youtube.com/embed/uGw2aFLry0s",
    thumbnail: "/images/video-thumb-2.jpg",
  },
];

// ---- TESTIMONIALS ----
export const testimonials = [
  {
    id: 1,
    name: "Ibu Sarah",
    childLevel: "Anak TK B",
    quote:
      "Anak saya jadi lebih semangat belajar sejak didampingi MSA Education. Gurunya sangat sabar dan cara mengajarnya kreatif. Sekarang anak saya sudah mulai bisa membaca sendiri!",
    avatar: "/images/testimonials/avatar-1.jpg",
  },
  {
    id: 2,
    name: "Ibu Dewi",
    childLevel: "Anak SD Kelas 2",
    quote:
      "Sebagai orang tua yang memilih homeschooling, kami merasa sangat terbantu dengan pendampingan dari MSA Education. Programnya terstruktur tapi tetap fleksibel sesuai kebutuhan kami.",
    avatar: "/images/testimonials/avatar-2.jpg",
  },
  {
    id: 3,
    name: "Bapak Rizal",
    childLevel: "Anak Berkebutuhan Khusus, usia 7 tahun",
    quote:
      "Kami sangat bersyukur menemukan MSA Education. Pendekatannya sangat personal dan penuh pengertian. Anak kami merasa nyaman dan senang saat belajar, itu yang paling penting bagi kami.",
    avatar: "/images/testimonials/avatar-3.jpg",
  },
  {
    id: 4,
    name: "Ibu Anita",
    childLevel: "Anak SD Kelas 5",
    quote:
      "Nilai anak saya di sekolah meningkat, tapi yang lebih penting, dia jadi lebih percaya diri dan tidak takut bertanya. Guru dari MSA Education benar-benar membuat belajar jadi menyenangkan.",
    avatar: "/images/testimonials/avatar-4.jpg",
  },
];

// ---- FAQ ----
export const faqItems = [
  {
    question: "Anak saya cocok ikut program yang mana?",
    answer:
      "Kami akan membantu menentukan program yang paling sesuai melalui konsultasi awal. Setiap anak memiliki kebutuhan yang berbeda, dan kami akan menyesuaikan program berdasarkan usia, kemampuan, dan tujuan belajar anak.",
  },
  {
    question: "Apakah menerima anak usia toddler?",
    answer:
      "Ya, kami menerima anak usia toddler mulai dari 1.5 tahun. Program untuk toddler difokuskan pada stimulasi belajar awal melalui bermain, eksplorasi, dan aktivitas sensorik yang menyenangkan.",
  },
  {
    question: "Apakah MSA Education menerima anak berkebutuhan khusus?",
    answer:
      "Tentu. Kami dengan senang hati mendampingi anak berkebutuhan khusus (ABK) dalam proses belajarnya. Pendekatan kami bersifat individual, sabar, dan disesuaikan dengan kebutuhan serta kenyamanan anak.",
  },
  {
    question: "Apakah program bisa disesuaikan dengan kebutuhan anak?",
    answer:
      "Sangat bisa. Semua program MSA Education dirancang untuk bisa disesuaikan. Setelah konsultasi awal, kami akan menyusun rencana belajar yang sesuai dengan kondisi dan kebutuhan anak.",
  },
  {
    question: "Area layanan di mana saja?",
    answer:
      "Saat ini kami melayani area Jakarta Utara, Jakarta Pusat, dan Jakarta Timur. Untuk informasi lebih detail mengenai area cakupan, silakan hubungi kami.",
  },
  {
    question: "Bagaimana cara konsultasi?",
    answer:
      "Anda bisa menghubungi kami melalui WhatsApp atau mengisi formulir kontak di website ini. Tim kami akan segera merespons untuk menjadwalkan konsultasi awal.",
  },
  {
    question:
      "Apakah tersedia sesi awal atau konsultasi terlebih dahulu?",
    answer:
      "Ya, kami menyediakan konsultasi awal untuk memahami kebutuhan anak dan keluarga. Konsultasi ini membantu kami menyusun program yang paling tepat untuk anak Anda.",
  },
];

// ---- INCLUSIVE / ABK SECTION ----
export const inclusiveSection = {
  title: "Pendampingan Belajar yang Inklusif",
  subtitle:
    "Setiap anak berhak belajar dengan cara yang paling sesuai untuknya",
  description:
    "MSA Education berkomitmen untuk memberikan dukungan belajar yang hangat dan personal bagi semua anak, termasuk anak berkebutuhan khusus. Kami percaya bahwa dengan pendekatan yang tepat, lingkungan yang nyaman, dan guru yang sabar, setiap anak dapat berkembang sesuai kemampuannya.",
  highlights: [
    {
      icon: "Puzzle",
      title: "Pembelajaran yang Disesuaikan",
      description:
        "Setiap program dirancang khusus berdasarkan kebutuhan, kemampuan, dan kenyamanan anak.",
    },
    {
      icon: "Flower2",
      title: "Pendekatan Sabar & Bertahap",
      description:
        "Kami memahami bahwa setiap anak memiliki ritme belajarnya sendiri. Tidak ada tekanan, hanya dukungan.",
    },
    {
      icon: "MessageCircleHeart",
      title: "Komunikasi dengan Orang Tua",
      description:
        "Kami bekerja sama erat dengan orang tua untuk memastikan setiap langkah belajar bermakna dan sesuai harapan.",
    },
    {
      icon: "Shield",
      title: "Kenyamanan Anak Saat Belajar",
      description:
        "Lingkungan belajar yang aman dan nyaman adalah prioritas utama kami.",
    },
    {
      icon: "Sprout",
      title: "Mendukung Perkembangan Anak",
      description:
        "Aktivitas belajar yang dirancang untuk mendukung perkembangan kognitif, sosial, dan emosional anak.",
    },
  ],
};

// ---- CTA LABELS ----
export const ctaLabels = {
  consultNow: "Konsultasi Sekarang",
  chatWhatsApp: "Chat WhatsApp",
  registerConsultation: "Daftar Konsultasi",
  contactMSA: "Hubungi MSA Education",
  viewPrograms: "Lihat Program",
  consultChildNeeds: "Konsultasikan Kebutuhan Anak",
};

// ---- NAVIGATION ----
export const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Tentang Kami", href: "/tentang" },
  { label: "Program", href: "/program" },
  { label: "Area Layanan", href: "/area" },
  { label: "Chat", href: "WHATSAPP_LINK", isExternal: true },
];

// ---- SEO ----
export const seoConfig = {
  siteName: "MSA Education",
  defaultTitle:
    "MSA Education — Mindful. Supportive. Adaptive. | Les Privat, Tutoring, Homeschooling & Pendampingan ABK Jakarta",
  defaultDescription:
    "MSA Education (Mindful · Supportive · Adaptive) — Every Mind Matters, Every Child Shines. Les privat, private tutoring, homeschooling support, dan pendampingan belajar anak berkebutuhan khusus (ABK) di Jakarta Utara, Pusat & Timur. Guru privat sabar, pendekatan personal & menyenangkan untuk anak Toddler, TK, SD. Private tutor Jakarta, kids education, special needs learning support.",
  keywords: [
    // ---- Brand ----
    "MSA Education",
    "MSA Education Jakarta",

    // ---- Les Privat ----
    "les privat",
    "les privat Jakarta",
    "les privat Jakarta Utara",
    "les privat Jakarta Pusat",
    "les privat Jakarta Timur",
    "les privat anak",
    "les privat anak TK",
    "les privat anak SD",
    "les privat anak toddler",
    "les privat ke rumah",
    "les privat ke rumah Jakarta",
    "les privat murah Jakarta",
    "les privat terbaik Jakarta",
    "les privat calistung",
    "les privat membaca",
    "les privat berhitung",
    "les privat menulis",

    // ---- Tutoring ----
    "tutoring",
    "tutoring Jakarta",
    "tutoring anak",
    "tutoring anak Jakarta",
    "private tutoring Jakarta",
    "tutor privat",
    "tutor privat Jakarta",
    "tutor anak",

    // ---- Guru Privat ----
    "guru privat",
    "guru privat Jakarta",
    "guru privat Jakarta Utara",
    "guru privat Jakarta Pusat",
    "guru privat Jakarta Timur",
    "guru privat anak TK",
    "guru privat anak SD",
    "guru les privat",
    "guru les Jakarta",
    "cari guru privat Jakarta",
    "guru belajar ke rumah",

    // ---- Bimbel / Bimbingan Belajar ----
    "bimbel",
    "bimbel Jakarta",
    "bimbel anak",
    "bimbel anak TK",
    "bimbel anak SD",
    "bimbingan belajar Jakarta",
    "bimbingan belajar anak",
    "bimbingan belajar privat",

    // ---- Pendidikan ----
    "pendidikan anak",
    "pendidikan anak Jakarta",
    "pendidikan anak usia dini",
    "lembaga pendidikan Jakarta",
    "jasa pendidikan anak",

    // ---- Homeschooling ----
    "homeschooling",
    "homeschooling Jakarta",
    "homeschooling support",
    "homeschooling support Jakarta",
    "homeschooling anak",
    "homeschool Jakarta",
    "dukungan homeschooling",
    "guru homeschooling Jakarta",
    "program homeschooling",

    // ---- ABK / Anak Berkebutuhan Khusus ----
    "ABK",
    "anak berkebutuhan khusus",
    "pendampingan ABK",
    "pendampingan ABK Jakarta",
    "les privat ABK",
    "les privat ABK Jakarta",
    "les privat anak berkebutuhan khusus",
    "guru ABK Jakarta",
    "guru anak berkebutuhan khusus",
    "bimbel ABK",
    "bimbel ABK Jakarta",
    "bimbel anak berkebutuhan khusus",
    "pendidikan ABK Jakarta",
    "pendidikan anak berkebutuhan khusus",
    "pendampingan belajar ABK",
    "terapi belajar anak",
    "shadow teacher Jakarta",

    // ---- SLB / Sekolah ----
    "SLB",
    "SLB Jakarta",
    "alternatif SLB Jakarta",
    "sekolah anak berkebutuhan khusus Jakarta",
    "sekolah inklusi Jakarta",
    "sekolah khusus Jakarta",
    "pendampingan sekolah inklusi",
    "les tambahan SLB",

    // ---- Sekolah Umum ----
    "sekolah",
    "les sekolah",
    "les tambahan sekolah",
    "bantuan PR sekolah",
    "bantuan pekerjaan rumah",
    "belajar di rumah",
    "guru les sekolah",

    // ---- Calistung ----
    "calistung",
    "les calistung",
    "les calistung Jakarta",
    "belajar membaca anak",
    "belajar menulis anak",
    "belajar berhitung anak",
    "kursus calistung",

    // ---- Area Spesifik ----
    "les privat Kelapa Gading",
    "les privat Sunter",
    "les privat Kemayoran",
    "les privat Cempaka Putih",
    "les privat Pulomas",
    "les privat Rawamangun",
    "les privat Menteng",
    "tutoring Kelapa Gading",
    "guru privat Kelapa Gading",
    "guru privat Sunter",
  ],
  ogImage: "/images/og-image.jpg",
  twitterHandle: "@msaeducation",
  locale: "id_ID",
};

// ---- ABOUT PAGE ----
export const aboutContent = {
  title: "Tentang MSA Education",
  intro:
    "MSA Education adalah layanan pendampingan belajar yang berdiri dengan satu misi sederhana: membantu setiap anak belajar dengan cara yang paling sesuai untuknya.",
  philosophy: {
    title: "Filosofi Pendidikan Kami",
    content:
      "Kami percaya bahwa setiap anak unik. Tidak ada satu metode yang cocok untuk semua. Oleh karena itu, MSA Education menghadirkan pendekatan yang personal — disesuaikan dengan karakter, kebutuhan, dan ritme belajar masing-masing anak. Belajar seharusnya menjadi pengalaman yang menyenangkan, bukan beban. Ketika anak merasa nyaman, aman, dan didampingi dengan penuh perhatian, mereka akan secara alami tumbuh menjadi pembelajar yang antusias.",
  },
  personalizedLearning: {
    title: "Pentingnya Pembelajaran Personal",
    content:
      "Setiap anak memiliki kecepatan, gaya, dan kebutuhan belajar yang berbeda. Program yang bersifat satu-untuk-semua sering kali tidak optimal. MSA Education hadir untuk mengisi kebutuhan tersebut — memberikan pendampingan yang benar-benar disesuaikan, baik dari segi materi, metode, maupun pendekatan emosional.",
  },
  inclusive: {
    title: "Pendekatan Inklusif & Hangat",
    content:
      "Kami menyambut semua anak, termasuk anak berkebutuhan khusus, dengan sikap terbuka, sabar, dan penuh pengertian. Kami tidak membeda-bedakan — setiap anak berhak mendapatkan pendampingan belajar terbaik yang sesuai dengan kebutuhannya.",
  },
};
