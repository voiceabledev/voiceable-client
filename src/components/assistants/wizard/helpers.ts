import { SectionEntry, SectionPayload } from "@/types/assistant";
import { PROMPT_TEMPLATE, DEFAULT_SYSTEM_PROMPT } from "@/constants/assistant";

// Template to integration tools mapping
export const getTemplateIntegrationTools = (templateTitle: string): Record<string, { enabled: boolean; enabled_tools: string[] }> => {
  console.log('[getTemplateIntegrationTools] Looking up template:', templateTitle);
  const mapping: Record<string, Record<string, string[]>> = {
    "Appointment Scheduler": {
      calcom: ["get_event_types", "get_available_slots", "create_booking", "list_bookings", "get_booking", "reschedule_booking", "cancel_booking"],
      pipedrive: ["get_person", "create_person", "get_deal", "create_deal", "search_deals"],
    },
    "Scheduler": {
      calcom: ["get_event_types", "get_available_slots", "create_booking", "list_bookings", "get_booking", "reschedule_booking", "cancel_booking"],
      pipedrive: ["get_person", "create_person", "get_deal", "create_deal", "search_deals"],
    },
    "Receptionist": {
      calcom: ["get_event_types", "get_available_slots", "create_booking", "list_bookings", "get_booking", "reschedule_booking", "cancel_booking"],
      pipedrive: ["get_person", "create_person", "get_deal", "create_deal", "search_deals"],
    },
    "Recruiters": {
      hubspot: ["get_contact", "create_contact", "update_contact", "search_contacts", "get_company", "create_company", "search_companies"],
      salesforce: ["get_lead", "create_lead", "update_lead", "search_leads", "get_opportunity", "create_opportunity", "update_opportunity", "search_opportunities"],
      pipedrive: ["get_person", "create_person", "get_deal", "create_deal", "search_deals"],
    },
    "Leads Reviver": {
      hubspot: ["get_contact", "create_contact", "update_contact", "search_contacts", "get_deal", "update_deal", "search_deals"],
      salesforce: ["get_lead", "create_lead", "update_lead", "search_leads", "get_opportunity", "create_opportunity", "update_opportunity", "search_opportunities"],
      pipedrive: ["get_person", "create_person", "get_deal", "create_deal", "search_deals"],
    },
    "Care Coordinator": {
      calcom: ["get_event_types", "get_available_slots", "create_booking", "list_bookings", "get_booking", "reschedule_booking", "cancel_booking"],
      pipedrive: ["get_person", "create_person", "get_deal", "create_deal", "search_deals"],
    },
  };

  const tools = mapping[templateTitle];
  console.log('[getTemplateIntegrationTools] Found tools for', templateTitle, ':', tools);
  if (!tools) {
    console.log('[getTemplateIntegrationTools] No mapping found for template:', templateTitle, 'Available keys:', Object.keys(mapping));
    return {};
  }

  const result: Record<string, { enabled: boolean; enabled_tools: string[] }> = {};
  Object.entries(tools).forEach(([integrationType, toolActions]) => {
    result[integrationType] = {
      enabled: true,
      enabled_tools: toolActions,
    };
  });

  console.log('[getTemplateIntegrationTools] Returning result:', result, 'Keys:', Object.keys(result));
  return result;
};

// Helper to generate sample messages with dynamic welcome message
export const getSampleMessages = (welcomeMessage: string) => [
  { role: 'agent' as const, text: welcomeMessage || "Hi! How can I help you today?", timestamp: new Date(Date.now() - 120000) },
  { role: 'user' as const, text: "I have a question about your services.", timestamp: new Date(Date.now() - 90000) },
  { role: 'agent' as const, text: "Of course! I'd be happy to help. What would you like to know?", timestamp: new Date(Date.now() - 60000) },
];

