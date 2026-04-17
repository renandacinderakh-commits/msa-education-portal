import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingCards from "@/components/PricingCards";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import MobileStickyBar from "@/components/MobileStickyBar";
import ProgramPageContent from "./ProgramPageContent";

export const metadata: Metadata = {
  title: "Program Belajar",
  description:
    "Program les privat, homeschooling support, dan pendampingan belajar anak berkebutuhan khusus dari MSA Education — pendekatan personal untuk anak usia Toddler hingga SD.",
};

export default function ProgramPage() {
  return (
    <>
      <Navbar />
      <main>
        <ProgramPageContent />
        <PricingCards />
      </main>
      <Footer />
      <FloatingWhatsAppButton />
      <MobileStickyBar />
    </>
  );
}
