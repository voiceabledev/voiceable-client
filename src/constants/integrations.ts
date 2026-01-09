export type IntegrationStatus = 'available' | 'upcoming';

export interface IntegrationProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  status: IntegrationStatus;
  order: number; // For sorting - lower numbers appear first
}

export const modelProviders: IntegrationProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "State-of-the-art GPT and o-series models.",
    icon: "🤖",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 1
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude series models focused on safe, helpful AI.",
    icon: "🧠",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 2
  },
  {
    id: "google",
    name: "Google",
    description: "Gemini series models for rich AI understanding.",
    icon: "💎",
    iconBg: "bg-blue-600",
    status: "upcoming",
    order: 3
  },
  {
    id: "azure-openai",
    name: "Azure OpenAI",
    description: "Azure-hosted OpenAI models with enterprise governance.",
    icon: "A",
    iconBg: "bg-blue-600",
    status: "upcoming",
    order: 5
  },
  {
    id: "inflection",
    name: "Inflection AI",
    description: "Inflection conversational models tuned for empathetic dialogue.",
    icon: "π",
    iconBg: "bg-green-600",
    status: "upcoming",
    order: 6
  },
  {
    id: "cerebras",
    name: "Cerebras",
    description: "High performance inference platform.",
    icon: "C",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 4
  },
  {
    id: "xai",
    name: "xAI",
    description: "Grok series models with real-time knowledge access.",
    icon: "X",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 7
  },
  {
    id: "mistral",
    name: "Mistral",
    description: "Mistral family of efficient open-source models.",
    icon: "M",
    iconBg: "bg-orange-600",
    status: "upcoming",
    order: 8
  },
  {
    id: "together",
    name: "Together AI",
    description: "Hosted open-source LLMs served through Together AI.",
    icon: "🔷",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 9
  },
  {
    id: "anyscale",
    name: "Anyscale",
    description: "Anyscale platform for scalable open-source LLM hosting.",
    icon: "⬡",
    iconBg: "bg-blue-600",
    status: "upcoming",
    order: 10
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Unified API to many community LLMs via OpenRouter.",
    icon: "→",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 11
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    description: "Perplexity AI models tuned for accurate responses.",
    icon: "⭐",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 12
  }
];

export const transcriberProviders: IntegrationProvider[] = [
  {
    id: "deepgram-transcriber",
    name: "Deepgram",
    description: "Real-time speech recognition with low latency for production use.",
    icon: "D",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 1
  },
  {
    id: "assemblyai",
    name: "AssemblyAI",
    description: "Advanced speech recognition with speaker diarization and analysis.",
    icon: "A",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 3
  },
  {
    id: "azure-transcriber",
    name: "Azure Speech",
    description: "Azure Speech Services for high-quality transcription.",
    icon: "A",
    iconBg: "bg-red-600",
    status: "upcoming",
    order: 4
  },
  {
    id: "gladia",
    name: "Gladia",
    description: "Accurate speech-to-text API with multilingual support.",
    icon: "❄️",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 5
  },
  {
    id: "speechmatics",
    name: "Speechmatics",
    description: "Enterprise-grade speech recognition with custom vocabulary.",
    icon: "🎯",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 6
  }
];

export const voiceProviders: IntegrationProvider[] = [
  {
    id: "cartesia",
    name: "Cartesia",
    description: "Lightning-fast text-to-speech with ultra-low latency.",
    icon: "▣",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 2
  },
  {
    id: "azure",
    name: "Azure Speech",
    description: "Enterprise text-to-speech and speech-to-text by Microsoft.",
    icon: "A",
    iconBg: "bg-red-600",
    status: "upcoming",
    order: 3
  },
  {
    id: "inworld",
    name: "Inworld",
    description: "AI voices designed for interactive character experiences.",
    icon: "⬡",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 4
  },
  {
    id: "rimeai",
    name: "RimeAI",
    description: "Realistic text-to-speech with emotional voice control.",
    icon: "⚏",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 5
  },
  {
    id: "smallestai",
    name: "SmallestAI",
    description: "Ultra-fast, low-latency voice synthesis for real-time applications.",
    icon: "⬢",
    iconBg: "bg-green-600",
    status: "upcoming",
    order: 6
  },
  {
    id: "neuphonic",
    name: "Neuphonic",
    description: "Natural-sounding text-to-speech with emotional AI.",
    icon: "ω",
    iconBg: "bg-orange-500",
    status: "upcoming",
    order: 7
  },
  {
    id: "hume",
    name: "Hume",
    description: "Emotionally intelligent AI voices with expressive speech.",
    icon: "⬢",
    iconBg: "bg-purple-600",
    status: "upcoming",
    order: 8
  },
  {
    id: "lmnt",
    name: "LMNT",
    description: "Real-time AI voice synthesis optimized for conversational AI.",
    icon: "◐",
    iconBg: "bg-yellow-500",
    status: "upcoming",
    order: 9
  },
  {
    id: "minimax",
    name: "Minimax",
    description: "Advanced text-to-speech with multilingual voice support.",
    icon: "⟁",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 10
  }
];

