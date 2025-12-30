import React from "react";
import { Mic, ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageSelectorDialog } from "@/components/assistants/LanguageSelectorDialog";

// Language code to display name mapping (for display purposes)
const languageLabels: Record<string, string> = {
  'ar': 'Arabic',
  'bg': 'Bulgarian',
  'zh': 'Chinese',
  'hr': 'Croatian',
  'cs': 'Czech',
  'da': 'Danish',
  'nl': 'Dutch',
  'en': 'English',
  'fil': 'Filipino',
  'fi': 'Finnish',
  'fr': 'French',
  'de': 'German',
  'el': 'Greek',
  'hi': 'Hindi',
  'hu': 'Hungarian',
  'id': 'Indonesian',
  'it': 'Italian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ms': 'Malay',
  'no': 'Norwegian',
  'pl': 'Polish',
  'pt-br': 'Portuguese (Brazil)',
  'pt': 'Portuguese',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sk': 'Slovak',
  'es': 'Spanish',
  'sv': 'Swedish',
  'ta': 'Tamil',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'vi': 'Vietnamese',
};

// Helper to get flag URL
const getFlagUrl = (langCode: string): string => {
  const flagMap: Record<string, string> = {
    'ar': 'ae', 'bg': 'bg', 'zh': 'cn', 'hr': 'hr', 'cs': 'cz', 'da': 'dk',
    'nl': 'nl', 'en': 'us', 'fil': 'ph', 'fi': 'fi', 'fr': 'fr', 'de': 'de',
    'el': 'gr', 'hi': 'in', 'hu': 'hu', 'id': 'id', 'it': 'it', 'ja': 'jp',
    'ko': 'kr', 'ms': 'my', 'no': 'no', 'pl': 'pl', 'pt-br': 'br', 'pt': 'pt',
    'ro': 'ro', 'ru': 'ru', 'sk': 'sk', 'es': 'es', 'sv': 'se', 'ta': 'in',
    'tr': 'tr', 'uk': 'ua', 'vi': 'vn'
  };
  const countryCode = flagMap[langCode] || 'us';
  return `https://storage.googleapis.com/eleven-public-cdn/images/flags/circle-flags/${countryCode}.svg`;
};

// Helper to normalize language (convert old names to codes)
const normalizeLanguage = (lang: string): string => {
  const languageNameToCode: Record<string, string> = {
    'english': 'en',
    'spanish': 'es',
    'french': 'fr',
    'german': 'de',
    'italian': 'it',
    'portuguese': 'pt',
    'polish': 'pl',
    'turkish': 'tr',
    'russian': 'ru',
    'dutch': 'nl',
    'czech': 'cs',
    'arabic': 'ar',
    'chinese': 'zh',
    'japanese': 'ja',
    'hungarian': 'hu',
    'korean': 'ko',
  };
  
  // If it's already a code, return as-is
  if (languageLabels[lang]) {
    return lang;
  }
  // Convert old language names to codes
  return languageNameToCode[lang.toLowerCase()] || lang;
};

type LanguageSectionProps = {
  expanded: boolean;
  onToggleExpanded: () => void;
  selectedLanguages: string[];
  showLanguageSelector: boolean;
  onShowLanguageSelectorChange: (show: boolean) => void;
  onSelectLanguages: (languages: string[]) => void;
  languageSearchQuery: string;
  onLanguageSearchChange: (query: string) => void;
};

export const LanguageSection: React.FC<LanguageSectionProps> = ({
  expanded,
  onToggleExpanded,
  selectedLanguages,
  showLanguageSelector,
  onShowLanguageSelectorChange,
  onSelectLanguages,
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
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedLanguages.map((lang) => {
                    const normalized = normalizeLanguage(lang);
                    const label = languageLabels[normalized] || normalized;
                    return (
                      <div
                        key={lang}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs"
                      >
                        <img 
                          src={getFlagUrl(normalized)} 
                          alt={`${normalized.toUpperCase()} flag`}
                          className="w-3 h-3 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <span>{label}</span>
                      </div>
                    );
                  })}
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
        onSelectLanguages={onSelectLanguages}
        searchQuery={languageSearchQuery}
        onSearchChange={onLanguageSearchChange}
      />
    </div>
  );
};
