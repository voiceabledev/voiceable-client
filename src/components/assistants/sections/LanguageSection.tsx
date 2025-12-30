import React from "react";
import { Mic, ChevronDown, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LanguageSelectorDialog } from "@/components/assistants/LanguageSelectorDialog";
import { languageLabels, getFlagUrl, normalizeLanguage } from "@/constants/languages";

type LanguageSectionProps = {
  expanded: boolean;
  onToggleExpanded: () => void;
  selectedLanguages: string[];
  defaultLanguage?: string;
  showLanguageSelector: boolean;
  onShowLanguageSelectorChange: (show: boolean) => void;
  onSelectLanguages: (languages: string[], defaultLanguage: string) => void;
  onSetDefaultLanguage?: (language: string) => void;
  languageSearchQuery: string;
  onLanguageSearchChange: (query: string) => void;
};

export const LanguageSection: React.FC<LanguageSectionProps> = ({
  expanded,
  onToggleExpanded,
  selectedLanguages,
  defaultLanguage,
  showLanguageSelector,
  onShowLanguageSelectorChange,
  onSelectLanguages,
  onSetDefaultLanguage,
  languageSearchQuery,
  onLanguageSearchChange,
}) => {
  const getLanguageDisplay = () => {
    const normalized = selectedLanguages.map(normalizeLanguage);
    if (normalized.length === 0) {
      return <span className="text-muted-foreground">Select languages</span>;
    } else if (normalized.length === 1) {
      const lang = normalized[0];
      const label = languageLabels[lang] || lang;
      const isDefault = defaultLanguage && normalizeLanguage(defaultLanguage) === lang;
      return (
        <span className="flex items-center gap-2">
          <img 
            src={getFlagUrl(lang)} 
            alt={`${lang.toUpperCase()} flag`}
            className="w-4 h-4 rounded-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <span>{label}</span>
          {isDefault && (
            <Star className="h-3.5 w-3.5 fill-primary text-primary shrink-0" />
          )}
        </span>
      );
    } else {
      return <span>{normalized.length} languages selected</span>;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
        <Mic className="h-4 w-4" />
        <span>LANGUAGE{selectedLanguages.length !== 1 ? 'S' : ''}</span>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <button className="w-full flex items-start justify-between gap-2" onClick={onToggleExpanded}>
          <div className="text-left flex-1">
            <p className="text-xs md:text-sm text-muted-foreground">
              Select the language{selectedLanguages.length !== 1 ? 's' : ''} your agent will use for conversations.
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
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start bg-white"
                onClick={() => onShowLanguageSelectorChange(true)}
              >
                <Globe className="h-4 w-4 mr-2" />
                {getLanguageDisplay()}
              </Button>
              
              {/* Display selected languages as badges */}
              {selectedLanguages.length > 0 && (
                <div className="space-y-2 mt-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedLanguages.map((lang) => {
                      const normalized = normalizeLanguage(lang);
                      const label = languageLabels[normalized] || normalized;
                      const isDefault = defaultLanguage && normalizeLanguage(defaultLanguage) === normalized;
                      
                      const handleSetDefault = (e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (onSetDefaultLanguage && !isDefault) {
                          onSetDefaultLanguage(normalized);
                        }
                      };
                      
                      return (
                        <Badge
                          key={lang}
                          variant={isDefault ? "default" : "secondary"}
                          className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={handleSetDefault}
                          title={isDefault ? "Default language (click to change)" : onSetDefaultLanguage ? "Click to set as default" : undefined}
                        >
                          {isDefault && <Star className="h-3 w-3 fill-current" />}
                          <img 
                            src={getFlagUrl(normalized)} 
                            alt={`${normalized.toUpperCase()} flag`}
                            className="w-3 h-3 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <span className="text-xs">
                            {label}
                          </span>
                          {isDefault && (
                            <span className="text-xs ml-1">(Default)</span>
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                  {selectedLanguages.length > 1 && !defaultLanguage && (
                    <p className="text-xs text-muted-foreground">
                      Click a language badge to set it as default for ElevenLabs
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <LanguageSelectorDialog
        open={showLanguageSelector}
        onOpenChange={onShowLanguageSelectorChange}
        selectedLanguages={selectedLanguages}
        defaultLanguage={defaultLanguage}
        onSelectLanguages={onSelectLanguages}
        searchQuery={languageSearchQuery}
        onSearchChange={onLanguageSearchChange}
      />
    </div>
  );
};
