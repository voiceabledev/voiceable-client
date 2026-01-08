// Constants for Assistant Detail page
import { Settings, FileText, Wrench, Layout, MessageSquare, Phone, Target, BarChart3, TrendingUp } from "lucide-react";

export const VALID_TABS = ["dashboard", "calls", "performance", "settings", "call-script", "tools", "widget", "phone-number", "advanced", "overview", "configuration", "prompt-logic", "conversations", "outcomes"] as const;

export const tabs = [
  // { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "calls", label: "Calls", icon: MessageSquare },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "call-script", label: "Call Script", icon: FileText },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "widget", label: "Widget", icon: Layout },
  { id: "phone-number", label: "Phone Number", icon: Phone },
  // { id: "advanced", label: "Advanced", icon: Settings },
];

export const providers = [
  { value: "elevenlabs", label: "ElevenLabs", icon: "🎙️" },
  { value: "google", label: "Google", icon: "🔷" },
  { value: "openai", label: "OpenAI", icon: "🤖" },
  { value: "anthropic", label: "Anthropic", icon: "🧠" },
  { value: "custom", label: "Custom", icon: "⚙️" },
  { value: "meta", label: "Meta", icon: "🦙" },
  { value: "mistral", label: "Mistral", icon: "🌊" },
  { value: "cohere", label: "Cohere", icon: "⚡" },
  { value: "groq", label: "Groq", icon: "🚀" },
  { value: "perplexity", label: "Perplexity", icon: "🔍" },
];

