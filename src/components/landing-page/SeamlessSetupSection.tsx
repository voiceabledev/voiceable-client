import { useState } from "react";
import { Layers, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  SiOpenai,
  SiAnthropic,
  SiGoogle,
  SiX,
  SiDeepgram,
  SiElevenlabs,
  SiTwilio,
  SiSlack,
  SiWhatsapp,
  SiTelegram,
  SiShopify,
  SiStripe,
  SiGoogledrive,
  SiZendesk,
  SiHubspot,
  SiSalesforce,
  SiCalendly,
  SiGooglecalendar,
} from "react-icons/si";
import { Brain, Cloud, Calendar, Users, Globe, Smile, Truck, CloudLightning, Mail, ArrowRightLeft, Infinity as InfinityIcon, ShieldCheck, Package } from "lucide-react";
import { IconType } from "react-icons";

// Integration logo mapping - using react-icons where available, lucide-react as fallback
const integrationLogos: { id: string; Icon: IconType | React.ComponentType<{ className?: string }> }[] = [
  // Model Providers
  { id: "openai", Icon: SiOpenai },
  { id: "anthropic", Icon: SiAnthropic },
  { id: "google", Icon: SiGoogle },
  { id: "azure-openai", Icon: Cloud }, // Using Cloud icon as fallback for Azure
  { id: "mistral", Icon: Brain }, // Using Brain icon as fallback
  { id: "xai", Icon: SiX },
  // Transcriber/Voice Providers
  { id: "deepgram", Icon: SiDeepgram },
  { id: "elevenlabs", Icon: SiElevenlabs },
  // Telephony
  { id: "twilio", Icon: SiTwilio },
  // Communication
  { id: "slack", Icon: SiSlack },
  { id: "whatsapp", Icon: SiWhatsapp },
  { id: "telegram", Icon: SiTelegram },
  // E-commerce
  { id: "shopify", Icon: SiShopify },
  { id: "stripe", Icon: SiStripe },
  // Cloud Storage
  { id: "google-drive", Icon: SiGoogledrive },
  { id: "onedrive", Icon: Cloud }, // Using Cloud icon as fallback for OneDrive
  // Customer Support
  { id: "zendesk", Icon: SiZendesk },
  // CRM
  { id: "hubspot", Icon: SiHubspot },
  { id: "salesforce", Icon: SiSalesforce },
  { id: "pipedrive", Icon: Users }, // Using Users icon as fallback
  // Scheduling
  { id: "calendly", Icon: SiCalendly },
  { id: "google_calendar", Icon: SiGooglecalendar },
  { id: "outlook_calendar", Icon: Calendar }, // Using Calendar icon as fallback
];

// Feature cards data
const features = [
  {
    id: "order-management",
    title: "Automated Order Management",
    description: "Process phone orders, track shipments, handle returns and exchanges, and manage reservations, all automatically, 24/7.",
    Icon: Package,
  },
  {
    id: "personalized-service",
    title: "Personalized Customer Service",
    description: "Greets customers by name, recalls order history, preferences, and past interactions to deliver tailored experiences.",
    Icon: Smile,
  },
  {
    id: "smart-scheduling",
    title: "Smart Reservation Booking",
    description: "Books restaurant reservations, delivery time slots, and appointments directly on your calendar based on real-time availability.",
    Icon: Calendar,
  },
  {
    id: "inventory-inquiries",
    title: "Real-Time Inventory Lookup",
    description: "Answers product availability questions, checks stock levels, and suggests alternatives when items are out of stock.",
    Icon: Truck,
  },
  {
    id: "menu-information",
    title: "Menu & Product Information",
    description: "Answers questions about menu items, ingredients, allergens, product details, and pricing instantly, even during peak hours.",
    Icon: CloudLightning,
  },
  {
    id: "omni-channel-inbox",
    title: "Omni-Channel Inbox",
    description: "Manages phone, SMS, and email in one queue, maintaining full context as conversations hop channels seamlessly.",
    Icon: Mail,
  },
  {
    id: "warm-transfers",
    title: "Warm Transfers",
    description: "Seamlessly hand live calls from the voice agent to your team, no dropped context, no repeating order details.",
    Icon: ArrowRightLeft,
  },
  {
    id: "call-recording",
    title: "Call Recording & Analytics",
    description: "Every conversation is automatically captured, transcribed, and indexed so you can search, audit, and improve service quality.",
    Icon: InfinityIcon,
  },
  {
    id: "test-before-launch",
    title: "Test Before Launch",
    description: "Run real-world call, SMS, and email simulations to stress-test workflows and fix gaps before customers ever call.",
    Icon: ShieldCheck,
  },
];

