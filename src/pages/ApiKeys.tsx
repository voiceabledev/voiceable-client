import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { Key, Lock, Plus, Eye, EyeOff, Copy, Trash2, Search, Loader2, Building2, ArrowLeft } from "lucide-react";
import { apiKeysApi, ApiKey, agentsApi, Agent } from "@/lib/api";

export default function ApiKeys() {
  const navigate = useNavigate();
  const [privateKeyVisible, setPrivateKeyVisible] = useState<Record<number, boolean>>({});
  const [publicKeyVisible, setPublicKeyVisible] = useState<Record<number, boolean>>({});
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [showPublicModal, setShowPublicModal] = useState(false);
  const [showContactSalesModal, setShowContactSalesModal] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isEnterprise, loading: authLoading } = useAuth();
  
  const fetchApiKeys = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiKeysApi.list();
      if (response.data) {
        setApiKeys(response.data);
      }
    } catch (err) {
      toast({
        title: 'Error loading API keys',
        description: err instanceof Error ? err.message : 'Failed to fetch API keys',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isEnterprise) {
      fetchApiKeys();
    }
  }, [isEnterprise, fetchApiKeys]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    try {
      await apiKeysApi.delete(id);
      toast({
        title: 'API key deleted',
        description: 'The API key has been deleted successfully.',
      });
      fetchApiKeys();
    } catch (err) {
      toast({
        title: 'Error deleting API key',
        description: err instanceof Error ? err.message : 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };
  
  const maskKey = (key: string) => {
    if (key.length <= 8) return "•".repeat(key.length);
    return key.substring(0, 8) + "•".repeat(key.length - 8);
  };

  const toggleKeyVisibility = (id: number, type: 'private' | 'public') => {
    if (type === 'private') {
      setPrivateKeyVisible(prev => ({ ...prev, [id]: !prev[id] }));
    } else {
      setPublicKeyVisible(prev => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const privateKeys = apiKeys.filter(key => key.key_type === 'private');
  const publicKeys = apiKeys.filter(key => key.key_type === 'public');

  const handleCopy = (key: string, type: "private" | "public") => {
    navigator.clipboard.writeText(key);
    toast({
      title: `${type === "private" ? "Private" : "Public"} API key copied`,
      description: "The key has been copied to your clipboard.",
    });
  };

  const handleKeyCreated = () => {
    fetchApiKeys();
  };
  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show enterprise-only message if user is not enterprise
  if (!isEnterprise) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="flex-shrink-0 hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Key className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <h1 className="text-lg md:text-xl font-semibold">API Keys</h1>
          </div>
        </div>

        {/* Content - Enterprise Only Message */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="flex items-center justify-center h-full p-4 md:p-6">
            <div className="max-w-2xl w-full bg-card border border-border rounded-xl p-8 md:p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Key className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">API Keys Available for Enterprise</h2>
              <p className="text-muted-foreground mb-8 text-base md:text-lg leading-relaxed">
                API Keys are currently available for Enterprise customers only. 
                Please contact our support team to upgrade to Enterprise and gain access to API Keys.
              </p>
              <div className="flex justify-center">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => setShowContactSalesModal(true)}
                  className="w-full sm:w-auto"
                >
                  <Building2 className="h-5 w-5 mr-2" />
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Sales Modal */}
        <Dialog open={showContactSalesModal} onOpenChange={setShowContactSalesModal}>
          <DialogContent className="max-w-4xl w-full h-[90vh] max-h-[800px] p-0 flex flex-col">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
              <DialogTitle>Schedule a Meeting</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden min-h-0">
              <iframe
                src="https://calendly.com/imvitoroliveira"
                className="w-full h-full border-0"
                title="Calendly Scheduling"
                allow="camera; microphone; geolocation"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="flex-shrink-0 hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Key className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <h1 className="text-lg md:text-xl font-semibold">API Keys</h1>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Private API Keys Section */}
              <div className="mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <Lock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-sm md:text-base">Private API Keys</h2>
                      <p className="text-xs md:text-sm text-muted-foreground">Server-side API access</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowPrivateModal(true)} className="w-full sm:w-auto text-xs md:text-sm">
                    <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                    <span className="hidden sm:inline">Add Key</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>

                {privateKeys.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground">No private API keys yet. Create one to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {privateKeys.map((key) => (
                      <div key={key.id} className="bg-card border border-border rounded-lg p-3 md:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium mb-2 text-sm md:text-base">{key.name}</p>
                            <div className="flex items-center gap-2">
                              <Key className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs md:text-sm text-muted-foreground tracking-widest font-mono truncate">
                                {privateKeyVisible[key.id] ? key.key_value : maskKey(key.key_value)}
                              </span>
                            </div>
                            {key.allowed_origins && key.allowed_origins.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                <span className="font-medium">Origins:</span> {key.allowed_origins.join(', ')}
                              </p>
                            )}
                            {key.allowed_assistants && key.allowed_assistants.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Assistants:</span> {key.allowed_assistants.join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground h-8 w-8 md:h-10 md:w-10"
                              onClick={() => toggleKeyVisibility(key.id, 'private')}
                            >
                              {privateKeyVisible[key.id] ? (
                                <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              ) : (
                                <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground h-8 w-8 md:h-10 md:w-10"
                              onClick={() => handleCopy(key.key_value, "private")}
                            >
                              <Copy className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground h-8 w-8 md:h-10 md:w-10"
                              onClick={() => handleDelete(key.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Public API Keys Section */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <Key className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-sm md:text-base">Public API Keys</h2>
                      <p className="text-xs md:text-sm text-muted-foreground">Client-side SDK access</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowPublicModal(true)} className="w-full sm:w-auto text-xs md:text-sm">
                    <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                    <span className="hidden sm:inline">Add Key</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>

                {publicKeys.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground">No public API keys yet. Create one to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {publicKeys.map((key) => (
                      <div key={key.id} className="bg-card border border-border rounded-lg p-3 md:p-4">
                        <p className="font-medium mb-2 text-sm md:text-base">{key.name}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 md:mb-4">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Key className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs md:text-sm text-muted-foreground tracking-widest font-mono truncate">
                              {publicKeyVisible[key.id] ? key.key_value : maskKey(key.key_value)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground h-8 w-8 md:h-10 md:w-10"
                              onClick={() => toggleKeyVisibility(key.id, 'public')}
                            >
                              {publicKeyVisible[key.id] ? (
                                <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              ) : (
                                <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground h-8 w-8 md:h-10 md:w-10"
                              onClick={() => handleCopy(key.key_value, "public")}
                            >
                              <Copy className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground h-8 w-8 md:h-10 md:w-10"
                              onClick={() => handleDelete(key.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
                          {key.allowed_origins && key.allowed_origins.length > 0 ? (
                            <p><span className="font-medium text-foreground">Origins:</span> {key.allowed_origins.join(', ')}</p>
                          ) : (
                            <p><span className="font-medium text-foreground">Origins:</span> All domains allowed</p>
                          )}
                          {key.allowed_assistants && key.allowed_assistants.length > 0 ? (
                            <p><span className="font-medium text-foreground">Assistants:</span> {key.allowed_assistants.join(', ')}</p>
                          ) : (
                            <p><span className="font-medium text-foreground">Assistants:</span> All Assistants allowed</p>
                          )}
                          {key.key_type === 'private' && (
                            <p><span className="font-medium text-foreground">Transient Assistants:</span> {key.transient_assistant ? 'Allowed' : 'Not allowed'}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Private API Key Modal */}
      <AddApiKeyModal
        open={showPrivateModal}
        onOpenChange={setShowPrivateModal}
        onSuccess={handleKeyCreated}
        type="private"
      />

      {/* Add Public API Key Modal */}
      <AddApiKeyModal
        open={showPublicModal}
        onOpenChange={setShowPublicModal}
        onSuccess={handleKeyCreated}
        type="public"
      />
    </div>
  );
}

interface AddApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  type: "private" | "public";
}

function AddApiKeyModal({ open, onOpenChange, onSuccess, type }: AddApiKeyModalProps) {
  const [name, setName] = useState("");
  const [allowedOrigins, setAllowedOrigins] = useState("");
  const [allowedAssistants, setAllowedAssistants] = useState<string[]>([]);
  const [transientAssistant, setTransientAssistant] = useState(true);
  const [selectedAssistant, setSelectedAssistant] = useState("");
  const [assistants, setAssistants] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchAssistants();
    }
  }, [open]);

  const fetchAssistants = async () => {
    try {
      const response = await agentsApi.list();
      if (response.data) {
        setAssistants(response.data);
      }
    } catch (err) {
      console.error('Error fetching assistants:', err);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: 'Validation error',
        description: 'Please enter a name for the API key',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const origins = allowedOrigins.split(',').map(o => o.trim()).filter(o => o.length > 0);
      
      await apiKeysApi.create({
        key_type: type,
        name: name.trim(),
        allowed_origins: origins.length > 0 ? origins : undefined,
        allowed_assistants: allowedAssistants.length > 0 ? allowedAssistants : undefined,
        transient_assistant: type === 'private' ? transientAssistant : undefined,
      });

      toast({
        title: 'API key created',
        description: `The ${type} API key has been created successfully.`,
      });

      onOpenChange(false);
      onSuccess();
      
      // Reset form
      setName("");
      setAllowedOrigins("");
      setAllowedAssistants([]);
      setTransientAssistant(true);
      setSelectedAssistant("");
    } catch (err) {
      toast({
        title: 'Error creating API key',
        description: err instanceof Error ? err.message : 'Failed to create API key',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssistant = () => {
    if (selectedAssistant && !allowedAssistants.includes(selectedAssistant)) {
      setAllowedAssistants([...allowedAssistants, selectedAssistant]);
      setSelectedAssistant("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            <DialogTitle className="text-base md:text-lg">New {type === "private" ? "Private" : "Public"} API Key</DialogTitle>
          </div>
          <DialogDescription className="text-xs md:text-sm">
            Add a new API Key to restrict access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 py-4">
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
                    <SelectItem key={assistant.id} value={assistant.id}>
                      {assistant.name || assistant.id}
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
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!name || loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                `Create ${type === "private" ? "Private" : "Public"} Token`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
