import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import MobileStickyBar from "@/components/MobileStickyBar";
import AreaPageContent from "./AreaPageContent";

export const metadata: Metadata = {
  title: "Area Layanan",
  description:
    "MSA Education melayani les privat dan pendampingan belajar di Jakarta Utara, Jakarta Pusat, dan Jakarta Timur. Hubungi kami untuk konsultasi.",
};

export default function AreaPage() {
  return (
    <>
      <Navbar />
      <main>
        <AreaPageContent />
      </main>
      <Footer />
      <FloatingWhatsAppButton />
      <MobileStickyBar />
    </>
  );
}
