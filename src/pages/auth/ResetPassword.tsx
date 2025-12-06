import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle reset password
    navigate("/overview");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-background">
        <div className="absolute top-8 left-8">
          <Link to="/" className="text-2xl font-bold text-foreground">
            VAPI
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Reset your password</h1>
            <p className="text-muted-foreground text-sm">
              Enter your email and we'll send a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50"
              />
            </div>

            <Button type="submit" variant="accent" className="w-full" onClick={handleSubmit}>
              Reset Password
            </Button>
          </form>

          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-8 text-xs text-muted-foreground">
          By using Vapi you agree to our Terms of Service,<br />
          Privacy, and Security policies and practices.
        </div>
      </div>

      {/* Right Side - Testimonial */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        {/* Starfield Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Testimonial Card */}
        <div className="relative z-10 max-w-md mx-8 p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
              B
            </div>
            <div>
              <div className="font-semibold text-white">Bob Wisely</div>
              <div className="text-sm text-slate-400">Founder, Retexts</div>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Building a high-quality production-ready voice agent on <span className="text-primary">Vapi</span> was incredibly easy for me.
          </p>
          <p className="text-slate-300 text-sm leading-relaxed mt-3">
            I notice new features being released almost daily, and the support provided is exceptional. Keep up the excellent work!
          </p>
        </div>
      </div>
    </div>
  );
}
