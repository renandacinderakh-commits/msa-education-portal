export default function JsonLd() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": "https://msa-education.vercel.app",
    name: "MSA Education",
    alternateName: "MSA Education Jakarta — Mindful. Supportive. Adaptive.",
    url: "https://msa-education.vercel.app",
    logo: "https://msa-education.vercel.app/logo.svg",
    image: "https://msa-education.vercel.app/images/og-image.jpg",
    slogan: "Every Mind Matters, Every Child Shines.",
    description:
      "MSA Education (Mindful · Supportive · Adaptive) menyediakan les privat, private tutoring, dukungan homeschooling, dan pendampingan belajar anak berkebutuhan khusus (ABK) di Jakarta. Every Mind Matters, Every Child Shines — Pendekatan personal, hangat, dan menyenangkan untuk anak usia Toddler hingga SD.",
    telephone: "+6281297212113",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jakarta",
      addressRegion: "DKI Jakarta",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -6.2088,
      longitude: 106.8456,
    },
    areaServed: [
      {
        "@type": "City",
        name: "Jakarta Utara",
        containedInPlace: { "@type": "State", name: "DKI Jakarta" },
      },
      {
        "@type": "City",
        name: "Jakarta Pusat",
        containedInPlace: { "@type": "State", name: "DKI Jakarta" },
      },
      {
        "@type": "City",
        name: "Jakarta Timur",
        containedInPlace: { "@type": "State", name: "DKI Jakarta" },
      },
    ],
    priceRange: "Rp 600.000 - Rp 2.400.000",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "08:00",
      closes: "20:00",
    },
    sameAs: [],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Program Belajar MSA Education",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "EducationalOccupationalProgram",
            name: "Les Privat / Tutoring",
            description:
              "Pendampingan belajar personal di rumah untuk anak usia Toddler hingga SD.",
            provider: { "@type": "EducationalOrganization", name: "MSA Education" },
            educationalProgramMode: "onsite",
            timeToComplete: "P1M",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "EducationalOccupationalProgram",
            name: "Homeschooling Support",
            description:
              "Dukungan belajar terstruktur untuk keluarga yang memilih jalur homeschooling.",
            provider: { "@type": "EducationalOrganization", name: "MSA Education" },
            educationalProgramMode: "onsite",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "EducationalOccupationalProgram",
            name: "Pendampingan Anak Berkebutuhan Khusus",
            description:
              "Dukungan belajar personal untuk anak berkebutuhan khusus dengan pendekatan sabar dan bertahap.",
            provider: { "@type": "EducationalOrganization", name: "MSA Education" },
            educationalProgramMode: "onsite",
          },
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "4",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Ibu Sarah" },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        reviewBody:
          "Anak saya jadi lebih semangat belajar sejak didampingi MSA Education. Gurunya sangat sabar dan cara mengajarnya kreatif.",
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Ibu Dewi" },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        reviewBody:
          "Sebagai orang tua yang memilih homeschooling, kami merasa sangat terbantu dengan pendampingan dari MSA Education.",
      },
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MSA Education",
    url: "https://msa-education.vercel.app",
    description:
      "Les privat, homeschooling support, dan pendampingan belajar anak berkebutuhan khusus di Jakarta.",
    publisher: {
      "@type": "EducationalOrganization",
      name: "MSA Education",
      logo: {
        "@type": "ImageObject",
        url: "https://msa-education.vercel.app/logo.svg",
      },
    },
    inLanguage: "id-ID",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: "https://msa-education.vercel.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Program",
        item: "https://msa-education.vercel.app/program",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Tentang Kami",
        item: "https://msa-education.vercel.app/tentang",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Area Layanan",
        item: "https://msa-education.vercel.app/area",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Anak saya cocok ikut program yang mana?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Kami akan membantu menentukan program yang paling sesuai melalui konsultasi awal. Setiap anak memiliki kebutuhan yang berbeda, dan kami akan menyesuaikan program berdasarkan usia, kemampuan, dan tujuan belajar anak.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah MSA Education menerima anak berkebutuhan khusus?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Tentu. Kami dengan senang hati mendampingi anak berkebutuhan khusus (ABK). Pendekatan kami bersifat individual, sabar, dan disesuaikan dengan kebutuhan serta kenyamanan anak.",
        },
      },
      {
        "@type": "Question",
        name: "Area layanan MSA Education di mana saja?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Saat ini kami melayani area Jakarta Utara, Jakarta Pusat, dan Jakarta Timur. Hubungi kami untuk informasi lebih detail.",
        },
      },
      {
        "@type": "Question",
        name: "Berapa biaya les privat di MSA Education?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Paket mulai dari Rp 850.000/bulan untuk Toddler/TK hingga Rp 1.850.000/bulan untuk SD intensif. Hubungi kami untuk konsultasi program yang sesuai.",
        },
      },
      {
        "@type": "Question",
        name: "Bagaimana cara konsultasi di MSA Education?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Anda bisa menghubungi kami melalui WhatsApp di 0812-9721-2113 atau mengisi formulir di website. Tim kami akan segera merespons untuk menjadwalkan konsultasi.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </>
  );
}
