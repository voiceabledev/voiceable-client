import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PhoneNumberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PhoneOption = 
  | "import-twilio" 
  | "import-vonage" 
  | "import-telnyx"

const phoneOptions: { id: PhoneOption; label: string }[] = [
  { id: "import-twilio", label: "Import Twilio" },
  { id: "import-vonage", label: "Import Vonage" },
  { id: "import-telnyx", label: "Import Telnyx" },
];

export function PhoneNumberModal({ open, onOpenChange }: PhoneNumberModalProps) {
  const [selectedOption, setSelectedOption] = useState<PhoneOption>("import-twilio");
  const [phoneNumber, setPhoneNumber] = useState("+14156021922");
  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [telnyxApiKey, setTelnyxApiKey] = useState("");
  const [label, setLabel] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="sr-only">Phone Number Options</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-6">
          {/* Left sidebar - options */}
          <div className="w-48 space-y-1">
            <p className="text-sm font-medium text-foreground mb-3">Phone Number Options</p>
            {phoneOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  selectedOption === option.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Right content - form */}
          <div className="flex-1 space-y-4">
            {selectedOption === "import-twilio" && (
              <>
                <div className="space-y-2">
                  <Label>Twilio Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-md">
                      <span className="text-lg">🇺🇸</span>
                    </div>
                    <Input 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-secondary/50 flex-1"
                      placeholder="+14156021922"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Twilio Account SID</Label>
                  <Input 
                    value={accountSid}
                    onChange={(e) => setAccountSid(e.target.value)}
                    className="bg-secondary/50"
                    placeholder="Twilio Account SID"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Twilio Auth Token</Label>
                  <Input 
                    type="password"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    className="bg-secondary/50"
                    placeholder="Twilio Auth Token"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input 
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="bg-secondary/50"
                    placeholder="Label for Phone Number"
                  />
                </div>

                <div className="bg-secondary/30 border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Enabled</p>
                      <p className="text-sm text-muted-foreground">Enable SMS messaging for this phone number</p>
                    </div>
                    <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button variant="accent">
                    Import from Twilio
                  </Button>
                </div>
              </>
            )}

            {selectedOption === "import-vonage" && (
              <>
                <div className="space-y-2">
                  <Label>Vonage Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-md">
                      <span className="text-lg">🇺🇸</span>
                    </div>
                    <Input 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-secondary/50 flex-1"
                      placeholder="+14156021922"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-secondary/50"
                    placeholder="Enter API Key"
                  />
                </div>

                <div className="space-y-2">
                  <Label>API Secret</Label>
                  <Input 
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    className="bg-secondary/50"
                    placeholder="Enter API Secret"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input 
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="bg-secondary/50"
                    placeholder="Label for Phone Number"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button variant="accent">
                    Import from Vonage
                  </Button>
                </div>
              </>
            )}

            {selectedOption === "import-telnyx" && (
              <>
                <div className="space-y-2">
                  <Label>Telnyx Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-md">
                      <span className="text-lg">🇺🇸</span>
                    </div>
                    <Input 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-secondary/50 flex-1"
                      placeholder="+14156021922"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input 
                    value={telnyxApiKey}
                    onChange={(e) => setTelnyxApiKey(e.target.value)}
                    className="bg-secondary/50"
                    placeholder="Enter API Key"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input 
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="bg-secondary/50"
                    placeholder="Label for Phone Number"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button variant="accent">
                    Import from Telnyx
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
