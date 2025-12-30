import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link2, X, Users, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowName: string;
}

type PermissionLevel = "viewer" | "commenter" | "editor";

export function ShareModal({ open, onOpenChange, workflowName }: ShareModalProps) {
  const { toast } = useToast();
  const [emailInput, setEmailInput] = useState("");
  const [permission, setPermission] = useState<PermissionLevel>("editor");
  const [isTemplate, setIsTemplate] = useState(false);

  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied",
      description: "The workflow link has been copied to your clipboard.",
    });
  };

  const handleShare = () => {
    if (!emailInput.trim()) {
      toast({
        title: "Email required",
        description: "Please enter a name or email address.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement actual sharing API call
    toast({
      title: "Share invitation sent",
      description: `An invitation has been sent to ${emailInput} with ${permission} access.`,
    });
    
    setEmailInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <span>Share '{workflowName}'</span>
            </DialogTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                <Link2 className="h-4 w-4 mr-1.5" />
                Copy link
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Share Input Section */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type name or email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleShare();
                }
              }}
              className="flex-1"
            />
            <Select value={permission} onValueChange={(value) => setPermission(value as PermissionLevel)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="commenter">Commenter</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleShare} size="default">
              Share
            </Button>
          </div>

          {/* Who has access */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Who has access</h3>
            <div className="space-y-2">
              {/* Owner */}
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-xs font-semibold text-orange-600">V</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Vitor Oliveira (You)</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">Owner</span>
              </div>

              {/* Workspace Access */}
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Everyone in Vitor Oliveira's Workspace</p>
                  </div>
                </div>
                <Select defaultValue="no-access">
                  <SelectTrigger className="w-[120px] h-8 border-none shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-access">No access</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="commenter">Commenter</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Make this a template */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Label htmlFor="template-toggle" className="text-sm font-normal cursor-pointer">
                Make this a template
              </Label>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <Switch
              id="template-toggle"
              checked={isTemplate}
              onCheckedChange={setIsTemplate}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