export const crmProviders: IntegrationProvider[] = [
  {
    id: "hubspot",
    name: "HubSpot CRM",
    description: "Sync contact, deal, and ticket data powered by HubSpot.",
    icon: "HS",
    iconBg: "bg-blue-600",
    status: "upcoming",
    order: 1
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Push and pull records directly from Salesforce Sales Cloud.",
    icon: "SF",
    iconBg: "bg-sky-500",
    status: "upcoming",
    order: 2
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    description: "Keep leads and pipelines in sync with Pipedrive CRM.",
    icon: "PD",
    iconBg: "bg-emerald-600",
    status: "upcoming",
    order: 3
  },
  {
    id: "kommo",
    name: "Kommo",
    description: "Messenger-based sales CRM with WhatsApp, Instagram, and more channels.",
    icon: "K",
    iconBg: "bg-purple-600",
    status: "upcoming",
    order: 4
  },
  {
    id: "gohighlevel",
    name: "GoHighLevel",
    description: "CRM and sales automation platform for small businesses.",
    icon: "GH",
    iconBg: "bg-green-600",
    status: "upcoming",
    order: 5
  }
];

export const schedulingProviders: IntegrationProvider[] = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Overlay availability and events from Google Calendar.",
    icon: "📅",
    iconBg: "bg-blue-500",
    status: "upcoming",
    order: 1
  },
  {
    id: "outlook_calendar",
    name: "Outlook Calendar",
    description: "Integrate Microsoft Outlook calendars for scheduling.",
    icon: "🗓️",
    iconBg: "bg-sky-700",
    status: "upcoming",
    order: 2
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Bring Calendly booking links into your assistant workflows.",
    icon: "C",
    iconBg: "bg-orange-500",
    status: "upcoming",
    order: 3
  },
  {
    id: "calcom",
    name: "Cal.com",
    description: "Use Cal.com event links to manage availability across calendars.",
    icon: "Cal",
    iconBg: "bg-purple-600",
    status: "available",
    order: 4
  }
];

export const telephonyProviders: IntegrationProvider[] = [
  {
    id: "twilio",
    name: "Twilio",
    description: "Programmable Voice and SMS for voice calls and messaging.",
    icon: "T",
    iconBg: "bg-red-600",
    status: "upcoming",
    order: 1
  },
  {
    id: "genesys",
    name: "Genesys",
    description: "Cloud-based contact center platform.",
    icon: "G",
    iconBg: "bg-blue-600",
    status: "upcoming",
    order: 2
  },
  {
    id: "amazon-connect",
    name: "Amazon Connect",
    description: "Cloud-based contact center service.",
    icon: "A",
    iconBg: "bg-orange-600",
    status: "upcoming",
    order: 3
  }
];

export const customerSupportProviders: IntegrationProvider[] = [
  {
    id: "zendesk",
    name: "Zendesk",
    description: "Customer support platform for managing tickets and customer interactions.",
    icon: "Z",
    iconBg: "bg-green-600",
    status: "upcoming",
    order: 1
  }
];

export const cloudStorageProviders: IntegrationProvider[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Connect your Google account and sync files from your Google Drive. Save files to your Drive.",
    icon: "G",
    iconBg: "bg-blue-500",
    status: "upcoming",
    order: 1
  },
  {
    id: "onedrive",
    name: "OneDrive",
    description: "Connect to your OneDrive account to access, create, and update files. Increase your team's productivity.",
    icon: "O",
    iconBg: "bg-sky-600",
    status: "upcoming",
    order: 2
  }
];

export const communicationProviders: IntegrationProvider[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Connect your Slack workspace to receive notifications and alerts. Stay connected to important activity.",
    icon: "S",
    iconBg: "bg-purple-600",
    status: "upcoming",
    order: 1
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Connect WhatsApp Business API to send and receive messages. Engage with customers on their preferred platform.",
    icon: "W",
    iconBg: "bg-green-600",
    status: "upcoming",
    order: 2
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Integrate Telegram Bot API to send messages and notifications. Reach users through Telegram channels and chats.",
    icon: "T",
    iconBg: "bg-blue-500",
    status: "upcoming",
    order: 3
  }
];

export const ecommerceProviders: IntegrationProvider[] = [
  {
    id: "shopify",
    name: "Shopify",
    description: "Easiest for Ecommerce. Connect your Shopify store and sync customers, orders, or products. Grow your business faster.",
    icon: "🛍️",
    iconBg: "bg-green-600",
    status: "upcoming",
    order: 1
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Connect your WooCommerce store and sync customers, orders, or products. Grow your business faster.",
    icon: "W",
    iconBg: "bg-green-600",
    status: "upcoming",
    order: 2
  }
];