export const modelsByProvider: Record<string, { value: string; label: string }[]> = {
  elevenlabs: [
    { value: "glm-45-air-fp8", label: "GLM-4.5-Air" },
    { value: "qwen3-30b-a3b", label: "Qwen3-30B-A3B" },
    { value: "qwen3-4b", label: "Qwen3-4B" },
    { value: "gpt-oss-120b", label: "GPT-OSS-120B" },
    { value: "gpt-oss-20b", label: "GPT-OSS-20B" },
    { value: "custom-llm", label: "Custom LLM" },
  ],
  google: [
    { value: "gemini-3-pro-preview", label: "Gemini 3 Pro Preview" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  ],
  openai: [
    { value: "gpt-5", label: "GPT-5" },
    { value: "gpt-5.1", label: "GPT-5.1" },
    { value: "gpt-5-mini", label: "GPT-5 Mini" },
    { value: "gpt-5-nano", label: "GPT-5 Nano" },
    { value: "gpt-4.1", label: "GPT-4.1" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
    { value: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    { value: "gpt-4o-cluster", label: "GPT 4o Cluster" },
    { value: "gpt-4", label: "GPT-4" },
  ],
  anthropic: [
    { value: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
    { value: "claude-sonnet-4", label: "Claude Sonnet 4" },
    { value: "claude-haiku-4-5", label: "Claude Haiku 4.5" },
    { value: "claude-3-7-sonnet", label: "Claude 3.7 Sonnet" },
    { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku" },
  ],
  meta: [
    { value: "llama-3-70b", label: "Llama 3 70B" },
    { value: "llama-3-8b", label: "Llama 3 8B" },
    { value: "llama-2-70b", label: "Llama 2 70B" },
  ],
  mistral: [
    { value: "mistral-large", label: "Mistral Large" },
    { value: "mistral-medium", label: "Mistral Medium" },
    { value: "mistral-small", label: "Mistral Small" },
  ],
  cohere: [
    { value: "command-r-plus", label: "Command R+" },
    { value: "command-r", label: "Command R" },
    { value: "command", label: "Command" },
  ],
  groq: [
    { value: "llama-3-70b-8192", label: "Llama 3 70B" },
    { value: "llama-3-8b-8192", label: "Llama 3 8B" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
  ],
  perplexity: [
    { value: "llama-3-sonar-large-32k-online", label: "Sonar Large 32k Online" },
    { value: "llama-3-sonar-small-32k-online", label: "Sonar Small 32k Online" },
  ],
  custom: [
    { value: "custom-llm", label: "Custom LLM" },
  ],
};

export const WIDGET_API_KEY_NAME = "Widget API Key";

// Fixed prompt template with variable placeholders
export const PROMPT_TEMPLATE = `# Voice Assistant

You are a helpful voice assistant. Follow the behavior guidelines and instructions below to assist users effectively.

{{SCENARIOS}}

{{PHASES}}

{{VOICE_TONE}}

## Guidelines

- Be concise and direct in your responses
- Listen actively and confirm understanding when needed
- Stay within the defined scenarios and escalate when necessary
- Maintain the specified tone throughout the conversation
`;

// Fallback when no sections are defined
export const DEFAULT_SYSTEM_PROMPT = `# Voice Assistant

You are a helpful voice assistant. Your role is to assist users with their requests in a clear, friendly, and professional manner.

## Guidelines

- Be concise and direct in your responses
- Maintain a helpful and professional tone
- Ask clarifying questions when needed
- Provide accurate information based on available context
`;

// Integration prompts (matching backend IntegrationPrompts)
export const INTEGRATION_PROMPTS: Record<string, string> = {
  calcom: `You can check availability and create/reschedule/cancel bookings via Cal.com tools.

Tools you can use:
• get_available_slots(eventTypeId, startTimeUTC, endTimeUTC, timeZoneIANA) → returns available slot start times in UTC
• create_booking(eventTypeId, startUTC, timeZoneIANA, attendeeName, attendeeEmail, language, metadata) → returns bookingUid, start/end, meetingUrl, status
• list_bookings(startTimeUTC, endTimeUTC, attendeeEmail) → returns bookings with bookingUid, start/end, status, meetingUrl
• reschedule_booking(bookingUid, newStartUTC, timeZoneIANA, reason) → returns updated booking details
• cancel_booking(bookingUid, reason) → returns cancellation confirmation

Required rules:
• Always use IANA time zones (e.g., America/Vancouver, America/Sao_Paulo). Never use "PST", "EST".
• Never invent times. Only schedule/reschedule using a slot returned by get_available_slots.
• startTimeUTC/endTimeUTC must be ISO 8601 UTC timestamps ending with Z.
• Always confirm with the user before:
  1. creating a booking
  2. rescheduling a booking
  3. canceling a booking

Conversation flow:
1. Identify intent: schedule / reschedule / cancel.
2. Collect required info:
   • attendee name
   • attendee email
   • timezone (IANA)
   • meeting type (eventTypeId or "15min", "30min", etc.)
   • preferred date range + time-of-day preferences
3. Availability:
   • Call get_available_slots for the next 3–7 days (or user range).
   • Present at most 3 options at a time in the user's timezone.
4. Booking:
   • Ask the user to pick one option.
   • Confirm: "Book [time] at [date] for [attendee], correct?"
   • If confirmed, call create_booking.
   • Read back confirmation and meeting link.
5. Reschedule:
   • Find the booking with list_bookings (by email + window) or ask for bookingUid.
   • Show the booking you found and confirm which one to change.
   • Get new slots, confirm choice, then call reschedule_booking.
6. Cancel:
   • Find the booking, confirm which one, confirm cancellation, then call cancel_booking.

Output formatting:
• When proposing times, speak them clearly: "Tuesday, Dec 30 at 10:00 AM Vancouver time"
• After booking/reschedule/cancel, summarize: status, start/end time, and meetingUrl (if present).

If anything fails:
• If a tool returns an error, explain what you need next (timezone, email, different date window), then retry.
• If no availability is found, expand the search window and propose the next available day.`,
  pipedrive: `You can manage contacts and deals in Pipedrive CRM.

Tools you can use:
• get_contact(person_id) → returns person details by ID
• create_contact(name, email, phone, org_id) → creates a new person/contact, returns person_id
• search_contacts(term) → searches for persons by email or name, returns matching contacts
• get_deal(deal_id) → returns deal details by ID
• create_deal(title, person_id, value, currency, org_id) → creates a new deal, returns deal_id
• search_deals(term) → searches for deals by person email or deal title, returns matching deals
• create_note(deal_id, content) → creates a note attached to a deal
• create_activity(deal_id, type, subject, note) → creates an activity for a deal

Required rules:
• Always use email as the primary identifier for persons
• Never create a deal without a valid person_id
• Always check for existing persons before creating new ones
• Always check for existing deals before creating new ones
• When both booking system (Cal.com) and CRM are integrated, coordinate between them

Integration scenarios:

Scenario 1: CRM only (no booking system integrated)
When only Pipedrive is integrated:
1. Person management:
   • When you learn a person's name and email during conversation:
     - Search for the person by email using search_contacts
     - If found: store person_id for future reference
     - If not found: create the person using create_contact with name and email
   • Always ensure the person exists in CRM before any deal operations
2. Deal management:
   • Before creating a deal:
     - Search for existing deals using search_deals with the person's email
     - Check if any open or won deals exist for that person
     - If an open deal exists: DO NOT create a new deal, reuse the existing one
     - If no open deal exists: create a new deal with person_id
   • Deal title should be descriptive: "[Call] <Person Name> - <Date/Context>"
   • Always include person_id when creating deals

Scenario 2: Booking system only (no CRM integrated)
When only booking system (Cal.com) is integrated:
• Handle scheduling only (see Cal.com integration prompt)
• Do not perform any CRM operations

Scenario 3: Both CRM and booking system integrated
When both Pipedrive and booking system (Cal.com) are integrated:
1. Primary goal: Book a meeting with the customer
2. Secondary goal: Keep CRM updated throughout the conversation
3. Workflow:
   a. Person resolution (MANDATORY FIRST STEP):
      - When you learn the person's name and email:
        • Search for person by email using search_contacts
        • If found: store person_id
        • If not found: create person using create_contact with name and email, store person_id
      - ⚠️ Never create a deal without a valid person_id
   b. During conversation (before booking):
      - Ensure person exists in CRM (create if needed)
      - Search for existing deals using search_deals with person's email
      - If an open deal exists: store deal_id for later use
      - If no open deal exists: create a deal with:
        • person_id (required)
        • Title format: "[Cal.com] <Event Type> – <Person Name>"
        • Store deal_id
   c. When user calls (during/after booking):
      - If an open deal exists: add a note using create_note with:
        • deal_id (the existing open deal)
        • Content: "Call/Meeting on [date/time] - [summary of conversation]"
      - DO NOT create a new deal if an open deal already exists
      - Only create a new deal if no open deal exists for that person
   d. After booking is confirmed:
      - Add a note to the deal (existing or newly created) with booking details:
        • Meeting date/time
        • Meeting link (if available)
        • Event type
   e. If booking is rescheduled:
      - Reuse the existing deal (do not create a new one)
      - Update the deal note with new meeting time
   f. If booking is cancelled:
      - Do NOT delete deals
      - Add a note about cancellation
      - Leave deal open unless explicitly instructed otherwise

Conversation flow (CRM only scenario):
1. Identify if person needs to be added to CRM
2. Collect person info:
   • Full name
   • Email (primary identifier)
   • Phone (optional)
3. Person resolution:
   • Search for person by email
   • Create if not found
   • Store person_id
4. Deal management:
   • Search for existing deals by person email
   • Check for open/won deals
   • Create deal only if no open deal exists
   • Include person_id in deal creation

Conversation flow (CRM + booking scenario):
1. Primary: Handle booking (follow Cal.com flow)
2. In parallel: Ensure CRM is updated:
   • Resolve person (search/create)
   • Check for existing deals
   • Create deal if needed (before or during conversation)
   • Add notes when user calls or booking is confirmed
3. After booking:
   • Add note to deal with booking details
   • Do not create duplicate deals

Output formatting:
• When adding a person: "I've added [name] to your CRM"
• When creating a deal: "I've created a deal for [name]"
• When reusing existing deal: "I've updated the existing deal for [name]"
• When adding a note: "I've added a note to the deal about our conversation"

Error handling:
• If Pipedrive returns an error:
  - Explain what went wrong
  - If booking system is also integrated: continue with booking, don't block on CRM errors
  - If CRM only: ask for missing information (email, name) and retry
• If person search fails: try creating the person directly
• If deal search fails: you may create a new deal, but always include person_id`,
};

export const getIntegrationPromptMarker = (integrationType: string): string => {
  return `=== INTEGRATION_INSTRUCTIONS_${integrationType.toUpperCase()} ===`;
};

// Integration tools mapping for display
export const INTEGRATION_TOOLS_DISPLAY: Record<string, string[]> = {
  pipedrive: [
    // "Get Deal",
    "Create Deal",
    // "Update Deal",
    "Search Deals",
    "Get Person",
    "Create Person",
    // "Update Person",
    // "Search Persons",
    // "Get Organization",
    // "Create Organization",
    // "Update Organization",
    // "Search Organizations",
    // "Create Note",
    // "Create Activity"
  ],
  calendly: [
    // "Get Event Types",
    "Create Booking",
    "Cancel Event",
    "Reschedule Event",
    "Get Availability",
    "Get Scheduled Events",
  ],
  hubspot: [
    "Get Contact",
    "Create Contact",
    "Update Contact",
    "Search Contacts",
    "Get Company",
    "Create Company",
    "Search Companies",
    "Get Deal",
    "Update Deal",
    "Search Deals",
    "Create Note",
    "Search Notes",
    "Get Task"
  ],
  salesforce: [
    "Get Lead",
    "Create Lead",
    "Update Lead",
    "Search Leads",
    "Get Opportunity",
    "Create Opportunity",
    "Update Opportunity",
    "Search Opportunities",
    "Get Account",
    "Create Account",
    "Update Account",
    "Search Accounts",
    "Create Task",
    "Create Event"
  ],
  calcom: [
    "Get Event Types",
    "Get Available Slots",
    "Create Booking",
    "Get All Bookings",
    "Get Booking",
    "Reschedule Booking",
    "Cancel Booking"
  ],
  google_calendar: [
    "Get Events",
    "Create Event",
    "Update Event",
    "Delete Event"
  ],
  outlook_calendar: [
    "Get Events",
    "Create Event",
    "Update Event",
    "Delete Event"
  ],
  twilio: [
    "Send SMS Notification",
    "Get Form Submission"
  ]
};

// Integration metadata for display
export const INTEGRATION_METADATA: Record<string, { name: string; icon: string; iconBg: string; url?: string }> = {
  pipedrive: {
    name: "Pipedrive",
    icon: "PD",
    iconBg: "bg-emerald-600",
    url: "https://www.pipedrive.com",
  },
  calendly: {
    name: "Calendly",
    icon: "C",
    iconBg: "bg-orange-500",
    url: "https://calendly.com",
  },
  hubspot: {
    name: "HubSpot CRM",
    icon: "HS",
    iconBg: "bg-blue-600",
    url: "https://app.hubspot.com",
  },
  salesforce: {
    name: "Salesforce",
    icon: "SF",
    iconBg: "bg-sky-500",
    url: "https://www.salesforce.com",
  },
  calcom: {
    name: "Cal.com",
    icon: "Cal",
    iconBg: "bg-purple-600",
    url: "https://cal.com",
  },
  google_calendar: {
    name: "Google Calendar",
    icon: "📅",
    iconBg: "bg-blue-500",
  },
  outlook_calendar: {
    name: "Outlook Calendar",
    icon: "🗓️",
    iconBg: "bg-sky-700",
  },
  twilio: {
    name: "Twilio",
    icon: "📱",
    iconBg: "bg-red-600",
    url: "https://www.twilio.com",
  },
};

export const getAvailableIntegrationTypes = () => {
  // Define all available integrations with their metadata
  const integrations = [
    {
      id: "pipedrive",
      name: INTEGRATION_METADATA.pipedrive.name,
      description: getIntegrationDescription("pipedrive"),
      icon: INTEGRATION_METADATA.pipedrive.icon,
      iconBg: INTEGRATION_METADATA.pipedrive.iconBg,
      status: "available" as const,
    },
    {
      id: "calcom",
      name: "Cal.com",
      description: "Use Cal.com event links to manage availability across calendars",
      icon: "📅",
      iconBg: "bg-purple-600",
      status: "available" as const,
    },
    {
      id: "calendly",
      name: INTEGRATION_METADATA.calendly.name,
      description: getIntegrationDescription("calendly"),
      icon: INTEGRATION_METADATA.calendly.icon,
      iconBg: INTEGRATION_METADATA.calendly.iconBg,
      status: "upcoming" as const,
    },
    {
      id: "hubspot",
      name: INTEGRATION_METADATA.hubspot.name,
      description: getIntegrationDescription("hubspot"),
      icon: INTEGRATION_METADATA.hubspot.icon,
      iconBg: INTEGRATION_METADATA.hubspot.iconBg,
      status: "upcoming" as const,
    },
    {
      id: "salesforce",
      name: INTEGRATION_METADATA.salesforce.name,
      description: getIntegrationDescription("salesforce"),
      icon: INTEGRATION_METADATA.salesforce.icon,
      iconBg: INTEGRATION_METADATA.salesforce.iconBg,
      status: "upcoming" as const,
    },
    {
      id: "google_calendar",
      name: "Google Calendar",
      description: "Overlay availability and events from Google Calendar",
      icon: "📆",
      iconBg: "bg-blue-500",
      status: "available" as const,
    },
    {
      id: "outlook_calendar",
      name: "Outlook Calendar",
      description: "Integrate Microsoft Outlook calendars for scheduling",
      icon: "📧",
      iconBg: "bg-sky-700",
      status: "upcoming" as const,
    },
  ];

  return integrations;
};

export const getIntegrationIcon = (integrationType: string): string => {
  const icons: Record<string, string> = {
    pipedrive: "🔷",
    calendly: "📅",
    hubspot: "🟠",
    salesforce: "☁️",
    google_calendar: "📆",
    outlook_calendar: "📧",
    calcom: "📅",
  };
  return icons[integrationType] || "🔌";
};

export const formatToolName = (toolName: string): string => {
  return toolName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const displayNameToActionName = (displayName: string, integrationType: string): string => {
  const mapping: Record<string, Record<string, string>> = {
    pipedrive: {
      "Get Deal": "get_deal",
      "Create Deal": "create_deal",
      "Update Deal": "update_deal",
      "Search Deals": "search_deals",
      "Get Person": "get_contact",
      "Create Person": "create_contact",
      "Update Person": "update_contact",
      "Search Persons": "search_contacts",
      "Get Organization": "get_company",
      "Create Organization": "create_company",
      "Update Organization": "update_organization",
      "Search Organizations": "search_companies",
      "Create Note": "create_note",
      "Create Activity": "create_activity",
    },
    calendly: {
      "Get Event Types": "get_event_types",
      "Get Availability": "get_availability",
      "Create Booking": "create_booking",
      "Get Scheduled Events": "get_scheduled_events",
      "Cancel Event": "cancel_event",
      "Reschedule Event": "reschedule_event",
    },
    hubspot: {
      "Get Contact": "get_contact",
      "Create Contact": "create_contact",
      "Update Contact": "update_contact",
      "Search Contacts": "search_contacts",
      "Get Company": "get_company",
      "Create Company": "create_company",
      "Search Companies": "search_companies",
      "Get Deal": "get_deal",
      "Update Deal": "update_deal",
      "Search Deals": "search_deals",
      "Create Note": "create_note",
      "Search Notes": "search_notes",
      "Get Task": "get_task",
    },
    salesforce: {
      "Get Lead": "get_lead",
      "Create Lead": "create_lead",
      "Update Lead": "update_lead",
      "Search Leads": "search_leads",
      "Get Opportunity": "get_opportunity",
      "Create Opportunity": "create_opportunity",
      "Update Opportunity": "update_opportunity",
      "Search Opportunities": "search_opportunities",
      "Get Account": "get_account",
      "Create Account": "create_account",
      "Update Account": "update_account",
      "Search Accounts": "search_accounts",
      "Create Task": "create_task",
      "Create Event": "create_event",
    },
    calcom: {
      "Get Event Types": "get_event_types",
      "Get Available Slots": "get_available_slots",
      "Create Booking": "create_booking",
      "Get All Bookings": "list_bookings",
      "Get Booking": "get_booking",
      "Reschedule Booking": "reschedule_booking",
      "Cancel Booking": "cancel_booking",
    },
    google_calendar: {
      "Get Events": "get_events",
      "Create Event": "create_event",
      "Update Event": "update_event",
      "Delete Event": "delete_event",
    },
    outlook_calendar: {
      "Get Events": "get_events",
      "Create Event": "create_event",
      "Update Event": "update_event",
      "Delete Event": "delete_event",
    },
    twilio: {
      "Send SMS Notification": "send_sms_notification",
      "Get Form Submission": "get_form_submission",
    },
  };
  return mapping[integrationType]?.[displayName] || displayName.toLowerCase().replace(/\s+/g, "_");
};

export const actionNameToDisplayName = (actionName: string, integrationType: string): string => {
  const mapping: Record<string, Record<string, string>> = {
    pipedrive: {
      "get_deal": "Get Deal",
      "create_deal": "Create Deal",
      "update_deal": "Update Deal",
      "search_deals": "Search Deals",
      "get_contact": "Get Person",
      "create_contact": "Create Person",
      "update_contact": "Update Person",
      "search_contacts": "Search Persons",
      "get_company": "Get Organization",
      "create_company": "Create Organization",
      "update_organization": "Update Organization",
      "search_companies": "Search Organizations",
      "create_note": "Create Note",
      "create_activity": "Create Activity",
    },
    calendly: {
      "get_event_types": "Get Event Types",
      "get_availability": "Get Availability",
      "create_booking": "Create Booking",
      "get_scheduled_events": "Get Scheduled Events",
      "cancel_event": "Cancel Event",
      "reschedule_event": "Reschedule Event",
    },
    hubspot: {
      "get_contact": "Get Contact",
      "create_contact": "Create Contact",
      "update_contact": "Update Contact",
      "search_contacts": "Search Contacts",
      "get_company": "Get Company",
      "create_company": "Create Company",
      "search_companies": "Search Companies",
      "get_deal": "Get Deal",
      "update_deal": "Update Deal",
      "search_deals": "Search Deals",
      "create_note": "Create Note",
      "search_notes": "Search Notes",
      "get_task": "Get Task",
    },
    salesforce: {
      "get_lead": "Get Lead",
      "create_lead": "Create Lead",
      "update_lead": "Update Lead",
      "search_leads": "Search Leads",
      "get_opportunity": "Get Opportunity",
      "create_opportunity": "Create Opportunity",
      "update_opportunity": "Update Opportunity",
      "search_opportunities": "Search Opportunities",
      "get_account": "Get Account",
      "create_account": "Create Account",
      "update_account": "Update Account",
      "search_accounts": "Search Accounts",
      "create_task": "Create Task",
      "create_event": "Create Event",
    },
    calcom: {
      "get_event_types": "Get Event Types",
      "get_available_slots": "Get Available Slots",
      "create_booking": "Create Booking",
      "list_bookings": "Get All Bookings",
      "get_booking": "Get Booking",
      "reschedule_booking": "Reschedule Booking",
      "cancel_booking": "Cancel Booking",
    },
    google_calendar: {
      "get_events": "Get Events",
      "create_event": "Create Event",
      "update_event": "Update Event",
      "delete_event": "Delete Event",
    },
    outlook_calendar: {
      "get_events": "Get Events",
      "create_event": "Create Event",
      "update_event": "Update Event",
      "delete_event": "Delete Event",
    },
    twilio: {
      "send_sms_notification": "Send SMS Notification",
      "get_form_submission": "Get Form Submission",
    },
  };
  return mapping[integrationType]?.[actionName] || actionName.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

export const getIntegrationDescription = (integrationType: string): string => {
  const descriptions: Record<string, string> = {
    pipedrive: "CRM and pipeline management",
    calendly: "Scheduling and appointment automation",
    hubspot: "Customer platform and CRM",
    salesforce: "Enterprise CRM and customer success",
    calcom: "Scheduling and calendar management",
    twilio: "SMS notifications and form collection",
  };
  return descriptions[integrationType] || "Connect external tools to your assistant";
};

export const getIntegrationFullDescription = (integrationType: string): string => {
  const descriptions: Record<string, string> = {
    pipedrive:
      "Connect your Pipedrive CRM to allow the assistant to manage deals, contacts, and organizations directly from conversations.",
    calendly: "Enable scheduling capabilities by connecting your Calendly account. Assistant can book and manage meetings.",
    hubspot: "Full CRM integration with HubSpot to manage leads, contacts, and deals seamlessly.",
    salesforce: "Deep integration with Salesforce CRM for enterprise-grade customer relationship management.",
    calcom: "Connect your Cal.com account to enable scheduling capabilities. Assistant can check availability, book meetings, and manage appointments.",
  };
  return descriptions[integrationType] || "Connect this integration to expand your assistant's capabilities.";
};

import { getEmptyWebhookHeader, getEmptyWebhookQueryParam, getEmptyWebhookTool } from "@/utils/assistantHelpers";
import type { WebhookTool, WebhookHeader, WebhookQueryParam } from "@/types/assistant";

export const createWebhookToolForIntegrationAction = (displayName: string, integrationType: string): WebhookTool => {
  const actionName = displayNameToActionName(displayName, integrationType);
  const webhookUrl = `https://api.voiceable.dev/webhook/${actionName}`;

  const authHeader: WebhookHeader = {
    ...getEmptyWebhookHeader(),
    type: "secret",
    name: "X-API-Key",
    value: "mQHjGa98PGSD1Geqo0nb",
  };

  const idParam: WebhookQueryParam = {
    ...getEmptyWebhookQueryParam(),
    identifier: "id",
    description: "The ID parameter",
    required: true,
    valueType: "llm_prompt",
  };

  const descriptions: Record<string, string> = {
    "Get Deal": "Retrieve a deal from Pipedrive by ID",
    "Create Deal": "Create a new deal in Pipedrive",
    "Update Deal": "Update an existing deal in Pipedrive",
    "Search Deals": "Search for deals in Pipedrive",
    "Get Person": "Retrieve a person/contact from Pipedrive by ID",
    "Create Person": "Create a new person/contact in Pipedrive",
    "Update Person": "Update an existing person/contact in Pipedrive",
    "Search Persons": "Search for persons/contacts in Pipedrive",
    "Get Organization": "Retrieve an organization from Pipedrive by ID",
    "Create Organization": "Create a new organization in Pipedrive",
    "Update Organization": "Update an existing organization in Pipedrive",
    "Search Organizations": "Search for organizations in Pipedrive",
    "Create Note": "Create a note in Pipedrive",
    "Create Activity": "Create an activity in Pipedrive",
    "Get Event Types": "Get available event types from Calendly",
    "Get Availability": "Get availability for a Calendly event type",
    "Create Booking": "Create a new booking in Calendly",
    "Get Scheduled Events": "Get scheduled events from Calendly",
    "Cancel Event": "Cancel a scheduled event in Calendly",
    "Reschedule Event": "Reschedule a scheduled event in Calendly",
  };

  return {
    ...getEmptyWebhookTool(),
    id: crypto.randomUUID(),
    name: displayName,
    description: descriptions[displayName] || `${displayName} action for ${integrationType}`,
    method: "POST",
    url: webhookUrl,
    headers: [authHeader],
    queryParams: [idParam],
  };
};
