import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
  },

  // ============================================================
  // SECURITY HEADERS
  // Protects against XSS, clickjacking, MIME sniffing,
  // and other common web vulnerabilities.
  // ============================================================
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          // Prevent clickjacking — no one can embed your site in an iframe
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME type sniffing attacks
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Enable browser XSS protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Control referrer information sent with requests
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions Policy — disable unnecessary browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Strict Transport Security — force HTTPS for 1 year
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Content Security Policy — control what resources can load
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://vitals.vercel-insights.com https://*.supabase.co https://fonts.gstatic.com https://api.mymemory.translated.net",
              "frame-src https://www.youtube.com https://youtube.com",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // Prevent browsers from DNS prefetching
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },

  // ============================================================
  // REDIRECT HTTP → HTTPS (Vercel handles this automatically,
  // but this adds an extra layer)
  // ============================================================
  poweredByHeader: false, // Remove "X-Powered-By: Next.js" header
};

export default nextConfig;
