import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, User, Globe, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ManualPhoneNumber {
  name: string;
  phone_number: string;
  language: string;
}

interface AddPhoneNumberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (phoneNumber: ManualPhoneNumber) => void;
}

const LANGUAGES = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Spanish", flag: "🇪🇸" },
  { value: "fr", label: "French", flag: "🇫🇷" },
  { value: "de", label: "German", flag: "🇩🇪" },
  { value: "it", label: "Italian", flag: "🇮🇹" },
  { value: "pt", label: "Portuguese", flag: "🇵🇹" },
  { value: "zh", label: "Chinese", flag: "🇨🇳" },
  { value: "ja", label: "Japanese", flag: "🇯🇵" },
  { value: "ko", label: "Korean", flag: "🇰🇷" },
  { value: "ar", label: "Arabic", flag: "🇸🇦" },
  { value: "hi", label: "Hindi", flag: "🇮🇳" },
  { value: "ru", label: "Russian", flag: "🇷🇺" },
];

export function AddPhoneNumberModal({ open, onOpenChange, onAdd }: AddPhoneNumberModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [language, setLanguage] = useState("en");
  const [adding, setAdding] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isNameValid = name.trim().length > 0;
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  const isPhoneValid = phoneRegex.test(phoneNumber.trim());
  const isFormValid = isNameValid && isPhoneValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for the recipient.',
        variant: 'destructive',
      });
      return;
    }

    if (!phoneNumber.trim()) {
      toast({
        title: 'Phone number required',
        description: 'Please enter a phone number.',
        variant: 'destructive',
      });
      return;
    }

    if (!isPhoneValid) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid phone number in E.164 format (e.g., +16047102121).',
        variant: 'destructive',
      });
      return;
    }

    setAdding(true);
    try {
      onAdd({
        name: name.trim(),
        phone_number: phoneNumber.trim(),
        language: language,
      });

      toast({
        title: 'Recipient added',
        description: `${name} has been added to the campaign.`,
      });

      setName("");
      setPhoneNumber("");
      setLanguage("en");
      onOpenChange(false);
    } catch (err) {
      toast({
        title: 'Error adding recipient',
        description: err instanceof Error ? err.message : 'Failed to add recipient',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    if (!adding) {
      setName("");
      setPhoneNumber("");
      setLanguage("en");
      setFocusedField(null);
      onOpenChange(false);
    }
  };

  const selectedLang = LANGUAGES.find(l => l.value === language);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card border-border overflow-hidden">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-violet-light flex items-center justify-center shadow-lg shadow-accent/20">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Add Recipient</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Add a phone number to your batch call</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Name Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name" className="text-sm font-medium">Recipient Name</Label>
              {isNameValid && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-in zoom-in duration-200" />
              )}
            </div>
            <div className="relative">
              <User className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                focusedField === 'name' ? "text-accent" : "text-muted-foreground"
              )} />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g., John Smith, Acme Corp"
                className={cn(
                  "pl-10 h-11 bg-muted/50 transition-all",
                  focusedField === 'name' && "ring-2 ring-accent/30 border-accent/50"
                )}
                disabled={adding}
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="phone-number" className="text-sm font-medium">Phone Number</Label>
              {phoneNumber && (
                isPhoneValid ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-in zoom-in duration-200" />
                ) : (
                  <span className="text-xs text-amber-500">Invalid format</span>
                )
              )}
            </div>
            <div className="relative">
              <Phone className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                focusedField === 'phone' ? "text-accent" : "text-muted-foreground"
              )} />
              <Input
                id="phone-number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                placeholder="+16047102121"
                className={cn(
                  "pl-10 h-11 bg-muted/50 font-mono transition-all",
                  focusedField === 'phone' && "ring-2 ring-accent/30 border-accent/50",
                  phoneNumber && !isPhoneValid && "border-amber-500/50"
                )}
                disabled={adding}
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Use E.164 format: + followed by country code and number
            </p>
          </div>

          {/* Language Field */}
          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium">Language</Label>
            <Select
              value={language}
              onValueChange={setLanguage}
              disabled={adding}
            >
              <SelectTrigger
                id="language"
                className="h-11 bg-muted/50"
                onFocus={() => setFocusedField('language')}
                onBlur={() => setFocusedField(null)}
              >
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{selectedLang?.flag}</span>
                    <span>{selectedLang?.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <div className="flex items-center gap-3">
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The agent will speak this language during the call
            </p>
          </div>

          {/* Preview Card */}
          {(name || phoneNumber) && (
            <div className="p-3 bg-muted/30 rounded-xl border border-border animate-in slide-in-from-bottom-2 duration-200">
              <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{name || "Recipient name"}</p>
                  <p className="text-xs text-muted-foreground font-mono">{phoneNumber || "+1234567890"}</p>
                </div>
                <div className="text-lg">{selectedLang?.flag}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={adding}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              disabled={adding || !isFormValid}
              className={cn(
                "h-10 min-w-[120px] shadow-lg transition-all",
                isFormValid ? "shadow-accent/20 hover:shadow-xl hover:shadow-accent/30" : ""
              )}
            >
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Add Recipient
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