const TranslateWrapper = ({ children, reverse }: { children: React.ReactNode; reverse?: boolean }) => {
  return (
    <motion.div
      initial={{ translateX: reverse ? "-100%" : "0%" }}
      animate={{ translateX: reverse ? "0%" : "-100%" }}
      transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      className="flex gap-4 px-2"
    >
      {children}
    </motion.div>
  );
};

const LogoItem = ({ Icon }: { Icon: IconType | React.ComponentType<{ className?: string }> }) => {
  return (
    <div className="w-16 md:w-24 h-16 md:h-24 flex justify-center items-center hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors rounded-lg">
      <Icon className="text-3xl md:text-4xl" />
    </div>
  );
};

const FeatureCard = ({ title, description, Icon }: { title: string; description: string; Icon: React.ComponentType<{ className?: string }> }) => {
  return (
    <div className="bg-card rounded-3xl border border-border p-6 group hover:border-muted transition-colors">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:bg-muted/80 transition-colors">
        <Icon className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <h3 className="font-semibold text-md mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

const LogoItemsTop = () => (
  <>
    {integrationLogos.slice(0, Math.ceil(integrationLogos.length / 2)).map(({ id, Icon }) => (
      <LogoItem key={id} Icon={Icon} />
    ))}
  </>
);

const LogoItemsBottom = () => (
  <>
    {integrationLogos.slice(Math.ceil(integrationLogos.length / 2)).map(({ id, Icon }) => (
      <LogoItem key={id} Icon={Icon} />
    ))}
  </>
);

const DoubleScrollingLogos = () => {
  return (
    <div className="py-8 overflow-hidden">
      <div className="flex overflow-hidden">
        <TranslateWrapper>
          <LogoItemsTop />
        </TranslateWrapper>
        <TranslateWrapper>
          <LogoItemsTop />
        </TranslateWrapper>
        <TranslateWrapper>
          <LogoItemsTop />
        </TranslateWrapper>
      </div>
      <div className="flex overflow-hidden mt-4">
        <TranslateWrapper reverse>
          <LogoItemsBottom />
        </TranslateWrapper>
        <TranslateWrapper reverse>
          <LogoItemsBottom />
        </TranslateWrapper>
        <TranslateWrapper reverse>
          <LogoItemsBottom />
        </TranslateWrapper>
      </div>
    </div>
  );
};

const SeamlessSetupSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple/5 via-pink/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="feature-pill mb-8 inline-flex">
            <Layers className="w-4 h-4" />
            <span>Seamless Setup</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Connects and<br />
            compliments your<br />
            existing stack
          </h2>

          <p className="text-lg text-muted-foreground mb-8">
            <span className="text-primary">Voiceable</span> is designed to easily
            integrate and enhance your current
            software stack. Free your data with
            no API keys, lock-ins or data silos.
          </p>

          {/* Scrolling Logos */}
          <div className="mb-8">
            <DoubleScrollingLogos />
          </div>

          {/* CTA Button */}
          <div className="inline-flex items-center justify-center w-full max-w-2xl mb-16">
            <Button 
              variant="outline" 
              className="w-full py-6 rounded-2xl border-border bg-card/50 hover:bg-card text-foreground group"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span className="flex items-center gap-2">
                Automate your back office end-to-end
                <Play className={`w-4 h-4 fill-primary text-primary group-hover:scale-110 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </span>
            </Button>
          </div>

          {/* Feature Cards Grid */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full max-w-6xl mx-auto overflow-hidden"
              >
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  {features.map((feature) => (
                    <FeatureCard
                      key={feature.id}
                      title={feature.title}
                      description={feature.description}
                      Icon={feature.Icon}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default SeamlessSetupSection;

