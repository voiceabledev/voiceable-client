import React from "react";
import { Code, ChevronDown, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ModelSectionProps = {
  expanded: boolean;
  onToggleExpanded: () => void;
  selectedProvider: string;
  setSelectedProvider: (provider: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  providers: { value: string; label: string; icon: string }[];
  modelsByProvider: Record<string, { value: string; label: string }[]>;
};

export const ModelSection: React.FC<ModelSectionProps> = ({
  expanded,
  onToggleExpanded,
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel,
  providers,
  modelsByProvider,
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
        <Code className="h-4 w-4" />
        <span>MODEL</span>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <button className="w-full flex items-start justify-between gap-2" onClick={onToggleExpanded}>
          <div className="text-left flex-1">
            <h3 className="text-base md:text-lg font-semibold">Model</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Configure the behavior of the assistant.</p>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1",
              expanded && "rotate-180"
            )}
          />
        </button>

        {expanded && (
          <div className="mt-4 md:mt-6 space-y-4">
            {/* Provider and Model in same row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Provider */}
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-2 block">Provider</label>
                <Select
                  value={selectedProvider || "openai"}
                  onValueChange={(value) => {
                    setSelectedProvider(value);
                    const models = modelsByProvider[value];
                    if (models && models.length > 0) {
                      setSelectedModel(models[0].value);
                    }
                  }}
                >
                  <SelectTrigger className="bg-white border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <span className="flex items-center gap-2">
                          <span>{provider.icon}</span>
                          <span>{provider.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Model */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm text-muted-foreground">Model</label>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="bg-white border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelsByProvider[selectedProvider]?.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
