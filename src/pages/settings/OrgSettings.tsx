import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";

export default function OrgSettings() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Organization Settings</h1>
      </div>

      <div className="bg-secondary/30 border border-border rounded-lg p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Organization Name</Label>
            <Input 
              defaultValue="email@example.com's Org"
              className="bg-secondary/50"
            />
          </div>

          <Button variant="accent">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
