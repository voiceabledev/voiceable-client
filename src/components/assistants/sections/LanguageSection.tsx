import React from "react";
import { Mic, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
        <Mic className="h-4 w-4" />
        <span>LANGUAGE</span>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <button className="w-full flex items-start justify-between gap-2" onClick={onToggleExpanded}>
          <div className="text-left flex-1">
            <p className="text-xs md:text-sm text-muted-foreground">
              Select the language your agent will use for conversations.
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1",
              expanded && "rotate-180"
            )}
          />
        </button>

        {expanded && (
          <div className="mt-4 md:mt-6 space-y-4 md:space-y-6">
            <div>
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
        )}
      </div>
    </div>
  );
};
