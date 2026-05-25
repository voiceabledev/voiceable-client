import Link from "next/link";

const useCaseLinks = [
  { label: "Retail & eCommerce", href: "/retail-ecommerce" },
  { label: "Small businesses", href: "/small-business" },
  { label: "Recruitment", href: "/recruitment" },
  { label: "Customer support", href: "/customer-support" },
  { label: "Sales", href: "/" },
] as const;

const resourceLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
] as const;

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
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2">
            <img src="/voiceable_logo.png" alt="Voiceable" className="h-8 w-auto" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-10 max-w-4xl mx-auto mb-12 text-sm">
          <div className="col-span-2 sm:col-span-1 md:col-span-2">
            <h3 className="font-semibold text-foreground mb-4">Use cases</h3>
            <ul className="space-y-3 text-muted-foreground">
              {useCaseLinks.map((item) => (
                <li key={item.href + item.label}>
                  <Link href={item.href} className="hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3 text-muted-foreground">
              {resourceLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center pt-6 border-t border-border/40">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <span className="text-xs">©</span>
            {new Date().getFullYear()} Voiceable Inc.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

