import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function ElevenLabsIntegration() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setIsSaving(true);
    // Here you would save the API key securely
    console.log("Saving ElevenLabs API key");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/settings/integrations")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold text-lg">
          ⫾
        </div>
        <h1 className="text-xl font-semibold">ElevenLabs</h1>
      </div>

      {/* Integration Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">ElevenLabs</h2>
            <p className="text-sm text-muted-foreground">
              AI voice cloning and generation with natural speech synthesis.
            </p>
          </div>
          <a
            href="https://elevenlabs.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">API Key</label>
            <Input
              type="password"
              placeholder="Enter API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!apiKey.trim() || isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}