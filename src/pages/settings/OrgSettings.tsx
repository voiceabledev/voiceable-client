import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowLeft } from "lucide-react";

export default function OrgSettings() {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-2xl pt-4 md:pt-6 pl-4 md:pl-6 pr-4 md:pr-6">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings")}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <h1 className="text-lg md:text-xl font-semibold">Organization Settings</h1>
      </div>

      <div className="bg-secondary/30 border border-border rounded-lg p-4 md:p-6">
        <div className="space-y-3 md:space-y-4">
          <div className="space-y-2">
            <Label className="text-xs md:text-sm">Organization Name</Label>
            <Input 
              defaultValue="email@example.com's Org"
              className="bg-secondary/50 h-9 md:h-10 text-xs md:text-sm"
            />
          </div>

          <Button variant="accent" className="w-full sm:w-auto text-xs md:text-sm">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
