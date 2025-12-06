import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";

export default function OrgSettings() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
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
