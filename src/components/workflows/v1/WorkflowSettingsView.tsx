import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, X, Plus, FileText, Check, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowSettingsViewProps {
  greetingMessage: string;
  context: string;
  memories: Array<{ id: string; content: string }>;
  defaultModel: string;
  safeMode: boolean;
  onGreetingMessageChange: (message: string) => void;
  onContextChange: (context: string) => void;
  onMemoriesChange: (memories: Array<{ id: string; content: string }>) => void;
  onDefaultModelChange: (model: string) => void;
  onSafeModeChange: (safeMode: boolean) => void;
}

export function WorkflowSettingsView({
  greetingMessage,
  context,
  memories,
  defaultModel,
  safeMode,
  onGreetingMessageChange,
  onContextChange,
  onMemoriesChange,
  onDefaultModelChange,
  onSafeModeChange,
}: WorkflowSettingsViewProps) {
  const [newMemory, setNewMemory] = useState("");

  const handleAddMemory = () => {
    if (newMemory.trim()) {
      onMemoriesChange([
        ...memories,
        {
          id: `memory-${Date.now()}`,
          content: newMemory.trim(),
        },
      ]);
      setNewMemory("");
    }
  };

  const handleRemoveMemory = (id: string) => {
    onMemoriesChange(memories.filter((m) => m.id !== id));
  };

  const handleGenerateGreeting = () => {
    // TODO: Implement AI generation
    const generated = "Hello! I'm here to help you with your needs. How can I assist you today?";
    onGreetingMessageChange(generated);
  };

  return (
    <div className="h-full w-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Greeting Message Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-semibold">Greeting message</Label>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateGreeting}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate
            </Button>
          </div>
          <Textarea
            value={greetingMessage}
            onChange={(e) => onGreetingMessageChange(e.target.value)}
            placeholder="This is the introductory message users see on an empty task."
            className="min-h-[150px] resize-y w-full"
          />
        </div>

        {/* Context Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-semibold">Context</Label>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <Textarea
            value={context}
            onChange={(e) => onContextChange(e.target.value)}
            placeholder="E.g. You're a customer support agent for Acme, a bakery. Your goal is to reply to tickets and escalate to a human when unsure."
            className="min-h-[200px] resize-y w-full"
          />
        </div>

      {/* Memories Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">Memories</Label>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="flex items-center justify-between p-3 rounded-md border border-border bg-card hover:bg-secondary/50"
            >
              <span className="text-sm flex-1">{memory.content}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRemoveMemory(memory.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add a new Memory (E.g. My working hours are 9am-6pm)"
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddMemory();
                }
              }}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddMemory}
              disabled={!newMemory.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Default Model Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">Default model</Label>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={defaultModel} onValueChange={onDefaultModelChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Balanced Currently Gemini 3.0 Flash">
              Balanced Currently Gemini 3.0 Flash
            </SelectItem>
            <SelectItem value="Fast Currently Gemini 3.0 Flash">
              Fast Currently Gemini 3.0 Flash
            </SelectItem>
            <SelectItem value="Powerful Currently GPT-4o">
              Powerful Currently GPT-4o
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

        {/* Safe Mode Section */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="safe-mode-toggle" className="text-sm font-semibold cursor-pointer">
              Safe mode
            </Label>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <Switch
            id="safe-mode-toggle"
            checked={safeMode}
            onCheckedChange={onSafeModeChange}
          />
        </div>
      </div>
    </div>
  );
}

