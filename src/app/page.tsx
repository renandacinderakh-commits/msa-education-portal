import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustHighlights from "@/components/TrustHighlights";
import ServiceCards from "@/components/ServiceCards";
import AgeGroupCards from "@/components/AgeGroupCards";
import InclusiveSection from "@/components/InclusiveSection";
import HowItWorks from "@/components/HowItWorks";
import PricingCards from "@/components/PricingCards";
import AreaCoverageSection from "@/components/AreaCoverageSection";
import GalleryGrid from "@/components/GalleryGrid";
import VideoSection from "@/components/VideoSection";
import TestimonialCards from "@/components/TestimonialCards";
import FAQAccordion from "@/components/FAQAccordion";
import ContactForm from "@/components/ContactForm";
import FounderSection from "@/components/FounderSection";
import Footer from "@/components/Footer";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import MobileStickyBar from "@/components/MobileStickyBar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrustHighlights />
        <ServiceCards />
        <AgeGroupCards />
        <InclusiveSection />
        <HowItWorks />
        <PricingCards />
        <AreaCoverageSection />
        <GalleryGrid />
        <VideoSection />
        <FounderSection />
        <TestimonialCards />
        <FAQAccordion />
        <ContactForm />
      </main>
      <Footer />
      <FloatingWhatsAppButton />
      <MobileStickyBar />
    </>
  );
}