// Generate system prompt from template and custom sections
export const generateSystemPrompt = (
  templatePrompt: string | undefined,
  scenarios: SectionEntry[],
  phases: SectionEntry[],
  voiceTone: SectionEntry[]
): string => {
  const formatSectionContent = (sectionTitle: string, sectionDescription: string, entries: SectionEntry[]): string => {
    if (entries.length === 0) return "";

    const formattedEntries = entries
      .map((entry) => {
        const title = entry.title.trim();
        const description = entry.description.trim();
        const notes = entry.notes?.trim();

        if (!title && !description) return null;

        let content = `- **${title || "Untitled"}**`;
        if (description) {
          content += `\n  ${description}`;
        }
        if (notes) {
          content += `\n  _Note: ${notes}_`;
        }
        return content;
      })
      .filter(Boolean)
      .join("\n\n");

    if (!formattedEntries) return "";

    return `## ${sectionTitle}\n\n${sectionDescription}\n\n${formattedEntries}`;
  };

  // Preserve the original template prompt exactly as provided
  const prompt = templatePrompt || "";
  
  // Check for custom sections
  const hasScenarios = scenarios.length > 0;
  const hasPhases = phases.length > 0;
  const hasVoiceTone = voiceTone.length > 0;
  const hasCustomSections = hasScenarios || hasPhases || hasVoiceTone;
  
  // If no template and no custom sections, use default
  if (!prompt && !hasCustomSections) {
    return DEFAULT_SYSTEM_PROMPT;
  }
  
  // If no template but we have custom sections, use the simple template structure
  if (!prompt && hasCustomSections) {
    const scenariosContent = formatSectionContent(
      "Scenarios",
      "These are the main scenarios you should be prepared to handle:",
      scenarios
    );

    const phasesContent = formatSectionContent(
      "Conversation Phases",
      "Follow these phases during the conversation:",
      phases
    );

    const voiceToneContent = formatSectionContent(
      "Voice & Tone",
      "Maintain the following tone and communication style:",
      voiceTone
    );

    const generatedPrompt = PROMPT_TEMPLATE
      .replace("{{SCENARIOS}}", scenariosContent)
      .replace("{{PHASES}}", phasesContent)
      .replace("{{VOICE_TONE}}", voiceToneContent)
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return generatedPrompt;
  }
  
  // We have a template prompt - preserve it exactly and only append custom sections
  if (!hasCustomSections) {
    // No custom sections, return template as-is
    return prompt;
  }
  
  // Remove any existing custom sections from template (if editing an existing agent)
  // This ensures we don't duplicate sections when rebuilding
  const customSectionMarkers = [
    /## Additional Scenarios[\s\S]*?(?=\n## |\n=== |$)/,
    /## Additional Conversation Phases[\s\S]*?(?=\n## |\n=== |$)/,
    /## Additional Voice & Tone[\s\S]*?(?=\n## |\n=== |$)/,
  ];
  
  let cleanedTemplate = prompt;
  customSectionMarkers.forEach(marker => {
    cleanedTemplate = cleanedTemplate.replace(marker, '').trim();
  });
  cleanedTemplate = cleanedTemplate.replace(/\n{3,}/g, "\n\n").trim();
  
  // Build new custom sections
  const customSections: string[] = [];
  
  if (hasScenarios) {
    const scenariosContent = formatSectionContent(
      "Additional Scenarios",
      "These are additional scenarios you should be prepared to handle:",
      scenarios
    );
    if (scenariosContent) {
      customSections.push(scenariosContent);
    }
  }
  
  if (hasPhases) {
    const phasesContent = formatSectionContent(
      "Additional Conversation Phases",
      "Follow these additional phases during the conversation:",
      phases
    );
    if (phasesContent) {
      customSections.push(phasesContent);
    }
  }
  
  if (hasVoiceTone) {
    const voiceToneContent = formatSectionContent(
      "Additional Voice & Tone",
      "Maintain these additional tone and communication style guidelines:",
      voiceTone
    );
    if (voiceToneContent) {
      customSections.push(voiceToneContent);
    }
  }
  
  // Append custom sections to cleaned template
  // This preserves the template structure while adding/updating custom sections
  if (customSections.length > 0) {
    const appendedSections = customSections.join("\n\n");
    return `${cleanedTemplate}\n\n${appendedSections}`.replace(/\n{3,}/g, "\n\n").trim();
  }
  
  // No custom sections, return cleaned template
  return cleanedTemplate || prompt;
};

// Helper functions for section entries
export const generateSectionEntryId = () => {
  return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createSectionEntry = (overrides: Partial<SectionEntry> = {}): SectionEntry => ({
  id: generateSectionEntryId(),
  title: "",
  description: "",
  notes: "",
  ...overrides,
});

// Helper to infer template name from agent name
export const inferTemplateFromName = (agentName: string | undefined): string | null => {
  if (!agentName) return null;
  
  const nameLower = agentName.toLowerCase();
  // Check for template name patterns in agent name
  const templatePatterns: Record<string, string> = {
    'care coordinator': 'Care Coordinator',
    'appointment scheduler': 'Appointment Scheduler',
    'scheduler': 'Scheduler',
    'receptionist': 'Receptionist',
    'recruiters': 'Recruiters',
    'recruiter': 'Recruiters',
    'leads reviver': 'Leads Reviver',
    'lead reviver': 'Leads Reviver',
  };
  
  for (const [pattern, templateName] of Object.entries(templatePatterns)) {
    if (nameLower.includes(pattern)) {
      return templateName;
    }
  }
  
  return null;
};

// Serialize section entries to payload format
export const serializeSectionEntries = (entries: SectionEntry[]): SectionPayload[] =>
  entries
    .map((entry) => {
      const serialized: SectionPayload = {
        title: entry.title.trim(),
        description: entry.description.trim(),
      };
      if (entry.notes?.trim()) {
        serialized.notes = entry.notes.trim();
      }
      return serialized.title || serialized.description || serialized.notes ? serialized : null;
    })
    .filter((value): value is SectionPayload => value !== null);
