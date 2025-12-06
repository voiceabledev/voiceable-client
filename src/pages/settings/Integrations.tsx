import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Link2, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const voiceProviders = [
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "AI voice cloning and generation with natural speech synthesis.",
    icon: "⫾",
    iconBg: "bg-zinc-800"
  },
  {
    id: "cartesia",
    name: "Cartesia",
    description: "Lightning-fast text-to-speech with ultra-low latency.",
    icon: "▣",
    iconBg: "bg-zinc-800"
  },
  {
    id: "deepgram",
    name: "Deepgram",
    description: "Real-time speech recognition with low latency for production use.",
    icon: "D",
    iconBg: "bg-zinc-800"
  },
  {
    id: "azure",
    name: "Azure Speech",
    description: "Enterprise text-to-speech and speech-to-text by Microsoft.",
    icon: "A",
    iconBg: "bg-red-600"
  },
  {
    id: "inworld",
    name: "Inworld",
    description: "AI voices designed for interactive character experiences.",
    icon: "⬡",
    iconBg: "bg-zinc-800"
  },
  {
    id: "rimeai",
    name: "RimeAI",
    description: "Realistic text-to-speech with emotional voice control.",
    icon: "⚏",
    iconBg: "bg-zinc-800"
  },
  {
    id: "smallestai",
    name: "SmallestAI",
    description: "Ultra-fast, low-latency voice synthesis for real-time applications.",
    icon: "⬢",
    iconBg: "bg-green-600"
  },
  {
    id: "neuphonic",
    name: "Neuphonic",
    description: "Natural-sounding text-to-speech with emotional AI.",
    icon: "ω",
    iconBg: "bg-orange-500"
  },
  {
    id: "hume",
    name: "Hume",
    description: "Emotionally intelligent AI voices with expressive speech.",
    icon: "⬢",
    iconBg: "bg-purple-600"
  },
  {
    id: "lmnt",
    name: "LMNT",
    description: "Real-time AI voice synthesis optimized for conversational AI.",
    icon: "◐",
    iconBg: "bg-yellow-500"
  },
  {
    id: "minimax",
    name: "Minimax",
    description: "Advanced text-to-speech with multilingual voice support.",
    icon: "⟁",
    iconBg: "bg-zinc-800"
  },
  {
    id: "playht",
    name: "PlayHT (Deprecated)",
    description: "High-quality AI voice generation and voice cloning.",
    icon: "⬡",
    iconBg: "bg-teal-600"
  }
];

export default function Integrations() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isVoiceProvidersOpen, setIsVoiceProvidersOpen] = useState(true);

  const filteredProviders = voiceProviders.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link2 className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Integrations</h1>
        </div>
        <div className="relative w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-secondary/50 pr-9"
          />
        </div>
      </div>

      {/* Voice Providers Section */}
      <div className="mb-6">
        <button
          onClick={() => setIsVoiceProvidersOpen(!isVoiceProvidersOpen)}
          className="flex items-center gap-2 text-muted-foreground text-sm mb-4 hover:text-foreground"
        >
          <span className="text-lg">🎙️</span>
          <span className="font-medium">Voice Providers</span>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            !isVoiceProvidersOpen && "-rotate-90"
          )} />
        </button>

        {isVoiceProvidersOpen && (
          <div className="grid grid-cols-3 gap-4">
            {filteredProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  if (provider.id === "elevenlabs") {
                    navigate("/settings/integrations/elevenlabs");
                  }
                }}
                className="flex flex-col items-start p-4 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors text-left"
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-3",
                  provider.iconBg
                )}>
                  {provider.icon}
                </div>
                <h3 className="font-medium mb-1">{provider.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{provider.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
