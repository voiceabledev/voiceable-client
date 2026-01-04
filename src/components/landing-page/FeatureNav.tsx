import { useState } from "react";
import { MessageCircle, Clock, Wand2, Layers, Zap, Users } from "lucide-react";

const features = [
  { id: "assistant", label: "Assistant", icon: MessageCircle },
  { id: "responses", label: "24/7 Responses", icon: Clock },
  { id: "autopilot", label: "Autopilot", icon: Wand2 },
  { id: "knowledge", label: "Knowledge", icon: Layers },
  { id: "workflows", label: "Workflows", icon: Zap },
  { id: "human", label: "Human-Led", icon: Users },
];

interface FeatureNavProps {
  activeFeature: string;
  onFeatureChange: (feature: string) => void;
}

const FeatureNav = ({ activeFeature, onFeatureChange }: FeatureNavProps) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <nav className="glass-dark rounded-full px-2 py-2 flex items-center gap-1">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;
          
          return (
            <button
              key={feature.id}
              onClick={() => onFeatureChange(feature.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-300
                ${isActive 
                  ? "bg-gradient-to-r from-purple/30 to-pink/30 text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{feature.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default FeatureNav;

