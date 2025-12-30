import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Language code to flag country code mapping (for ElevenLabs flag images)
const languageFlagMap: Record<string, string> = {
  'ar': 'ae',   // Arabic
  'bg': 'bg',   // Bulgarian
  'zh': 'cn',   // Chinese
  'hr': 'hr',   // Croatian
  'cs': 'cz',   // Czech
  'da': 'dk',   // Danish
  'nl': 'nl',   // Dutch
  'en': 'us',   // English
  'fil': 'ph',  // Filipino
  'fi': 'fi',   // Finnish
  'fr': 'fr',   // French
  'de': 'de',   // German
  'el': 'gr',   // Greek
  'hi': 'in',   // Hindi
  'hu': 'hu',   // Hungarian
  'id': 'id',   // Indonesian
  'it': 'it',   // Italian
  'ja': 'jp',   // Japanese
  'ko': 'kr',   // Korean
  'ms': 'my',   // Malay
  'no': 'no',   // Norwegian
  'pl': 'pl',   // Polish
  'pt-br': 'br', // Portuguese (Brazil)
  'pt': 'pt',   // Portuguese
  'ro': 'ro',   // Romanian
  'ru': 'ru',   // Russian
  'sk': 'sk',   // Slovak
  'es': 'es',   // Spanish
  'sv': 'se',   // Swedish
  'ta': 'in',   // Tamil
  'tr': 'tr',   // Turkish
  'uk': 'ua',   // Ukrainian
  'vi': 'vn',   // Vietnamese
};

// Language code to display name mapping
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

// Map from our internal language names to language codes
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

// Available languages (using language codes)
const availableLanguages = [
  'ar', 'bg', 'zh', 'hr', 'cs', 'da', 'nl', 'en', 'fil', 'fi', 'fr', 'de',
  'el', 'hi', 'hu', 'id', 'it', 'ja', 'ko', 'ms', 'no', 'pl', 'pt-br', 'pt',
  'ro', 'ru', 'sk', 'es', 'sv', 'ta', 'tr', 'uk', 'vi'
];

// Helper to get flag URL
const getFlagUrl = (langCode: string): string => {
  const countryCode = languageFlagMap[langCode] || 'us';
  return `https://storage.googleapis.com/eleven-public-cdn/images/flags/circle-flags/${countryCode}.svg`;
};

// Helper to normalize language (convert old names to codes)
const normalizeLanguage = (lang: string): string => {
  // If it's already a code, return as-is
  if (availableLanguages.includes(lang)) {
    return lang;
  }
  // Convert old language names to codes
  return languageNameToCode[lang.toLowerCase()] || lang;
};

interface LanguageSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLanguages: string[];
  onSelectLanguages: (languages: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const LanguageSelectorDialog = ({
  open,
  onOpenChange,
  selectedLanguages,
  onSelectLanguages,
  searchQuery,
  onSearchChange,
}: LanguageSelectorDialogProps) => {
  // Normalize selected languages to codes - memoize to avoid recalculation
  const normalizedSelected = React.useMemo(() => {
    return selectedLanguages.map(normalizeLanguage);
  }, [selectedLanguages]);
  
  const [localSelectedLanguages, setLocalSelectedLanguages] = useState<string[]>(normalizedSelected);

  // Sync local state when prop changes or dialog opens
  useEffect(() => {
    if (open) {
      const normalized = selectedLanguages.map(normalizeLanguage);
      // Ensure English is always included
      const withEnglish = normalized.includes('en') ? normalized : ['en', ...normalized];
      setLocalSelectedLanguages(withEnglish);
    }
  }, [open, selectedLanguages]);

  const toggleLanguageSelection = (language: string) => {
    // Prevent deselecting English
    if (language === 'en') {
      return;
    }
    
    setLocalSelectedLanguages(prev => {
      if (prev.includes(language)) {
        // Remove the language, but keep English
        return prev.filter(lang => lang !== language);
      } else {
        // Add the language, ensure English is included
        const newLangs = [...prev, language];
        return newLangs.includes('en') ? newLangs : ['en', ...newLangs];
      }
    });
  };

  const handleConfirm = () => {
    // Ensure English is always included before confirming
    const withEnglish = localSelectedLanguages.includes('en') 
      ? localSelectedLanguages 
      : ['en', ...localSelectedLanguages];
    onSelectLanguages(withEnglish);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset to normalized selected languages
    const normalized = selectedLanguages.map(normalizeLanguage);
    setLocalSelectedLanguages(normalized);
    onOpenChange(false);
  };

  const filteredLanguages = availableLanguages.filter(language => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const label = languageLabels[language] || language;
    return label.toLowerCase().includes(query) || language.toLowerCase().includes(query);
  });

  const allSelected = filteredLanguages.length > 0 && filteredLanguages.every(lang => localSelectedLanguages.includes(lang));
  const someSelected = filteredLanguages.some(lang => localSelectedLanguages.includes(lang));

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all filtered languages
      setLocalSelectedLanguages(prev => prev.filter(lang => !filteredLanguages.includes(lang)));
    } else {
      // Select all filtered languages
      const filteredLangs = [...filteredLanguages];
      setLocalSelectedLanguages(prev => {
        const newLangs = [...prev];
        filteredLangs.forEach(lang => {
          if (!newLangs.includes(lang)) {
            newLangs.push(lang);
          }
        });
        return newLangs;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Languages</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Search Bar and Select All */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for a language..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            {filteredLanguages.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="whitespace-nowrap"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>

          {/* Languages List */}
          <div className="flex-1 overflow-y-auto">
            {filteredLanguages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No languages found matching your search.' : 'No languages available.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredLanguages.map((language) => {
                  const isSelected = localSelectedLanguages.includes(language);
                  const label = languageLabels[language] || language;
                  const flagUrl = getFlagUrl(language);
                  const isDefault = language === 'en';

                  return (
                    <div
                      key={language}
                      className={cn(
                        "relative p-4 rounded-lg border-2 transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 hover:bg-primary/10"
                          : "border-border hover:border-primary/30 hover:bg-secondary/50",
                        isDefault && "opacity-100" // English is always available but can be selected
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (!isDefault) {
                              toggleLanguageSelection(language);
                            }
                          }}
                          className="mt-1"
                          disabled={isDefault}
                        />

                        {/* Language Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <img 
                              src={flagUrl} 
                              alt={`${language.toUpperCase()} flag`}
                              className="shrink-0 rounded-full object-cover w-5 h-5"
                              onError={(e) => {
                                // Fallback to emoji if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                if (!target.nextElementSibling) {
                                  const fallback = document.createElement('span');
                                  fallback.className = 'text-lg';
                                  fallback.textContent = '🌐';
                                  target.parentElement?.insertBefore(fallback, target);
                                }
                              }}
                            />
                            <h3 className="font-semibold text-sm truncate">
                              {label}
                            </h3>
                            {isDefault && (
                              <span className="inline-flex items-center text-xs rounded-full font-medium transition-colors whitespace-nowrap bg-gray-alpha-100 text-foreground h-5 px-2">
                                Default
                              </span>
                            )}
                            {isSelected && !isDefault && (
                              <Check className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with selection count and buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {localSelectedLanguages.length} language{localSelectedLanguages.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