export const atsProviders: IntegrationProvider[] = [
  {
    id: "ashby",
    name: "Ashby",
    description: "Modern ATS platform for recruiting and candidate management.",
    icon: "A",
    iconBg: "bg-blue-600",
    status: "upcoming",
    order: 1
  },
  {
    id: "workday",
    name: "Workday",
    description: "Enterprise HR and talent management platform.",
    icon: "W",
    iconBg: "bg-orange-500",
    status: "upcoming",
    order: 2
  },
  {
    id: "level",
    name: "Level",
    description: "ATS and recruiting platform for modern hiring teams.",
    icon: "L",
    iconBg: "bg-purple-600",
    status: "upcoming",
    order: 3
  },
  {
    id: "bamboohr",
    name: "BambooHR",
    description: "HR software for small and medium businesses.",
    icon: "B",
    iconBg: "bg-green-600",
    status: "upcoming",
    order: 4
  }
];

export const paymentProcessingProviders: IntegrationProvider[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing platform for online businesses with global payment methods.",
    icon: "S",
    iconBg: "bg-indigo-600",
    status: "upcoming",
    order: 1
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Accept PayPal payments and manage transactions for your business.",
    icon: "P",
    iconBg: "bg-blue-600",
    status: "upcoming",
    order: 2
  },
  {
    id: "adyen",
    name: "Adyen",
    description: "Global payment platform supporting 250+ payment methods worldwide.",
    icon: "A",
    iconBg: "bg-orange-600",
    status: "upcoming",
    order: 4
  },
  {
    id: "braintree",
    name: "Braintree",
    description: "PayPal-owned payment gateway with support for multiple payment methods.",
    icon: "B",
    iconBg: "bg-blue-500",
    status: "upcoming",
    order: 5
  },
  {
    id: "razorpay",
    name: "Razorpay",
    description: "Payment gateway for India with support for local payment methods.",
    icon: "R",
    iconBg: "bg-blue-700",
    status: "upcoming",
    order: 6
  }
];

export const restaurantReservationProviders: IntegrationProvider[] = [
  {
    id: "opentable",
    name: "OpenTable",
    description: "Restaurant reservations platform. Manage bookings, check availability, and handle customer reservations seamlessly.",
    icon: "🍽️",
    iconBg: "bg-orange-600",
    status: "upcoming",
    order: 1
  }
];

export const posProviders: IntegrationProvider[] = [
  {
    id: "square",
    name: "Square",
    description: "Easiest for POS/Brick-and-Mortar. Point-of-sale solutions for restaurants and retail businesses.",
    icon: "S",
    iconBg: "bg-emerald-600",
    status: "upcoming",
    order: 1
  },
  {
    id: "clover",
    name: "Clover",
    description: "POS for Restaurants & Retail. Complete point-of-sale system with payment processing, inventory, and customer management.",
    icon: "C",
    iconBg: "bg-blue-600",
    status: "upcoming",
    order: 2
  }
];

export const databaseProviders: IntegrationProvider[] = [
  {
    id: "airtable",
    name: "Airtable",
    description: "Connect to Airtable bases to read and write records. Sync data between your voice assistant and Airtable databases.",
    icon: "A",
    iconBg: "bg-orange-500",
    status: "upcoming",
    order: 1
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Read and write data to Google Sheets. Sync customer information, orders, and other data with your spreadsheets.",
    icon: "📊",
    iconBg: "bg-green-600",
    status: "upcoming",
    order: 2
  }
];

/**
 * Get all integration providers from all categories
 */
export const getAllIntegrationProviders = (): IntegrationProvider[] => {
  return [
    ...modelProviders,
    ...transcriberProviders,
    ...voiceProviders,
    ...crmProviders,
    ...schedulingProviders,
    ...telephonyProviders,
    ...customerSupportProviders,
    ...cloudStorageProviders,
    ...communicationProviders,
    ...ecommerceProviders,
    ...atsProviders,
    ...paymentProcessingProviders,
    ...restaurantReservationProviders,
    ...posProviders,
    ...databaseProviders,
  ];
};

/**
 * Get all available integration providers (status === 'available')
 */
export const getAvailableIntegrationProviders = (): IntegrationProvider[] => {
  return getAllIntegrationProviders().filter(provider => provider.status === 'available');
};

/**
 * Get integration provider by ID
 */
export const getIntegrationProviderById = (id: string): IntegrationProvider | undefined => {
  return getAllIntegrationProviders().find(provider => provider.id === id);
};

/**
 * Convert IntegrationProvider to AvailableIntegrationType format
 * (used by IntegrationConnectionModal)
 */
export const toAvailableIntegrationType = (provider: IntegrationProvider) => {
  return {
    id: provider.id,
    name: provider.name,
    description: provider.description,
    icon: provider.icon,
    iconBg: provider.iconBg,
    status: provider.status,
  };
};

/**
 * Get all integration types in AvailableIntegrationType format
 * (for use in IntegrationConnectionModal)
 * Sorted with available integrations first, then upcoming ones
 */
export const getAvailableIntegrationTypes = () => {
  const allProviders = getAllIntegrationProviders();
  
  // Sort: available first (by order), then upcoming (by order)
  const sorted = allProviders.sort((a, b) => {
    if (a.status === 'available' && b.status === 'upcoming') return -1;
    if (a.status === 'upcoming' && b.status === 'available') return 1;
    return a.order - b.order;
  });
  
  return sorted.map(toAvailableIntegrationType);
};
