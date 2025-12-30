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
import { Search, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { languageLabels, getFlagUrl, normalizeLanguage, availableLanguages } from "@/constants/languages";

interface LanguageSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLanguages: string[];
  defaultLanguage?: string;
  onSelectLanguages: (languages: string[], defaultLanguage: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const LanguageSelectorDialog = ({
  open,
  onOpenChange,
  selectedLanguages,
  defaultLanguage: propDefaultLanguage,
  onSelectLanguages,
  searchQuery,
  onSearchChange,
}: LanguageSelectorDialogProps) => {
  // Normalize selected languages to codes - memoize to avoid recalculation
  const normalizedSelected = React.useMemo(() => {
    return selectedLanguages.map(normalizeLanguage);
  }, [selectedLanguages]);
  
  const [localSelectedLanguages, setLocalSelectedLanguages] = useState<string[]>(normalizedSelected);
  const [localDefaultLanguage, setLocalDefaultLanguage] = useState<string>(
    propDefaultLanguage ? normalizeLanguage(propDefaultLanguage) : 'en'
  );

  // Sync local state when prop changes (only when dialog is closed or when props actually change)
  // This ensures that when dialog opens, it shows the last confirmed selections
  // But when dialog is open, we preserve local changes even if props haven't changed yet
  useEffect(() => {
    const normalized = selectedLanguages.map(normalizeLanguage);
    // Ensure English is always included
    const withEnglish = normalized.includes('en') ? normalized : ['en', ...normalized];
    const normalizedDefault = propDefaultLanguage ? normalizeLanguage(propDefaultLanguage) : 'en';
    const finalDefault = withEnglish.includes(normalizedDefault) ? normalizedDefault : 'en';
    
    if (!open) {
      // When dialog closes, sync to props (which should be the confirmed selections)
      setLocalSelectedLanguages(withEnglish);
      setLocalDefaultLanguage(finalDefault);
    } else {
      // When dialog opens, sync to props to show the last confirmed selections
      // But only if the props have actually changed (to avoid resetting user's in-progress selections)
      setLocalSelectedLanguages(prev => {
        const propsChanged = JSON.stringify(withEnglish.sort()) !== JSON.stringify(prev.sort());
        return propsChanged ? withEnglish : prev;
      });
      setLocalDefaultLanguage(prev => {
        return prev !== finalDefault ? finalDefault : prev;
      });
    }
  }, [open, selectedLanguages, propDefaultLanguage]);

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

  const handleSetDefaultLanguage = (language: string) => {
    // Only allow setting default if the language is selected
    if (localSelectedLanguages.includes(language)) {
      setLocalDefaultLanguage(language);
    }
  };

  const handleConfirm = () => {
    // Ensure English is always included before confirming
    const withEnglish = localSelectedLanguages.includes('en') 
      ? localSelectedLanguages 
      : ['en', ...localSelectedLanguages];
    
    // Ensure default language is in the selected languages
    const finalDefault = withEnglish.includes(localDefaultLanguage) 
      ? localDefaultLanguage 
      : 'en';
    
    onSelectLanguages(withEnglish, finalDefault);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Don't reset local state on cancel - preserve user's selections
    // They will be synced when dialog closes via the useEffect
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
                  const isDefaultLang = localDefaultLanguage === language;
                  const label = languageLabels[language] || language;
                  const flagUrl = getFlagUrl(language);
                  const isEnglish = language === 'en';

                  return (
                    <div
                      key={language}
                      className={cn(
                        "relative p-4 rounded-lg border-2 transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 hover:bg-primary/10"
                          : "border-border hover:border-primary/30 hover:bg-secondary/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (!isEnglish) {
                              toggleLanguageSelection(language);
                            }
                          }}
                          className="mt-1"
                          disabled={isEnglish}
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
                            {isSelected && (
                              <>
                                {isDefaultLang ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetDefaultLanguage(language);
                                    }}
                                    className="shrink-0 p-0.5 rounded hover:bg-primary/20 transition-colors"
                                    title="Default language (click to change)"
                                  >
                                    <Star className="h-4 w-4 text-primary fill-primary" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetDefaultLanguage(language);
                                    }}
                                    className="shrink-0 p-0.5 rounded hover:bg-primary/20 transition-colors opacity-50 hover:opacity-100"
                                    title="Set as default language"
                                  >
                                    <Star className="h-4 w-4 text-muted-foreground" />
                                  </button>
                                )}
                                <Check className="h-4 w-4 text-primary shrink-0" />
                              </>
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

