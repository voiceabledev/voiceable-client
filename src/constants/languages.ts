// Language code to display name mapping
export const languageLabels: Record<string, string> = {
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

// Language code to flag country code mapping (for ElevenLabs flag images)
export const languageFlagMap: Record<string, string> = {
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

// Map from old language names to language codes (for backward compatibility)
export const languageNameToCode: Record<string, string> = {
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
export const availableLanguages = [
  'ar', 'bg', 'zh', 'hr', 'cs', 'da', 'nl', 'en', 'fil', 'fi', 'fr', 'de',
  'el', 'hi', 'hu', 'id', 'it', 'ja', 'ko', 'ms', 'no', 'pl', 'pt-br', 'pt',
  'ro', 'ru', 'sk', 'es', 'sv', 'ta', 'tr', 'uk', 'vi'
];

// Helper to get flag URL
export const getFlagUrl = (langCode: string): string => {
  const countryCode = languageFlagMap[langCode] || 'us';
  return `https://storage.googleapis.com/eleven-public-cdn/images/flags/circle-flags/${countryCode}.svg`;
};

// Helper to normalize language (convert old names to codes)
export const normalizeLanguage = (lang: string): string => {
  // If it's already a code, return as-is
  if (languageLabels[lang]) {
    return lang;
  }
  // Convert old language names to codes
  return languageNameToCode[lang.toLowerCase()] || lang;
};
