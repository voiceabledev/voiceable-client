import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { providers, modelsByProvider } from "../constants";

interface ModelStepProps {
  selectedProvider: string;
  selectedModel: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
}

export function ModelStep({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
}: ModelStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Provider</label>
        <Select
          value={selectedProvider}
          onValueChange={(value) => {
            onProviderChange(value);
            const models = modelsByProvider[value];
            if (models && models.length > 0) {
              onModelChange(models[0].value);
            }
          }}
        >
          <SelectTrigger className="bg-white">
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
      <div>
        <label className="text-sm font-medium mb-2 block">Model</label>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger className="bg-white">
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
  );
}
