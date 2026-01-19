import { motion } from "framer-motion";
import { Dispatch, SetStateAction, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone } from "lucide-react";
import { demoCallsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DemoCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: {
    fullName: string;
    email: string;
    phone: string;
  }) => void;
}

export const DemoCallModal = ({ open, onOpenChange, onSubmit }: DemoCallModalProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneLocal: "",
    countryCode: "US",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Combine country code with local number
      const countryCodeNumber = formData.countryCode === "US" ? "+1" : "+1"; // Both US and CA use +1
      const fullPhone = `${countryCodeNumber}${formData.phoneLocal.replace(/\D/g, "")}`;

      // Send to API
      await demoCallsApi.create({
        fullName: formData.fullName,
        email: formData.email,
        phone: fullPhone,
      });

      // Call custom onSubmit if provided
      if (onSubmit) {
        onSubmit({
          fullName: formData.fullName,
          email: formData.email,
          phone: fullPhone,
        });
      }

      // Show success message
      toast({
        title: "Demo call requested!",
        description: "We'll call you in 15 minutes to demonstrate our AI assistant.",
      });

      // Reset form and close modal
      setFormData({
        fullName: "",
        email: "",
        phoneLocal: "",
        countryCode: "US",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting demo call request:", error);
      toast({
        title: "Error",
        description: "Failed to submit demo call request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full p-0 overflow-hidden border-none ring-0 outline-none [&]:border-none [&]:ring-0 [&]:outline-none [&]:shadow-none">
        <DialogTitle className="sr-only">Get a Demo Call</DialogTitle>
        <DialogDescription className="sr-only">
          Voiceable will automatically call you to demonstrate how our AI assistant works.
        </DialogDescription>
        <div className="w-full shadow-lg flex flex-col-reverse lg:flex-row md:rounded-lg overflow-hidden border-none">
          <div className="w-full lg:w-1/2 lg:h-[600px] flex">
            <Form
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="hidden lg:block lg:w-1/2 lg:h-[600px]">
            <Images />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

type FormData = {
  fullName: string;
  email: string;
  phoneLocal: string;
  countryCode: string;
};

const Form = ({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}: {
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  isSubmitting: boolean;
}) => {
  // Format phone number as (555) 123-4567
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    
    // Limit to 10 digits
    const limited = digits.slice(0, 10);
    
    // Format based on length
    if (limited.length === 0) return "";
    if (limited.length <= 3) return `(${limited}`;
    if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phoneLocal: formatted });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="p-8 w-full h-full text-white bg-violet-600 flex flex-col"
    >
      <div className="flex items-center gap-2 mb-6">
        <Phone className="w-6 h-6" />
        <h3 className="text-4xl font-bold">Get a Demo Call</h3>
      </div>

      <p className="text-lg mb-8 text-white/90">
        Voiceable will automatically call you to demonstrate how our AI assistant works.
      </p>

      {/* Full Name */}
      <div className="mb-6">
        <p className="text-2xl mb-2">Hi 👋! My name is...</p>
        <input
          type="text"
          placeholder="Your full name..."
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="bg-violet-700 placeholder-white/70 p-2 rounded-md w-full focus:outline-0 text-white"
        />
      </div>

      {/* Email */}
      <div className="mb-6">
        <p className="text-2xl mb-2">My email is...</p>
        <input
          type="email"
          placeholder="your.email@example.com"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="bg-violet-700 placeholder-white/70 p-2 rounded-md w-full focus:outline-0 text-white"
        />
      </div>

      {/* Phone */}
      <div className="mb-6">
        <p className="text-2xl mb-2">and my phone number is...</p>
        <div className="flex gap-2">
          <Select
            value={formData.countryCode}
            onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
          >
            <SelectTrigger className="w-28 bg-violet-700 text-white border-violet-600 focus:ring-2 focus:ring-white/20">
              <SelectValue>
                <span className="text-2xl">
                  {formData.countryCode === "US" ? "🇺🇸" : "🇨🇦"}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">
                <span className="text-xl mr-2">🇺🇸</span> US
              </SelectItem>
              <SelectItem value="CA">
                <span className="text-xl mr-2">🇨🇦</span> CA
              </SelectItem>
            </SelectContent>
          </Select>
          <input
            type="tel"
            placeholder="(555) 123-4567"
            required
            value={formData.phoneLocal}
            onChange={handlePhoneChange}
            className="flex-1 bg-violet-700 placeholder-white/70 p-2 rounded-md focus:outline-0 text-white"
            maxLength={14} // (555) 123-4567
          />
        </div>
      </div>

      {/* Submit */}
      <motion.button
        whileHover={{
          scale: isSubmitting ? 1 : 1.01,
        }}
        whileTap={{
          scale: isSubmitting ? 1 : 0.99,
        }}
        type="submit"
        disabled={isSubmitting}
        className="bg-white text-violet-600 text-lg text-center rounded-lg w-full py-3 font-semibold mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Request Demo Call"}
      </motion.button>
    </form>
  );
};

const Images = () => {
  return (
    <div className="bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 relative overflow-hidden w-full min-h-[100px] lg:min-h-[600px] flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center p-12">
        {/* iPhone Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          {/* iPhone Device */}
          <div className="relative w-[280px] h-[580px] mx-auto">
            {/* iPhone Frame - Outer Shadow */}
            <div className="absolute inset-0 rounded-[3.5rem] bg-gradient-to-b from-slate-800 via-slate-900 to-black shadow-2xl" 
                 style={{ 
                   boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1)'
                 }}>
              {/* Screen Bezel */}
              <div className="absolute inset-[3px] rounded-[3.2rem] bg-black overflow-hidden">
                {/* Dynamic Island (iPhone 14 Pro style) */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-30 flex items-center justify-center">
                  <div className="w-20 h-5 bg-slate-900 rounded-full" />
                </div>
                
                {/* Screen Content */}
                <div className="mt-12 p-6 h-full flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-black">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between mb-8 px-2">
                    <span className="text-white text-sm font-semibold">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 border border-white/60 rounded-sm">
                        <div className="w-full h-full bg-white/80 rounded-sm" style={{ width: '75%' }} />
                      </div>
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                  </div>

                  {/* Contact Name */}
                  <div className="flex flex-col items-center mb-8 mt-4">
                    <h4 className="text-white font-semibold text-xl">
                      Voiceable AI
                    </h4>
                  </div>

                  {/* Enhanced Waveform Animation - More Dynamic */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    {[0.5, 1.0, 1.8, 1.2, 0.8, 1.5, 2.2, 1.6, 1.1, 1.9, 1.4, 0.9, 1.3, 1.7, 1.0, 0.7].map((height, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: [8, height * 32, 8],
                          opacity: [0.4, 1, 0.4],
                          scaleY: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 0.8 + (i % 3) * 0.2,
                          repeat: Infinity,
                          delay: i * 0.05,
                          ease: "easeInOut",
                        }}
                        className="w-2 bg-gradient-to-t from-violet-500 via-indigo-400 to-purple-400 rounded-full shadow-lg"
                        style={{ 
                          minHeight: '8px',
                          maxHeight: '64px',
                          boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)'
                        }}
                      />
                    ))}
                  </div>

                  {/* Call Status Section - Redesigned */}
                  <div className="flex flex-col items-center mb-6">
                    <motion.div
                      animate={{
                        scale: [1, 1.15, 1],
                        boxShadow: [
                          '0 0 0 0 rgba(34, 197, 94, 0.7)',
                          '0 0 0 20px rgba(34, 197, 94, 0)',
                          '0 0 0 0 rgba(34, 197, 94, 0)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 shadow-2xl relative"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      >
                        <Phone className="w-10 h-10 text-white" />
                      </motion.div>
                      <motion.div 
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.3, 0, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                        className="absolute inset-0 rounded-full bg-green-400/30 blur-xl" 
                      />
                    </motion.div>
                    
                    <div className="text-center space-y-3 px-4">
                      <p className="text-white font-semibold text-lg">Ready to call</p>
                      <p className="text-slate-200 text-sm text-center leading-relaxed max-w-[220px] mx-auto font-medium">
                        We'll call you to demonstrate our AI assistant
                      </p>
                    </div>
                  </div>

                  {/* Home Indicator (iPhone style) */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Background Decoration */}
        <div className="absolute inset-0 opacity-20 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 20, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
            className="absolute top-10 right-10 w-40 h-40 bg-violet-400 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -20, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
            }}
            className="absolute top-1/2 left-10 w-48 h-48 bg-indigo-400 rounded-full blur-3xl"
          />
        </div>
      </div>
    </div>
  );
};
