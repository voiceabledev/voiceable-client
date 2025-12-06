import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Phone, 
  Search, 
  Plus
} from "lucide-react";
import { PhoneNumberModal } from "@/components/PhoneNumberModal";

export default function PhoneNumbers() {
  const [hasNumbers, setHasNumbers] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Phone className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Phone Numbers</h1>
        </div>

        {!hasNumbers ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-20 h-20 rounded-2xl border-2 border-muted flex items-center justify-center mb-6">
              <Phone className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Phone Numbers</h2>
            <p className="text-muted-foreground text-center max-w-md mb-2">
              Assistants are able to be connected to phone numbers for calls.
            </p>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              You can import from Twilio, vonage, or create a free number directly from Vapi for use with your assistants.
            </p>
            
            <Button variant="outline" className="mb-4" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Phone Number
            </Button>
            
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search Phone Numbers" 
                className="pl-9 bg-secondary/50 border-border"
              />
            </div>
          </div>
        ) : (
          <div>
            {/* Phone numbers list would go here */}
          </div>
        )}
      </div>

      <PhoneNumberModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
