import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  PhoneOutgoing, 
  Plus,
  Phone
} from "lucide-react";

export default function Outbound() {
  const [hasCampaigns, setHasCampaigns] = useState(false);
  const navigate = useNavigate();

  const handleCreateCampaign = () => {
    navigate("/outbound/new");
  };

  return (
    <div className="min-h-screen">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <PhoneOutgoing className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Outbound</h1>
          </div>
          <Button variant="accent" onClick={handleCreateCampaign}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {!hasCampaigns ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Phone className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No campaigns yet</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create your first campaign to start reaching out to customers
            </p>
            
            <Button variant="accent" onClick={handleCreateCampaign}>
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
  );
}
