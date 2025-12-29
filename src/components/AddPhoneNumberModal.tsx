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
import { Loader2, Phone } from "lucide-react";

interface AddPhoneNumberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, phoneNumber: string, language: string) => void;
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "ru", label: "Russian" },
];

export function AddPhoneNumberModal({ open, onOpenChange, onAdd }: AddPhoneNumberModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [language, setLanguage] = useState("en");
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for the phone number.',
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

    // Basic phone number validation (E.164 format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid phone number in E.164 format (e.g., +1234567890).',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      // Call the onAdd callback to add to local state
      onAdd(name.trim(), phoneNumber.trim(), language);
      
      toast({
        title: 'Phone number added',
        description: `Phone number "${name}" has been added to the campaign.`,
      });
      
      // Reset form
      setName("");
      setPhoneNumber("");
      setLanguage("en");
      
      // Close modal
      onOpenChange(false);
    } catch (err) {
      toast({
        title: 'Error adding phone number',
        description: err instanceof Error ? err.message : 'Failed to add phone number',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      setName("");
      setPhoneNumber("");
      setLanguage("en");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add Phone Number</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main Support Line"
              className="bg-secondary/50"
              disabled={creating}
            />
            <p className="text-xs text-muted-foreground">
              A descriptive name to identify this phone number
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-number">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone-number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="bg-secondary/50 pl-9"
                disabled={creating}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter phone number in E.164 format (e.g., +1234567890)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={language}
              onValueChange={setLanguage}
              disabled={creating}
            >
              <SelectTrigger id="language" className="bg-secondary/50">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The primary language for calls to this number
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              disabled={creating || !name.trim() || !phoneNumber.trim()}
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Phone Number'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

