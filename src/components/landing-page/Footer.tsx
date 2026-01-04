import { Phone, Heart, Rocket, FileText, ShieldCheck } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Cityscape background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple/5 to-pink/10" />
        
        {/* Abstract city silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-64">
          <svg 
            className="absolute bottom-0 w-full h-full" 
            viewBox="0 0 1440 256" 
            preserveAspectRatio="none"
            fill="none"
          >
            {/* Mountains/hills layers */}
            <path 
              d="M0 256V180C200 160 400 200 600 180C800 160 1000 140 1200 160C1300 170 1400 180 1440 180V256H0Z" 
              fill="hsl(var(--muted) / 0.3)"
            />
            <path 
              d="M0 256V200C300 180 500 220 700 200C900 180 1100 160 1440 200V256H0Z" 
              fill="hsl(var(--muted) / 0.2)"
            />
            <path 
              d="M0 256V220C400 200 700 240 1000 220C1200 205 1350 210 1440 220V256H0Z" 
              fill="hsl(var(--muted) / 0.1)"
            />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Status badges */}
        {/* <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <a 
            href="tel:33-OPERATOR" 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:bg-secondary transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="text-sm">Call us at 33-OPERATOR</span>
          </a>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
            <span className="text-sm">All systems operational</span>
          </div>
        </div> */}

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <img src="/voiceable_logo.png" alt="Voiceable" className="h-8 w-auto" />
          </div>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
          <div className="flex items-center gap-1 hover:text-foreground transition-colors">
            <span className="text-xs">©</span>
            Voiceable Inc.
          </div>
          {/* <a href="#" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Heart className="w-3 h-3" />
            Built with grit from Vancouver
          </a> */}
          <a href="/terms" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <FileText className="w-3 h-3" />
            Terms
          </a>

          <a href="/privacy" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <ShieldCheck className="w-3 h-3" />
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;

