import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Play,
  AudioLines,
  ArrowLeft
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const voices = [
  { name: "Payne", gender: "MALE", accent: "AMERICAN" },
  { name: "Will", gender: "MALE", accent: "" },
  { name: "Manav - Husky & Conver...", gender: "MALE", accent: "INDIAN" },
  { name: "Alon - Deep, Resonant an...", gender: "MALE", accent: "AMERICAN" },
  { name: "Raquel - For Conversatio...", gender: "FEMALE", accent: "BRAZILIAN" },
  { name: "Commercial British Voice ...", gender: "MALE", accent: "BRITISH" },
  { name: "Liam Dale - British Male 6...", gender: "MALE", accent: "BRITISH" },
  { name: "Melissa - Pasifika New Ze...", gender: "FEMALE", accent: "NEW ZEALAND" },
  { name: "Sean - Natural Conversati...", gender: "MALE", accent: "AMERICAN" },
  { name: "Louise - Customer Servic...", gender: "FEMALE", accent: "STOCKHOLM" },
  { name: "Charlie", gender: "MALE", accent: "AUSTRALIAN" },
  { name: "Beth - gentle and nurturing", gender: "FEMALE", accent: "BRITISH" },
  { name: "Bex UK Female", gender: "FEMALE", accent: "BRITISH" },
  { name: "Knightley Javier -Calm, G...", gender: "MALE", accent: "AMERICAN" },
  { name: "Giovanni Rossi - giovane", gender: "MALE", accent: "STANDARD" },
  { name: "Alex Ozwyn", gender: "FEMALE", accent: "AMERICAN" },
  { name: "Kina (Cute happy girl) - P...", gender: "FEMALE", accent: "STANDARD" },
  { name: "Kiko Hdz", gender: "MALE", accent: "MEXICAN" },
  { name: "Kira - authentic storytelli...", gender: "FEMALE", accent: "AMERICAN" },
  { name: "BrittW", gender: "FEMALE", accent: "AMERICAN" },
];

export default function VoiceLibrary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <AudioLines className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Voice Library</h1>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search voices..." 
              className="pl-9 bg-secondary/50 border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select defaultValue="11labs">
            <SelectTrigger className="w-28 bg-secondary/50 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="11labs">11labs</SelectItem>
              <SelectItem value="vapi">Vapi</SelectItem>
              <SelectItem value="deepgram">Deepgram</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-gender">
            <SelectTrigger className="w-28 bg-secondary/50 border-border">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-gender">Gender</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-accent">
            <SelectTrigger className="w-28 bg-secondary/50 border-border">
              <SelectValue placeholder="Accent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-accent">Accent</SelectItem>
              <SelectItem value="american">American</SelectItem>
              <SelectItem value="british">British</SelectItem>
              <SelectItem value="australian">Australian</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 md:p-6">
          {/* Voice Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {voices.map((voice, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <AudioLines className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{voice.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                        {voice.gender}
                      </span>
                      {voice.accent && (
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                          {voice.accent}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-secondary rounded-md">
                    <Play className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
