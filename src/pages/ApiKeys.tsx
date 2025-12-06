import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Key, Lock, Plus, Eye, EyeOff, Copy, Trash2, Search } from "lucide-react";

export default function ApiKeys() {
  const [privateKeyVisible, setPrivateKeyVisible] = useState(false);
  const [publicKeyVisible, setPublicKeyVisible] = useState(false);
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [showPublicModal, setShowPublicModal] = useState(false);
  const { toast } = useToast();
  
  // Placeholder keys - in real app, these would come from API/state
  const privateKey = "sk_live_1234567890abcdefghijklmnopqrstuvwxyz";
  const publicKey = "pk_live_1234567890abcdefghijklmnopqrstuvwxyz";
  
  const maskKey = (key: string) => "•".repeat(key.length);

  const handleCopy = (key: string, type: "private" | "public") => {
    navigator.clipboard.writeText(key);
    toast({
      title: `${type === "private" ? "Private" : "Public"} API key copied`,
      description: "The key has been copied to your clipboard.",
    });
  };
  return (
    <div className="min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <Key className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">API Keys</h1>
        </div>

        {/* Private API Keys Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPrivateKeyVisible(!privateKeyVisible)}
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                {privateKeyVisible ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <div>
                <h2 className="font-semibold">Private API Keys</h2>
                <p className="text-sm text-muted-foreground">Server-side API access</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPrivateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Key
            </Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium mb-2">Private Key</p>
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground tracking-widest font-mono">
                    {privateKeyVisible ? privateKey : maskKey(privateKey)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground"
                  onClick={() => handleCopy(privateKey, "private")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Public API Keys Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPublicKeyVisible(!publicKeyVisible)}
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                {publicKeyVisible ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <div>
                <h2 className="font-semibold">Public API Keys</h2>
                <p className="text-sm text-muted-foreground">Client-side SDK access</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPublicModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Key
            </Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <p className="font-medium mb-2">Public Key</p>
            <div className="flex items-center gap-2 mb-4">
              <Key className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground tracking-widest font-mono">
                {publicKeyVisible ? publicKey : maskKey(publicKey)}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground"
                  onClick={() => handleCopy(publicKey, "public")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Origins:</span> All domains allowed</p>
              <p><span className="font-medium text-foreground">Assistants:</span> All Assistants allowed</p>
              <p><span className="font-medium text-foreground">Transient Assistants:</span> Allowed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Private API Key Modal */}
      <AddApiKeyModal
        open={showPrivateModal}
        onOpenChange={setShowPrivateModal}
        type="private"
      />

      {/* Add Public API Key Modal */}
      <AddApiKeyModal
        open={showPublicModal}
        onOpenChange={setShowPublicModal}
        type="public"
      />
    </div>
  );
}

interface AddApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "private" | "public";
}

function AddApiKeyModal({ open, onOpenChange, type }: AddApiKeyModalProps) {
  const [name, setName] = useState("");
  const [allowedOrigins, setAllowedOrigins] = useState("");
  const [allowedAssistants, setAllowedAssistants] = useState<string[]>([]);
  const [transientAssistant, setTransientAssistant] = useState(true);
  const [selectedAssistant, setSelectedAssistant] = useState("");

  const handleSubmit = () => {
    // Handle API key creation here
    console.log("Creating", type, "API key:", {
      name,
      allowedOrigins,
      allowedAssistants,
      transientAssistant,
    });
    onOpenChange(false);
    // Reset form
    setName("");
    setAllowedOrigins("");
    setAllowedAssistants([]);
    setTransientAssistant(true);
    setSelectedAssistant("");
  };

  const handleAddAssistant = () => {
    if (selectedAssistant && !allowedAssistants.includes(selectedAssistant)) {
      setAllowedAssistants([...allowedAssistants, selectedAssistant]);
      setSelectedAssistant("");
    }
  };

  // Placeholder assistants list - in real app, this would come from API
  const assistants = ["Assistant 1", "Assistant 2", "Assistant 3"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <DialogTitle>New {type === "private" ? "Private" : "Public"} API Key</DialogTitle>
          </div>
          <DialogDescription>
            Add a new API Key to restrict access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="API Key Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary/50"
            />
          </div>

          {/* Allowed Origins */}
          <div className="space-y-2">
            <Label htmlFor="origins">Allowed Origins</Label>
            <Input
              id="origins"
              placeholder="Add allowed URLs"
              value={allowedOrigins}
              onChange={(e) => setAllowedOrigins(e.target.value)}
              className="bg-secondary/50"
            />
            <p className="text-xs text-muted-foreground">
              This token will be restricted to only these URLs.
            </p>
          </div>

          {/* Allowed Assistants */}
          <div className="space-y-2">
            <Label htmlFor="assistants">Allowed Assistants</Label>
            <div className="flex gap-2">
              <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                <SelectTrigger className="flex-1 bg-secondary/50">
                  <SelectValue placeholder="Select Assistants" />
                </SelectTrigger>
                <SelectContent>
                  {assistants.map((assistant) => (
                    <SelectItem key={assistant} value={assistant}>
                      {assistant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddAssistant}
                disabled={!selectedAssistant}
              >
                Add
              </Button>
            </div>
            {allowedAssistants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {allowedAssistants.map((assistant) => (
                  <span
                    key={assistant}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-sm"
                  >
                    {assistant}
                    <button
                      onClick={() =>
                        setAllowedAssistants(
                          allowedAssistants.filter((a) => a !== assistant)
                        )
                      }
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Restrict the token to selected assistants only. Leave empty for all assistants.
            </p>
          </div>

          {/* Transient Assistant (only for private keys) */}
          {type === "private" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="transient">Transient Assistant</Label>
                <Switch
                  id="transient"
                  checked={transientAssistant}
                  onCheckedChange={setTransientAssistant}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Allow transient assistants when creating a call.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!name}>
              Create {type === "private" ? "Private" : "Public"} Token
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
