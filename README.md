# MSA Education — Website Resmi

Website pendampingan belajar **MSA Education** — les privat, homeschooling support, dan pendampingan belajar anak berkebutuhan khusus (ABK) di Jakarta.

---

## 🚀 Quick Start

### Instalasi

```bash
npm install
```

### Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📁 Struktur Konten (Mudah Diedit)

Semua konten website terpusat di **satu file konfigurasi**:

```
src/lib/content.ts
```

### Yang bisa diedit di content.ts:

| Data                    | Variabel                 |
| ----------------------- | ------------------------ |
| Kontak & WhatsApp       | `contactInfo`            |
| Info Founder            | `founderInfo`            |
| Hero Section            | `heroContent`            |
| Trust / Why MSA         | `trustHighlights`        |
| Program / Layanan       | `services`               |
| Kelompok Usia           | `ageGroups`              |
| Cara Kerja              | `howItWorks`             |
| Paket & Harga           | `pricingPackages`        |
| Area Layanan            | `serviceAreas`           |
| Gallery (foto)          | `galleryItems`           |
| Video Embeds            | `videoEmbeds`            |
| Testimoni               | `testimonials`           |
| FAQ                     | `faqItems`               |
| SEO                     | `seoConfig`              |
| Navigasi                | `navLinks`               |
| CTA Labels              | `ctaLabels`              |
| Halaman About           | `aboutContent`           |
| Section ABK / Inklusif  | `inclusiveSection`       |

---

## 📞 Cara Edit Kontak

Buka `src/lib/content.ts` dan ubah:

```typescript
export const contactInfo = {
  whatsapp: "6281234567890",           // ← Ganti nomor WhatsApp
  whatsappDisplay: "0812-3456-7890",   // ← Tampilan nomor
  whatsappLink: "https://wa.me/6281234567890", // ← Link WhatsApp
  email: "info@msaeducation.id",       // ← Ganti email
  address: "Jakarta, Indonesia",       // ← Ganti alamat
  googleMapsEmbed: "https://...",      // ← URL embed Google Maps
};
```

---

## 🖼️ Cara Ganti Foto & Media

### Foto Founder / Istri
- Ganti file: `public/images/founder.jpg`
- Atau ubah path di `founderInfo.photo` di `content.ts`

### Gallery
- Ganti file di: `public/images/gallery/gallery-1.jpg` s/d `gallery-6.jpg`
- Atau ubah array `galleryItems` di `content.ts`

### Video
- Ubah `videoEmbeds` di `content.ts`
- Ganti `embedUrl` dengan URL embed YouTube yang benar

### Hero Image
- Ganti file: `public/images/hero-child-learning.jpg`

### Service Images
- `public/images/service-tutoring.jpg`
- `public/images/service-homeschooling.jpg`
- `public/images/service-abk-support.jpg`

### Testimonial Avatars
- `public/images/testimonials/avatar-1.jpg` s/d `avatar-4.jpg`

---

## 💰 Cara Edit Harga / Paket

Buka `src/lib/content.ts` → cari `pricingPackages` → edit sesuai kebutuhan.

---

## 🎯 Suggested Keywords for Future Media Replacement

Gunakan keyword ini untuk mencari foto/video pengganti:
- toddler learning
- kindergarten tutoring
- homeschooling child
- teacher helping child learn
- educational play
- inclusive classroom
- one on one tutoring child
- parent and child learning moment
- child reading book
- creative educational activities

---

## 🌐 Deploy ke Vercel

1. Push project ke GitHub
2. Buka [vercel.com](https://vercel.com)
3. Import repository
4. Vercel akan otomatis detect Next.js
5. Klik Deploy

Atau via CLI:

```bash
npm i -g vercel
vercel
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Font**: Plus Jakarta Sans (Google Fonts)

---

## 📄 Halaman

| Halaman        | Path        |
| -------------- | ----------- |
| Beranda        | `/`         |
| Tentang Kami   | `/tentang`  |
| Program        | `/program`  |
| Area Layanan   | `/area`     |

---

## ⚡ Fitur

- ✅ Responsive (mobile-first)
- ✅ Floating WhatsApp button
- ✅ Mobile sticky CTA bar
- ✅ Smooth animations
- ✅ SEO optimized (meta, OG, Twitter cards)
- ✅ Accessible (semantic HTML, focus states, reduced motion support)
- ✅ Gallery dengan lightbox
- ✅ Video embed (click-to-play)
- ✅ Contact form dengan validasi
- ✅ Pricing/paket cards
- ✅ FAQ accordion
- ✅ Konten terpusat di satu file
- ✅ Siap deploy ke Vercel

---

© MSA Education
