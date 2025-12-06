import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  PhoneOutgoing, 
  Plus,
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Outbound() {
  const [hasCampaigns, setHasCampaigns] = useState(false);
  const navigate = useNavigate();

  const handleCreateCampaign = () => {
    navigate("/outbound/new");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            <PhoneOutgoing className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <h1 className="text-lg md:text-xl font-semibold">Outbound</h1>
          </div>
          <Button 
            variant="accent" 
            onClick={handleCreateCampaign}
            size="icon"
            className="md:size-auto md:px-4 md:py-2"
          >
            <Plus className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Create Campaign</span>
          </Button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 md:p-6 pr-4 md:pr-6">
          {!hasCampaigns ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Phone className="h-5 w-5 md:h-7 md:w-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold mb-2 text-center">No campaigns yet</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6 text-sm md:text-base">
              Create your first campaign to start reaching out to customers
            </p>
            
            <Button variant="accent" onClick={handleCreateCampaign} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        ) : (
          <div>
            {/* Campaigns list would go here */}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
