import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FounderSection from "@/components/FounderSection";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import MobileStickyBar from "@/components/MobileStickyBar";
import AboutPageContent from "./AboutPageContent";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Kenali MSA Education — layanan pendampingan belajar personal, hangat, dan inklusif untuk anak usia Toddler hingga SD di Jakarta.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <AboutPageContent />
        <FounderSection />
      </main>
      <Footer />
      <FloatingWhatsAppButton />
      <MobileStickyBar />
    </>
  );
}
