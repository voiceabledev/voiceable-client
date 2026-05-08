"use client";

import { useState } from "react";
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

const Landing = () => {
  const [activeFeature, setActiveFeature] = useState("assistant");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />
      <main>
        <HeroSection />
        <OperatorInterfaceSection />
        <FeaturesSection />
        <LiveCallsSection />
        <AssistantSection showCalendarOnly={true} />
        <ResponsesSection />
        <SolutionsSection />
        <HumanLedSection />
        <SeamlessSetupSection />
        {/* <UserLoveSection /> */}
        <CTASection showCalendarOnly={true} />
      </main>
      <Footer />
      {/* <FeatureNav 
        activeFeature={activeFeature} 
        onFeatureChange={setActiveFeature} 
      /> */}
    </div>
  );
};

export default Landing;
