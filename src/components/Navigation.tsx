"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const AGENTS = [
  { name: "Receptionist", href: "/receptionist" },
  // { name: "Recruiters", href: "/recruiters" },
  { name: "Lead Qualifier", href: "/scheduler" },
  { name: "Leads Reviver", href: "/leads-reviver" },
  { name: "Appointment Confirmation", href: "/confirmation" },
];

const AgentsDropdown = () => {
  const [open, setOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative h-fit w-fit"
    >
      <div className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        Voice Agents
        <span
          style={{
            transform: open ? "scaleX(1)" : "scaleX(0)",
          }}
          className="absolute -bottom-2 -left-2 -right-2 h-1 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 ease-out"
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            style={{ translateX: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-1/2 top-12 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[250px]"
          >
            <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
            <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-card border-l border-t border-border" />
            <div className="relative bg-card p-2">
              {AGENTS.map((agent) => (
                <Link
                  key={agent.href}
                  to={agent.href}
                  className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                >
                  {agent.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
            <img src="/voiceable_logo.png" alt="Voiceable" className="w-[123px] h-full" />
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Blog
          </Link>
          {/* <AgentsDropdown /> */}
          {/* <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link> */}
          {/* <a 
            href="https://docs.voiceable.dev/" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Docs
          </a> */}
        </div>
        
        <Link href="/assistants" rel="nofollow">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
            Open Dashboard
          </Button>
        </Link>
      </div>
    </nav>
  );
}

