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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <h1 className="text-lg md:text-xl font-semibold">Phone Numbers</h1>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 md:p-6">
          {!hasNumbers ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-muted flex items-center justify-center mb-4 md:mb-6">
                <Phone className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3 text-center">Phone Numbers</h2>
              <p className="text-muted-foreground text-center max-w-md mb-2 text-sm md:text-base">
                Assistants are able to be connected to phone numbers for calls.
              </p>
              <p className="text-muted-foreground text-center max-w-md mb-4 md:mb-6 text-sm md:text-base">
                You can import from Twilio, vonage, or create a free number directly from Contextor for use with your assistants.
              </p>
              
              <Button 
                variant="outline" 
                className="mb-4 w-full sm:w-auto" 
                onClick={() => setModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Phone Number
              </Button>
              
              <div className="relative w-full sm:w-80 max-w-full">
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
      </div>

      <PhoneNumberModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
