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
    <div className="max-w-2xl pt-4 md:pt-6 pl-4 md:pl-6">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings/integrations")}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0">
          ⫾
        </div>
        <h1 className="text-lg md:text-xl font-semibold">ElevenLabs</h1>
      </div>

      {/* Integration Card */}
      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 md:mb-4">
          <div>
            <h2 className="text-base md:text-lg font-semibold mb-1">ElevenLabs</h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              AI voice cloning and generation with natural speech synthesis.
            </p>
          </div>
          <a
            href="https://elevenlabs.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </a>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div className="space-y-2">
            <label className="text-xs md:text-sm text-muted-foreground">API Key</label>
            <Input
              type="password"
              placeholder="Enter API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-secondary/50 border-border h-9 md:h-10 text-xs md:text-sm"
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!apiKey.trim() || isSaving}
              className="w-full sm:w-auto text-xs md:text-sm"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}