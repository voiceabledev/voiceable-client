import React from "react";
import { Mic, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { WorkflowStyleCard } from "@/components/assistants/WorkflowStyleCard";

type LanguageSectionProps = {
  expanded: boolean;
  onToggleExpanded: () => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
};

export const LanguageSection: React.FC<LanguageSectionProps> = ({
  expanded,
  onToggleExpanded,
  selectedLanguage,
  setSelectedLanguage,
}) => {
  return (
    <div>
      <WorkflowStyleCard
        title="Language"
        description="Select the language your agent will use for conversations."
        icon={Mic}
        expanded={expanded}
        onToggle={onToggleExpanded}
      >
        <div className="space-y-4 md:space-y-6">
            {/* Language */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="bg-white border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="portuguese">Portuguese</SelectItem>
                  <SelectItem value="polish">Polish</SelectItem>
                  <SelectItem value="turkish">Turkish</SelectItem>
                  <SelectItem value="russian">Russian</SelectItem>
                  <SelectItem value="dutch">Dutch</SelectItem>
                  <SelectItem value="czech">Czech</SelectItem>
                  <SelectItem value="arabic">Arabic</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="hungarian">Hungarian</SelectItem>
                  <SelectItem value="korean">Korean</SelectItem>
                  <SelectItem value="multi">Multi</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </div>
      </WorkflowStyleCard>
    </div>
  );
};
