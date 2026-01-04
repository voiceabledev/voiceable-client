import { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/landing-page/Header";
import HeroSection from "@/components/landing-page/HeroSection";
import FeatureNav from "@/components/landing-page/FeatureNav";
import AssistantSection from "@/components/landing-page/AssistantSection";
import ResponsesSection from "@/components/landing-page/ResponsesSection";
import FeaturesSection from "@/components/landing-page/FeaturesSection";
import LiveCallsSection from "@/components/landing-page/LiveCallsSection";
import HumanLedSection from "@/components/landing-page/HumanLedSection";
import SeamlessSetupSection from "@/components/landing-page/SeamlessSetupSection";
import SolutionsSection from "@/components/landing-page/SolutionsSection";
import UserLoveSection from "@/components/landing-page/UserLoveSection";
import CTASection from "@/components/landing-page/CTASection";
import Footer from "@/components/landing-page/Footer";
import OperatorInterfaceSection from "@/components/landing-page/OperatorInterfaceSection";
import { SEO } from "@/components/SEO";

const Landing = () => {
  const [activeFeature, setActiveFeature] = useState("assistant");
  const location = useLocation();
  const baseUrl = "https://voice-agent-ai-4288599ce3fe.herokuapp.com";
  const currentUrl = `${baseUrl}${location.pathname}`;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SEO
        title="AI Voice Agents for Retail, E-commerce & Restaurants | Voiceable"
        description="Transform customer service with AI voice agents for retail stores, e-commerce businesses, and restaurants. Handle orders, reservations, returns, and customer inquiries 24/7 with intelligent voice automation."
        keywords="AI voice agents, retail automation, e-commerce customer service, restaurant reservations, order management, customer support automation, voice AI for retail, AI phone answering, automated customer service, retail AI assistant"
        url={currentUrl}
        image="/og-image.png"
      />
      <Header />
      <HeroSection />
      <OperatorInterfaceSection />
      <FeaturesSection />
      <LiveCallsSection />
      <AssistantSection />
      <ResponsesSection />
      <SolutionsSection />
      <HumanLedSection />
      <SeamlessSetupSection />
      {/* <UserLoveSection /> */}
      <CTASection />
      <Footer />
      {/* <FeatureNav 
        activeFeature={activeFeature} 
        onFeatureChange={setActiveFeature} 
      /> */}
    </div>
  );
};

export default Landing;
