import React from "react";
import { Input } from "@/components/ui/input";

interface NameStepProps {
  name: string;
  onNameChange: (name: string) => void;
}

export function NameStep({ name, onNameChange }: NameStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Assistant Name</label>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter a name for your assistant"
          className="w-full bg-white"
        />
      </div>
    </div>
  );
}
