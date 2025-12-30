import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AudioLines, Loader2, Star } from "lucide-react";
import { VoiceSelectorDialog } from "@/components/assistants/VoiceSelectorDialog";
import { LanguageSelectorDialog } from "@/components/assistants/LanguageSelectorDialog";
import { Voice } from "@/lib/api";
import { languageLabels, getFlagUrl, normalizeLanguage } from "@/constants/languages";

interface VoiceLanguageStepProps {
  selectedVoiceIds: string[];
  primaryVoiceId?: string;
  voices: Voice[];
  loadingVoices: boolean;
  showVoiceSelector: boolean;
  onShowVoiceSelectorChange: (show: boolean) => void;
  onSelectVoices: (voiceIds: string[]) => void;
  onSetPrimaryVoice?: (voiceId: string) => void;
  playingVoiceId: string | null;
  onPlayPreview: (voice: Voice) => void;
  voiceSearchQuery: string;
  onVoiceSearchChange: (query: string) => void;
  selectedLanguages: string[];
  defaultLanguage?: string;
  showLanguageSelector: boolean;
  onShowLanguageSelectorChange: (show: boolean) => void;
  onSelectLanguages: (languages: string[], defaultLanguage: string) => void;
  onSetDefaultLanguage?: (language: string) => void;
  languageSearchQuery: string;
  onLanguageSearchChange: (query: string) => void;
}

export function VoiceLanguageStep({
  selectedVoiceIds,
  primaryVoiceId,
  voices,
  loadingVoices,
  showVoiceSelector,
  onShowVoiceSelectorChange,
  onSelectVoices,
  onSetPrimaryVoice,
  playingVoiceId,
  onPlayPreview,
  voiceSearchQuery,
  onVoiceSearchChange,
  selectedLanguages,
  defaultLanguage,
  showLanguageSelector,
  onShowLanguageSelectorChange,
  onSelectLanguages,
  onSetDefaultLanguage,
  languageSearchQuery,
  onLanguageSearchChange,
}: VoiceLanguageStepProps) {
  const selectedVoices = voices.filter(v => selectedVoiceIds.includes(v.id));

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
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Voice{selectedVoiceIds.length !== 1 ? 's' : ''}</label>
        {loadingVoices ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-md border border-border">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading voices...</span>
          </div>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start bg-white"
              onClick={() => onShowVoiceSelectorChange(true)}
            >
              {selectedVoiceIds.length === 0 ? (
                <span className="text-muted-foreground">Select voices</span>
              ) : selectedVoiceIds.length === 1 && selectedVoices[0] ? (
                <span className="flex items-center gap-2">
                  <AudioLines className="h-4 w-4" />
                  {selectedVoices[0].name || selectedVoices[0].id}
                </span>
              ) : (
                <span>{selectedVoiceIds.length} voices selected</span>
              )}
            </Button>
            
            {/* Display selected voices as badges */}
            {selectedVoiceIds.length > 0 && (
              <div className="space-y-2 mt-2">
                <div className="flex flex-wrap gap-2">
                  {selectedVoiceIds.map((voiceId) => {
                    const voice = voices.find(v => v.id === voiceId);
                    const isPrimary = voiceId === primaryVoiceId;
                    
                    const handleSetPrimary = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (onSetPrimaryVoice && !isPrimary) {
                        onSetPrimaryVoice(voiceId);
                      }
                    };
                    
                    return (
                      <Badge
                        key={voiceId}
                        variant={isPrimary ? "default" : "secondary"}
                        className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={handleSetPrimary}
                        title={isPrimary ? "Primary voice (click to change)" : onSetPrimaryVoice ? "Click to set as primary" : undefined}
                      >
                        {isPrimary && <Star className="h-3 w-3 fill-current" />}
                        <AudioLines className="h-3 w-3" />
                        <span className="text-xs">
                          {voice?.name || voiceId}
                        </span>
                        {isPrimary && (
                          <span className="text-xs ml-1">(Primary)</span>
                        )}
                      </Badge>
                    );
                  })}
                </div>
                {selectedVoiceIds.length > 1 && !primaryVoiceId && onSetPrimaryVoice && (
                  <p className="text-xs text-muted-foreground">
                    Click a voice badge to set it as primary for ElevenLabs
                  </p>
                )}
              </div>
            )}
            
            <VoiceSelectorDialog
              open={showVoiceSelector}
              onOpenChange={onShowVoiceSelectorChange}
              voices={voices}
              selectedVoiceIds={selectedVoiceIds}
              onSelectVoices={onSelectVoices}
              playingVoiceId={playingVoiceId}
              onPlayPreview={onPlayPreview}
              searchQuery={voiceSearchQuery}
              onSearchChange={onVoiceSearchChange}
            />
          </>
        )}
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Language{selectedLanguages.length !== 1 ? 's' : ''}</label>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start bg-white"
          onClick={() => onShowLanguageSelectorChange(true)}
        >
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
            {selectedLanguages.length > 1 && !defaultLanguage && onSetDefaultLanguage && (
              <p className="text-xs text-muted-foreground">
                Click a language badge to set it as default for ElevenLabs
              </p>
            )}
          </div>
        )}
        
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
    </div>
  );
}
