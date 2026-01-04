import { Sparkles, Twitter, Linkedin, Github } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Home", href: "/" },
    // { name: "Receptionist", href: "/receptionist" },
    // { name: "Recruiters", href: "/recruiters" },
    // { name: "Lead Qualifier", href: "/scheduler" },
    // { name: "Leads Reviver", href: "/leads-reviver" },
    // { name: "Appointment Confirmation", href: "/confirmation" },
    { name: "Pricing", href: "/pricing" },
    // { name: "Documentation", href: "https://docs.voiceable.dev/" }
  ],
  company: [
    // { name: "About", href: "/about" },
    // { name: "Contact", href: "/contact" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" }
  ]
};

export function Footer() {
  return (
    <footer className="py-16 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-start gap-2 mb-4">
              <img src="/voiceable_logo.png" alt="Voiceable" className="w-[123px] h-full" />
            </div>
            <p className="text-muted-foreground text-sm">
              Create AI voice agents without writing prompts. Handle calls, qualify leads, and book appointments with agents that work 24/7.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-xs tracking-widest text-muted-foreground mb-4">PRODUCT</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-foreground hover:text-primary transition-colors text-sm"
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-xs tracking-widest text-muted-foreground mb-4">COMPANY</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-foreground hover:text-primary transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">© 2025 — All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://www.linkedin.com/company/voiceable" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://github.com/voiceabledev" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
