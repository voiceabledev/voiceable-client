import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Code,
  AudioLines,
  Mic,
  Eye,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { agentsApi, voicesApi, Voice, agentTemplatesApi, AgentTemplate, AgentBehaviour, adminApi } from "@/lib/api";
import { VoiceSelectorDialog } from "@/components/assistants/VoiceSelectorDialog";
import { SectionEntry, SectionPayload } from "@/types/assistant";
import { PROMPT_TEMPLATE, DEFAULT_SYSTEM_PROMPT } from "@/constants/assistant";
import type { BehaviourConfig } from "@/components/assistants/SectionEditors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const providers = [
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

const modelsByProvider: Record<string, { value: string; label: string }[]> = {
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

interface CreateAgentWizardProps {
  onComplete: (agentId: string) => void;
  voices?: Array<{ id: string; name?: string }>; // Optional, will fetch if not provided
  loadingVoices?: boolean;
  initialData?: {
    templateId?: string;
    assistantName?: string;
    systemPrompt?: string;
    firstMessage?: string;
    skipNameStep?: boolean;
  };
}

type StepType = {
  id: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const steps: StepType[] = [
  { id: 1, label: "Name", icon: User },
  { id: 2, label: "Model", icon: Code },
  { id: 3, label: "Agent Behaviour", icon: Sparkles },
  { id: 4, label: "Voice", icon: AudioLines },
  { id: 5, label: "Language", icon: Mic },
  { id: 6, label: "Preview", icon: Eye },
];

// Template-specific pre-population data
type TemplateDefaults = {
  provider: string;
  model: string;
  recommendedVoiceIds?: string[]; // Voice IDs that work well for this template
  scenarios: SectionEntry[];
  phases: SectionEntry[];
  voiceTone: SectionEntry[];
};

const templateDefaults: Record<string, TemplateDefaults> = {
  "Care Coordinator": {
    provider: "openai",
    model: "gpt-4o",
    recommendedVoiceIds: [], // Will be set based on available voices
    scenarios: [
      {
        id: "template_scenario_1",
        title: "Appointment Booking",
        description: "Schedule new appointments by gathering patient information, preferred dates and times, and reason for visit. Confirm all details before finalizing.",
        notes: "Always verify patient name, phone number, and appointment type. Check for insurance requirements if applicable.",
      },
      {
        id: "template_scenario_2",
        title: "Rescheduling Requests",
        description: "Help patients reschedule existing appointments. Check availability, update the appointment, and send confirmation.",
        notes: "If rescheduling is urgent (same day), offer to check for cancellations or escalate to office staff.",
      },
      {
        id: "template_scenario_3",
        title: "General Inquiries",
        description: "Answer questions about office hours, location, services offered, insurance accepted, and general practice information.",
        notes: "For medical questions beyond scheduling, politely transfer to a healthcare provider or provide after-hours contact information.",
      },
    ],
    phases: [
      {
        id: "template_phase_1",
        title: "Greeting & Introduction",
        description: "Answer the call warmly and professionally. Introduce yourself as the scheduling assistant and offer assistance.",
        notes: "Use a calm, reassuring tone. Example: 'Thank you for calling Wellness Partners. This is Riley, your scheduling assistant. How may I help you today?'",
      },
      {
        id: "template_phase_2",
        title: "Gathering Information",
        description: "Listen carefully to understand the caller's needs. Ask clarifying questions to gather all necessary details for scheduling.",
        notes: "Be patient and allow the caller to fully explain their needs before asking follow-up questions.",
      },
      {
        id: "template_phase_3",
        title: "Confirming Details",
        description: "Repeat back all appointment details to ensure accuracy. Confirm date, time, patient name, and reason for visit.",
        notes: "Double-check spelling of names and verify phone numbers. Ask if they need directions or have any questions.",
      },
      {
        id: "template_phase_4",
        title: "Professional Closing",
        description: "Thank the caller, confirm next steps, and offer additional assistance if needed. End the call on a positive note.",
        notes: "Remind them of any preparation needed (fasting, bringing insurance card, etc.) if relevant to their appointment type.",
      },
    ],
    voiceTone: [
      {
        id: "template_tone_1",
        title: "Professional & Compassionate",
        description: "Maintain a professional, warm, and patient-focused tone. Speak clearly and check for understanding. Show empathy for health concerns.",
        notes: "Avoid medical jargon. Use simple, clear language. Be reassuring when discussing health-related topics.",
      },
    ],
  },
  "Lead Qualification Specialist": {
    provider: "openai",
    model: "gpt-4o",
    recommendedVoiceIds: [],
    scenarios: [
      {
        id: "template_scenario_1",
        title: "Lead Qualification",
        description: "Engage with potential customers, understand their needs, and determine if they're a good fit for the product or service.",
        notes: "Ask open-ended questions to understand pain points. Qualify based on budget, timeline, and decision-making authority.",
      },
      {
        id: "template_scenario_2",
        title: "Objection Handling",
        description: "Address common concerns and objections professionally. Provide relevant information and overcome hesitations.",
        notes: "Listen carefully to objections. Don't be pushy. Provide value and let the lead make an informed decision.",
      },
      {
        id: "template_scenario_3",
        title: "Appointment Scheduling",
        description: "Schedule follow-up calls or meetings with qualified leads. Confirm details and send calendar invitations.",
        notes: "Confirm time zones and preferred communication method. Send reminders 24 hours before scheduled calls.",
      },
    ],
    phases: [
      {
        id: "template_phase_1",
        title: "Opening & Rapport Building",
        description: "Greet the lead warmly and establish rapport. Explain the purpose of the call and set expectations.",
        notes: "Be enthusiastic but not overly salesy. Focus on understanding their needs first.",
      },
      {
        id: "template_phase_2",
        title: "Discovery & Qualification",
        description: "Ask strategic questions to understand the lead's situation, challenges, and goals. Qualify their fit.",
        notes: "Use BANT framework (Budget, Authority, Need, Timeline) to qualify leads effectively.",
      },
      {
        id: "template_phase_3",
        title: "Value Presentation",
        description: "Present relevant solutions based on discovered needs. Highlight benefits that address their specific pain points.",
        notes: "Tailor the pitch to what you learned in discovery. Focus on outcomes, not features.",
      },
      {
        id: "template_phase_4",
        title: "Next Steps & Close",
        description: "Propose clear next steps. Schedule follow-ups, send materials, or transfer to sales team as appropriate.",
        notes: "Always confirm next steps and timeline. Set expectations for what happens next.",
      },
    ],
    voiceTone: [
      {
        id: "template_tone_1",
        title: "Confident & Engaging",
        description: "Speak with confidence and enthusiasm. Be engaging and conversational while maintaining professionalism.",
        notes: "Match the energy level of the lead. Be adaptable - more formal for enterprise, more casual for SMB.",
      },
    ],
  },
  "Feedback Gathered": {
    provider: "openai",
    model: "gpt-4o",
    recommendedVoiceIds: [],
    scenarios: [
      {
        id: "template_scenario_1",
        title: "Survey Completion",
        description: "Guide callers through structured surveys, asking questions clearly and recording responses accurately.",
        notes: "Keep questions concise. If a question is unclear, rephrase it. Thank them for each response.",
      },
      {
        id: "template_scenario_2",
        title: "Open-Ended Feedback",
        description: "Encourage detailed feedback by asking open-ended questions. Listen actively and probe for specifics.",
        notes: "Use phrases like 'Tell me more about that' or 'Can you give me an example?' to get richer feedback.",
      },
      {
        id: "template_scenario_3",
        title: "Follow-Up Questions",
        description: "Ask relevant follow-up questions based on initial responses to gather deeper insights.",
        notes: "Don't ask too many follow-ups. Focus on the most important areas for improvement.",
      },
    ],
    phases: [
      {
        id: "template_phase_1",
        title: "Introduction & Purpose",
        description: "Explain the purpose of the call and how long it will take. Set expectations and ask for participation.",
        notes: "Be transparent about time commitment. Example: 'This survey will take about 5 minutes of your time.'",
      },
      {
        id: "template_phase_2",
        title: "Question Delivery",
        description: "Ask questions clearly, one at a time. Wait for complete answers before moving to the next question.",
        notes: "If they give a brief answer, ask 'Is there anything else you'd like to add?' to get more detail.",
      },
      {
        id: "template_phase_3",
        title: "Active Listening",
        description: "Show you're listening by acknowledging responses. Use phrases like 'I understand' or 'That makes sense.'",
        notes: "Don't interrupt. Let them finish their thoughts completely before responding.",
      },
      {
        id: "template_phase_4",
        title: "Thank You & Closing",
        description: "Thank them sincerely for their time and feedback. Explain how their input will be used.",
        notes: "End on a positive note. Example: 'Your feedback helps us improve, and we really appreciate you taking the time.'",
      },
    ],
    voiceTone: [
      {
        id: "template_tone_1",
        title: "Friendly & Appreciative",
        description: "Be warm, friendly, and genuinely appreciative of their time. Show enthusiasm for their feedback.",
        notes: "Use a conversational, non-intimidating tone. Make them feel their opinion truly matters.",
      },
    ],
  },
};


export default function CreateAgentWizard({ onComplete, voices: propVoices, loadingVoices: propLoadingVoices, initialData }: CreateAgentWizardProps) {
  const { toast } = useToast();
  // Skip name step if name is already provided
  const shouldSkipNameStep = initialData?.skipNameStep && initialData?.assistantName;
  const [currentStep, setCurrentStep] = useState(shouldSkipNameStep ? 1 : 0);
  const [saving, setSaving] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);

  // Step 1: Name
  const [name, setName] = useState(initialData?.assistantName || "");

  // Step 2: Model
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-cluster");
  const [firstMessage, setFirstMessage] = useState(initialData?.firstMessage || "");

  // Step 3: Agent Behaviour (Scenarios, Phases, Voice & Tone)
  const [scenarios, setScenarios] = useState<SectionEntry[]>([]);
  const [phases, setPhases] = useState<SectionEntry[]>([]);
  const [voiceTone, setVoiceTone] = useState<SectionEntry[]>([]);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSectionType, setEditingSectionType] = useState<"scenarios" | "phases" | "voiceTone" | null>(null);
  const [editingSectionEntry, setEditingSectionEntry] = useState<SectionEntry | null>(null);
  const [sectionForm, setSectionForm] = useState<Omit<SectionEntry, "id">>({
    title: "",
    description: "",
    notes: "",
  });
  const [behaviourConfig, setBehaviourConfig] = useState<BehaviourConfig | undefined>(undefined);
  const [template, setTemplate] = useState<AgentTemplate | null>(null);
  const [currentBehaviourId, setCurrentBehaviourId] = useState<number | undefined>(undefined);
  const [currentBehaviourName, setCurrentBehaviourName] = useState<string | undefined>(undefined);
  const [availableBehaviours, setAvailableBehaviours] = useState<AgentBehaviour[]>([]);
  const [loadingBehaviours, setLoadingBehaviours] = useState(false);

  // Generate system prompt from template and custom sections
  // This ensures the template is preserved and only custom sections are added/removed
  const generateSystemPrompt = (): string => {
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
    const templatePrompt = initialData?.systemPrompt || "";
    
    // Check for custom sections
    const hasScenarios = scenarios.length > 0;
    const hasPhases = phases.length > 0;
    const hasVoiceTone = voiceTone.length > 0;
    const hasCustomSections = hasScenarios || hasPhases || hasVoiceTone;
    
    // If no template and no custom sections, use default
    if (!templatePrompt && !hasCustomSections) {
      return DEFAULT_SYSTEM_PROMPT;
    }
    
    // If no template but we have custom sections, use the simple template structure
    if (!templatePrompt && hasCustomSections) {
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

      const prompt = PROMPT_TEMPLATE
        .replace("{{SCENARIOS}}", scenariosContent)
        .replace("{{PHASES}}", phasesContent)
        .replace("{{VOICE_TONE}}", voiceToneContent)
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      return prompt;
    }
    
    // We have a template prompt - preserve it exactly and only append custom sections
    if (!hasCustomSections) {
      // No custom sections, return template as-is
      return templatePrompt;
    }
    
    // Remove any existing custom sections from template (if editing an existing agent)
    // This ensures we don't duplicate sections when rebuilding
    const customSectionMarkers = [
      /## Additional Scenarios[\s\S]*?(?=\n## |\n=== |$)/,
      /## Additional Conversation Phases[\s\S]*?(?=\n## |\n=== |$)/,
      /## Additional Voice & Tone[\s\S]*?(?=\n## |\n=== |$)/,
    ];
    
    let cleanedTemplate = templatePrompt;
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
    return cleanedTemplate || templatePrompt;
  };

  const systemPrompt = generateSystemPrompt();

  // Helper functions for section entries
  const generateSectionEntryId = () => {
    return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const createSectionEntry = (overrides: Partial<SectionEntry> = {}): SectionEntry => ({
    id: generateSectionEntryId(),
    title: "",
    description: "",
    notes: "",
    ...overrides,
  });

  const openSectionModal = (type: "scenarios" | "phases" | "voiceTone", entry?: SectionEntry) => {
    setEditingSectionType(type);
    if (entry) {
      setEditingSectionEntry(entry);
      setSectionForm({
        title: entry.title,
        description: entry.description,
        notes: entry.notes || "",
      });
    } else {
      setEditingSectionEntry(null);
      setSectionForm({ title: "", description: "", notes: "" });
    }
    setShowSectionModal(true);
  };

  const closeSectionModal = () => {
    setShowSectionModal(false);
    setEditingSectionType(null);
    setEditingSectionEntry(null);
    setSectionForm({ title: "", description: "", notes: "" });
  };

  const saveSectionEntry = () => {
    if (!editingSectionType) return;
    
    const getSetter = () => {
      switch (editingSectionType) {
        case "scenarios": return setScenarios;
        case "phases": return setPhases;
        case "voiceTone": return setVoiceTone;
      }
    };
    
    const setter = getSetter();
    
    if (editingSectionEntry) {
      setter((prev) =>
        prev.map((entry) =>
          entry.id === editingSectionEntry.id
            ? { ...entry, ...sectionForm }
            : entry
        )
      );
    } else {
      setter((prev) => [...prev, createSectionEntry(sectionForm)]);
    }
    closeSectionModal();
  };

  const deleteSectionEntry = (type: "scenarios" | "phases" | "voiceTone", id: string) => {
    const getSetter = () => {
      switch (type) {
        case "scenarios": return setScenarios;
        case "phases": return setPhases;
        case "voiceTone": return setVoiceTone;
      }
    };
    const setter = getSetter();
    setter((prev) => prev.filter((entry) => entry.id !== id));
  };

  const getSectionConfig = (sectionType: "scenarios" | "phases" | "voiceTone") => {
    const defaultConfigs = {
      scenarios: {
        title: "Scenarios",
        description: "Define the main scenarios your agent should handle",
        addLabel: "Add Scenario",
      },
      phases: {
        title: "Conversation Phases",
        description: "Define the phases your agent should follow during conversations",
        addLabel: "Add Phase",
      },
      voiceTone: {
        title: "Voice & Tone",
        description: "Define the tone and communication style your agent should maintain",
        addLabel: "Add Tone",
      },
    };

    const defaultConfig = defaultConfigs[sectionType];
    const behaviourSection = behaviourConfig?.[sectionType];

    if (behaviourSection) {
      return {
        title: behaviourSection.label || defaultConfig.title,
        description: behaviourSection.description || defaultConfig.description,
        addLabel: behaviourSection.add_label || defaultConfig.addLabel,
      };
    }

    return defaultConfig;
  };

  const renderSectionEditor = (
    entries: SectionEntry[],
    sectionType: "scenarios" | "phases" | "voiceTone"
  ) => {
    const config = getSectionConfig(sectionType);
    return (
      <div className="border border-border rounded-lg bg-white p-4 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="text-sm font-semibold">{config.title}</h4>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openSectionModal(sectionType)}
            className="flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            {config.addLabel}
          </Button>
        </div>

        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No {config.title.toLowerCase()} defined yet. Use the button above to add one.
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="group flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
              >
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => openSectionModal(sectionType, entry)}
                >
                  <h5 className="text-sm font-medium truncate">
                    {entry.title || <span className="text-muted-foreground italic">Untitled</span>}
                  </h5>
                  {entry.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {entry.description.length > 80
                        ? `${entry.description.slice(0, 80)}...`
                        : entry.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => openSectionModal(sectionType, entry)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => deleteSectionEntry(sectionType, entry.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Step 4: Voice
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(propLoadingVoices || false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Step 5: Language
  const [selectedLanguage, setSelectedLanguage] = useState<string>("english");

  // Handle behaviour change
  const handleBehaviourChange = async (behaviourId: string) => {
    const newBehaviourId = behaviourId === "none" ? undefined : parseInt(behaviourId, 10);
    
    if (newBehaviourId) {
      try {
        setLoadingBehaviours(true);
        const response = await adminApi.behaviours.show(newBehaviourId);
        if (response.data) {
          const behaviour = response.data;
          const config: BehaviourConfig = {};
          behaviour.sections?.forEach(section => {
            if (section.section_type === "scenarios") {
              config.scenarios = {
                label: section.label,
                description: section.description,
                add_label: section.add_label,
                title_placeholder: section.title_placeholder,
                description_placeholder: section.description_placeholder,
                notes_placeholder: section.notes_placeholder,
                notes_label: section.notes_label,
              };
            } else if (section.section_type === "phases") {
              config.phases = {
                label: section.label,
                description: section.description,
                add_label: section.add_label,
                title_placeholder: section.title_placeholder,
                description_placeholder: section.description_placeholder,
                notes_placeholder: section.notes_placeholder,
                notes_label: section.notes_label,
              };
            } else if (section.section_type === "voice_tone") {
              config.voiceTone = {
                label: section.label,
                description: section.description,
                add_label: section.add_label,
                title_placeholder: section.title_placeholder,
                description_placeholder: section.description_placeholder,
                notes_placeholder: section.notes_placeholder,
                notes_label: section.notes_label,
              };
            }
          });
          setBehaviourConfig(config);
          setCurrentBehaviourId(behaviour.id);
          setCurrentBehaviourName(behaviour.name);
        }
      } catch (error) {
        console.error("Error loading behaviour:", error);
        toast({
          title: "Error",
          description: "Failed to load behaviour template.",
          variant: "destructive",
        });
      } finally {
        setLoadingBehaviours(false);
      }
    } else {
      // Reset to default behaviour
      const defaultBehaviour = availableBehaviours.find(b => b.name === "Default");
      if (defaultBehaviour) {
        const config: BehaviourConfig = {};
        defaultBehaviour.sections?.forEach(section => {
          if (section.section_type === "scenarios") {
            config.scenarios = {
              label: section.label,
              description: section.description,
              add_label: section.add_label,
              title_placeholder: section.title_placeholder,
              description_placeholder: section.description_placeholder,
              notes_placeholder: section.notes_placeholder,
              notes_label: section.notes_label,
            };
          } else if (section.section_type === "phases") {
            config.phases = {
              label: section.label,
              description: section.description,
              add_label: section.add_label,
              title_placeholder: section.title_placeholder,
              description_placeholder: section.description_placeholder,
              notes_placeholder: section.notes_placeholder,
              notes_label: section.notes_label,
            };
          } else if (section.section_type === "voice_tone") {
            config.voiceTone = {
              label: section.label,
              description: section.description,
              add_label: section.add_label,
              title_placeholder: section.title_placeholder,
              description_placeholder: section.description_placeholder,
              notes_placeholder: section.notes_placeholder,
              notes_label: section.notes_label,
            };
          }
        });
        setBehaviourConfig(config);
        setCurrentBehaviourId(defaultBehaviour.id);
        setCurrentBehaviourName(defaultBehaviour.name);
      } else {
        setBehaviourConfig(undefined);
        setCurrentBehaviourId(undefined);
        setCurrentBehaviourName(undefined);
      }
    }
  };

  // Fetch available behaviours and automatically set default
  useEffect(() => {
    const fetchBehaviours = async () => {
      setLoadingBehaviours(true);
      try {
        const response = await adminApi.behaviours.list();
        if (response.data) {
          const behaviours = Array.isArray(response.data) ? response.data : [];
          setAvailableBehaviours(behaviours);
          
          // Automatically set default behaviour if not already set and no template is being loaded
          if (!currentBehaviourId && !initialData?.templateId) {
            const defaultBehaviour = behaviours.find(b => b.name === "Default");
            if (defaultBehaviour) {
              try {
                const behaviourResponse = await adminApi.behaviours.show(defaultBehaviour.id);
                if (behaviourResponse.data) {
                  const behaviour = behaviourResponse.data;
                  const config: BehaviourConfig = {};
                  behaviour.sections?.forEach(section => {
                    if (section.section_type === "scenarios") {
                      config.scenarios = {
                        label: section.label,
                        description: section.description,
                        add_label: section.add_label,
                        title_placeholder: section.title_placeholder,
                        description_placeholder: section.description_placeholder,
                        notes_placeholder: section.notes_placeholder,
                        notes_label: section.notes_label,
                      };
                    } else if (section.section_type === "phases") {
                      config.phases = {
                        label: section.label,
                        description: section.description,
                        add_label: section.add_label,
                        title_placeholder: section.title_placeholder,
                        description_placeholder: section.description_placeholder,
                        notes_placeholder: section.notes_placeholder,
                        notes_label: section.notes_label,
                      };
                    } else if (section.section_type === "voice_tone") {
                      config.voiceTone = {
                        label: section.label,
                        description: section.description,
                        add_label: section.add_label,
                        title_placeholder: section.title_placeholder,
                        description_placeholder: section.description_placeholder,
                        notes_placeholder: section.notes_placeholder,
                        notes_label: section.notes_label,
                      };
                    }
                  });
                  setBehaviourConfig(config);
                  setCurrentBehaviourId(behaviour.id);
                  setCurrentBehaviourName(behaviour.name);
                }
              } catch (error) {
                console.error("Error loading default behaviour:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching behaviours:", error);
      } finally {
        setLoadingBehaviours(false);
      }
    };
    
    fetchBehaviours();
  }, []);

  // Load template and behaviour (or default behaviour if no template)
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        if (initialData?.templateId) {
          // Load template and its associated behaviour
          const response = await agentTemplatesApi.list();
          if (response.data) {
            const templates = Array.isArray(response.data) ? response.data : [];
            const foundTemplate = templates.find(t => t.id.toString() === initialData.templateId);
            if (foundTemplate) {
              setTemplate(foundTemplate);
              
              // Pre-populate from template defaults if available
              const templateDefault = templateDefaults[foundTemplate.title];
              if (templateDefault) {
                // Pre-populate model
                setSelectedProvider(templateDefault.provider);
                setSelectedModel(templateDefault.model);
                
                // Pre-populate scenarios, phases, and voice tone with fresh IDs
                const generateId = () => `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                setScenarios(templateDefault.scenarios.map(s => ({ ...s, id: generateId() })));
                setPhases(templateDefault.phases.map(p => ({ ...p, id: generateId() })));
                setVoiceTone(templateDefault.voiceTone.map(v => ({ ...v, id: generateId() })));
                
                // Pre-populate first message if template has one and initialData doesn't override it
                if (foundTemplate.first_message && !initialData?.firstMessage) {
                  setFirstMessage(foundTemplate.first_message);
                }
              } else if (foundTemplate.first_message && !initialData?.firstMessage) {
                // Even without template defaults, pre-populate first message
                setFirstMessage(foundTemplate.first_message);
              }
              
              // If template has a behaviour ID, load the full behaviour with sections
              if (foundTemplate.agent_behaviour_id && foundTemplate.agent_behaviour) {
                // Check if sections are already loaded in the response
                if (foundTemplate.agent_behaviour.sections && foundTemplate.agent_behaviour.sections.length > 0) {
                  // Sections are included, use them
                  const config: BehaviourConfig = {};
                  foundTemplate.agent_behaviour.sections.forEach(section => {
                    if (section.section_type === "scenarios") {
                      config.scenarios = {
                        label: section.label,
                        description: section.description,
                        add_label: section.add_label,
                        title_placeholder: section.title_placeholder,
                        description_placeholder: section.description_placeholder,
                        notes_placeholder: section.notes_placeholder,
                        notes_label: section.notes_label,
                      };
                    } else if (section.section_type === "phases") {
                      config.phases = {
                        label: section.label,
                        description: section.description,
                        add_label: section.add_label,
                        title_placeholder: section.title_placeholder,
                        description_placeholder: section.description_placeholder,
                        notes_placeholder: section.notes_placeholder,
                        notes_label: section.notes_label,
                      };
                    } else if (section.section_type === "voice_tone") {
                      config.voiceTone = {
                        label: section.label,
                        description: section.description,
                        add_label: section.add_label,
                        title_placeholder: section.title_placeholder,
                        description_placeholder: section.description_placeholder,
                        notes_placeholder: section.notes_placeholder,
                        notes_label: section.notes_label,
                      };
                    }
                  });
                  setBehaviourConfig(config);
                  setCurrentBehaviourId(foundTemplate.agent_behaviour.id);
                  setCurrentBehaviourName(foundTemplate.agent_behaviour.name);
                } else {
                  // Sections not included, fetch the full behaviour
                  try {
                    const behaviourResponse = await adminApi.behaviours.show(foundTemplate.agent_behaviour_id);
                    if (behaviourResponse.data) {
                      const behaviour = behaviourResponse.data;
                      if (behaviour.sections && behaviour.sections.length > 0) {
                        const config: BehaviourConfig = {};
                        behaviour.sections.forEach((section) => {
                        if (section.section_type === "scenarios") {
                          config.scenarios = {
                            label: section.label,
                            description: section.description,
                            add_label: section.add_label,
                            title_placeholder: section.title_placeholder,
                            description_placeholder: section.description_placeholder,
                            notes_placeholder: section.notes_placeholder,
                            notes_label: section.notes_label,
                          };
                        } else if (section.section_type === "phases") {
                          config.phases = {
                            label: section.label,
                            description: section.description,
                            add_label: section.add_label,
                            title_placeholder: section.title_placeholder,
                            description_placeholder: section.description_placeholder,
                            notes_placeholder: section.notes_placeholder,
                            notes_label: section.notes_label,
                          };
                        } else if (section.section_type === "voice_tone") {
                          config.voiceTone = {
                            label: section.label,
                            description: section.description,
                            add_label: section.add_label,
                            title_placeholder: section.title_placeholder,
                            description_placeholder: section.description_placeholder,
                            notes_placeholder: section.notes_placeholder,
                            notes_label: section.notes_label,
                          };
                        }
                        });
                        setBehaviourConfig(config);
                        setCurrentBehaviourId(behaviour.id);
                        setCurrentBehaviourName(behaviour.name);
                      }
                    }
                  } catch (error) {
                    console.error("Error loading template behaviour:", error);
                    // Fallback to default behaviour
                    await loadDefaultBehaviour();
                  }
                }
              } else {
                // Template has no behaviour, load default
                await loadDefaultBehaviour();
              }
            }
          }
        } else {
          // No template selected, load default behaviour
          await loadDefaultBehaviour();
        }
      } catch (error) {
        console.error("Error loading template/behaviour:", error);
        // Fallback to default behaviour on error
        await loadDefaultBehaviour();
      }
    };

    const loadDefaultBehaviour = async () => {
      try {
        const response = await adminApi.behaviours.list();
        if (response.data) {
          const behaviours = Array.isArray(response.data) ? response.data : [];
          const defaultBehaviour = behaviours.find(b => b.name === "Default");
          if (defaultBehaviour?.sections) {
            const config: BehaviourConfig = {};
            defaultBehaviour.sections.forEach(section => {
              if (section.section_type === "scenarios") {
                config.scenarios = {
                  label: section.label,
                  description: section.description,
                  add_label: section.add_label,
                  title_placeholder: section.title_placeholder,
                  description_placeholder: section.description_placeholder,
                  notes_placeholder: section.notes_placeholder,
                  notes_label: section.notes_label,
                };
              } else if (section.section_type === "phases") {
                config.phases = {
                  label: section.label,
                  description: section.description,
                  add_label: section.add_label,
                  title_placeholder: section.title_placeholder,
                  description_placeholder: section.description_placeholder,
                  notes_placeholder: section.notes_placeholder,
                  notes_label: section.notes_label,
                };
              } else if (section.section_type === "voice_tone") {
                config.voiceTone = {
                  label: section.label,
                  description: section.description,
                  add_label: section.add_label,
                  title_placeholder: section.title_placeholder,
                  description_placeholder: section.description_placeholder,
                  notes_placeholder: section.notes_placeholder,
                  notes_label: section.notes_label,
                };
              }
            });
            setBehaviourConfig(config);
            setCurrentBehaviourId(defaultBehaviour.id);
            setCurrentBehaviourName(defaultBehaviour.name);
            // Set template to null to indicate no template selected
            setTemplate(null);
          }
        }
      } catch (error) {
        console.error("Error loading default behaviour:", error);
      }
    };
    
    loadTemplate();
  }, [initialData?.templateId, initialData?.firstMessage]);

  // Fetch voices if not provided
  useEffect(() => {
    const fetchVoices = async () => {
      // Always fetch from API to get full voice data including preview_url
      setLoadingVoices(true);
      try {
        const response = await voicesApi.list();
        if (response.data) {
          setVoices(response.data);
        }
      } catch (err) {
        console.error('Error fetching voices:', err);
        // Fallback to prop voices if API fails
        if (propVoices && propVoices.length > 0) {
          const convertedVoices: Voice[] = propVoices.map(v => ({
            id: v.id,
            name: v.name || v.id,
          }));
          setVoices(convertedVoices);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load voices. Please try again.',
            variant: 'destructive',
          });
        }
      } finally {
        setLoadingVoices(false);
      }
    };

    fetchVoices();
  }, [propVoices, toast]);

  // Pre-populate voice when template and voices are both loaded
  useEffect(() => {
    if (template && voices.length > 0 && !selectedVoiceId) {
      const templateDefault = templateDefaults[template.title];
      if (templateDefault && templateDefault.recommendedVoiceIds && templateDefault.recommendedVoiceIds.length > 0) {
        // Try to find a recommended voice
        const recommendedVoice = voices.find(v => templateDefault.recommendedVoiceIds!.includes(v.id));
        if (recommendedVoice) {
          setSelectedVoiceId(recommendedVoice.id);
        }
      } else {
        // Default: Select first professional-sounding voice (prioritize voices with names containing professional keywords)
        const professionalKeywords = ['charlie', 'sarah', 'david', 'emily', 'james', 'professional', 'confident'];
        const professionalVoice = voices.find(v => 
          v.name && professionalKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
        ) || voices[0];
        
        if (professionalVoice) {
          setSelectedVoiceId(professionalVoice.id);
        }
      }
    }
  }, [template, voices, selectedVoiceId]);


  const handleSetStep = (direction: -1 | 1) => {
    const minStep = shouldSkipNameStep ? 1 : 0;
    const maxStep = shouldSkipNameStep ? steps.length - 2 : steps.length - 1;
    
    if ((currentStep === minStep && direction === -1) || (currentStep === maxStep && direction === 1)) {
      return;
    }
    setCurrentStep((prev) => prev + direction);
  };

  const handleSaveStep = async () => {
    setSaving(true);
    try {
      // Serialize section entries
      const serializeSectionEntries = (entries: SectionEntry[]): SectionPayload[] =>
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

      const serializedScenarios = serializeSectionEntries(scenarios);
      const serializedPhases = serializeSectionEntries(phases);
      const serializedTone = serializeSectionEntries(voiceTone);

      const config: Record<string, unknown> = {
        conversation_config: {
          model: {
            model: selectedModel,
            provider: selectedProvider,
            messages: [
              {
                role: "system",
                content: systemPrompt
              }
            ]
          },
          // Save the template prompt if provided (from template selection)
          ...(initialData?.systemPrompt ? {
            system_prompt_template: initialData.systemPrompt
          } : {}),
          // Store behaviour reference and config (either from template or default)
          ...(behaviourConfig && currentBehaviourId ? {
            agent_behaviour_id: currentBehaviourId,
            // Also store the config for useAgentData to use section labels
            agent_behaviour_config: behaviourConfig,
          } : {}),
          // Include section entries in prompt_sections (matching useAgentData.ts structure)
          prompt_sections: {
            scenarios: serializedScenarios,
            phases: serializedPhases,
            voiceTone: serializedTone,
          },
          transcriber: {
            provider: "elevenlabs",
            language: selectedLanguage || "english",
            model: "flux-general",
          },
          // Always include voice_id if selected (required for Voice and Language steps)
          ...(selectedVoiceId ? {
            voice_id: selectedVoiceId,
            voice: {
              voice_id: selectedVoiceId,
            }
          } : {}),
          // Include first message if provided
          ...(firstMessage && firstMessage.trim() ? {
            first_message: firstMessage.trim(),
            first_message_mode: "assistant-speaks-first"
          } : {})
        },
        platform_settings: {
          ...(selectedVoiceId && { voice_id: selectedVoiceId }),
          language: selectedLanguage || "english"
        }
      };

      let savedAgentId = agentId;

      if (agentId) {
        // Update existing agent
        const response = await agentsApi.update(agentId, {
          name: name.trim(),
          ...config
        });
        if (response.data) {
          savedAgentId = response.data.id;
        } else {
          throw new Error('Failed to update agent');
        }
      } else {
        // Create new agent
        const response = await agentsApi.create({
          name: name.trim(),
          ...config
        });
        if (response.data) {
          savedAgentId = response.data.id;
          setAgentId(response.data.id);
        } else {
          throw new Error('Failed to create agent');
        }
      }

      // Only sync with ElevenLabs on Voice (step 3, index 3) and Language (step 4, index 4) steps
      // Steps array: [0: Name, 1: Model, 2: Agent Behaviour, 3: Voice, 4: Language, 5: Preview]
      const shouldSyncWithElevenLabs = currentStep === 3 || currentStep === 4;
      
      // Ensure voice_id is set before syncing (required for ElevenLabs)
      const hasRequiredFields = shouldSyncWithElevenLabs ? selectedVoiceId && selectedVoiceId.trim() !== "" : true;

      if (shouldSyncWithElevenLabs && savedAgentId && hasRequiredFields) {
        // Small delay to ensure database transaction is committed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          console.log(`[CreateAgentWizard] Syncing with ElevenLabs for step ${currentStep} (${steps[currentStep].label}), agent ID: ${savedAgentId}`);
          console.log(`[CreateAgentWizard] Current config - Voice ID: ${selectedVoiceId}, Language: ${selectedLanguage}`);
          console.log(`[CreateAgentWizard] Full config being sent:`, JSON.stringify(config, null, 2));
          
          const publishResponse = await agentsApi.publish(savedAgentId);
          console.log('[CreateAgentWizard] Publish response:', publishResponse);
          
          if (publishResponse.data) {
            toast({
              title: 'Success',
              description: `${steps[currentStep].label} saved and synced with ElevenLabs successfully.`,
            });
          } else {
            throw new Error('Publish response did not return agent data');
          }
        } catch (publishErr) {
          console.error('[CreateAgentWizard] Failed to sync with ElevenLabs:', publishErr);
          const errorMessage = publishErr instanceof Error ? publishErr.message : 'Unknown error';
          // If publish fails, still show success for database save but warn about ElevenLabs
          toast({
            title: 'Partially saved',
            description: `${steps[currentStep].label} saved to database, but failed to sync with ElevenLabs: ${errorMessage}`,
            variant: 'destructive',
          });
          // Don't re-throw - allow user to continue even if sync fails
        }
        
      } else if (shouldSyncWithElevenLabs && !hasRequiredFields) {
        // Voice/Language step but missing required fields
        toast({
          title: 'Warning',
          description: `${steps[currentStep].label} saved to database, but cannot sync with ElevenLabs: Voice ID is required.`,
          variant: 'destructive',
        });
      } else {
        // For Name and Model steps, just show success for database save
        console.log(`[CreateAgentWizard] Skipping ElevenLabs sync for step ${currentStep} (${steps[currentStep].label})`);
        toast({
          title: 'Success',
          description: `${steps[currentStep].label} saved successfully.`,
        });
      }

      // Steps: [0: Name, 1: Model, 2: Agent Behaviour, 3: Voice, 4: Language, 5: Preview]
      // If skipNameStep: start at 1, max is 5
      // If not skipNameStep: start at 0, max is 5
      const maxStep = steps.length - 1; // Always 5 (Preview step)
      if (currentStep === maxStep) {
        onComplete(savedAgentId);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const isStepValid = () => {
    // If name step is skipped, currentStep 1 = Model, 2 = Agent Behaviour, 3 = Voice, 4 = Language, 5 = Preview
    // If name step is not skipped, currentStep 0 = Name, 1 = Model, 2 = Agent Behaviour, 3 = Voice, 4 = Language, 5 = Preview
    if (shouldSkipNameStep) {
      switch (currentStep) {
        case 1: // Model step
          return selectedModel.trim() !== "" && systemPrompt.trim() !== "";
        case 2: // Agent Behaviour step (optional - can skip)
          return true; // Agent behaviour is optional
        case 3: // Voice step
          return selectedVoiceId.trim() !== "";
        case 4: // Language step
          return selectedLanguage.trim() !== "";
        case 5: // Preview step
          return true; // Preview is always valid
        default:
          return false;
      }
    } else {
      switch (currentStep) {
        case 0:
          return name.trim() !== "" && name.trim() !== "Enter a name for your assistant.";
        case 1:
          return selectedModel.trim() !== "" && systemPrompt.trim() !== "";
        case 2: // Agent Behaviour step (optional - can skip)
          return true; // Agent behaviour is optional
        case 3:
          return selectedVoiceId.trim() !== "";
        case 4:
          return selectedLanguage.trim() !== "";
        case 5: // Preview step
          return true; // Preview is always valid
        default:
          return false;
      }
    }
  };

  const handlePlayPreview = (voice: Voice) => {
    if (!voice.preview_url) {
      console.warn('No preview_url for voice:', voice.id, voice);
      toast({
        title: 'Preview unavailable',
        description: 'This voice does not have a preview available.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Playing preview for voice:', voice.id, 'URL:', voice.preview_url);

    // Stop currently playing audio if any
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
      setPlayingVoiceId(null);
    }

    // If clicking the same voice that's playing, just stop it
    if (playingVoiceId === voice.id) {
      setPlayingVoiceId(null);
      return;
    }

    // Create and play new audio
    const audio = new Audio(voice.preview_url);
    currentAudioRef.current = audio;
    setPlayingVoiceId(voice.id || null);

    // Handle when audio ends
    audio.addEventListener('ended', () => {
      console.log('Audio ended for voice:', voice.id);
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
    });

    // Handle errors
    audio.addEventListener('error', (e) => {
      console.error('Audio error for voice:', voice.id, e);
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
      toast({
        title: 'Preview unavailable',
        description: 'Could not play voice preview.',
        variant: 'destructive',
      });
    });

    audio.play().catch((err) => {
      console.error('Error playing preview:', err, 'Voice:', voice.id, 'URL:', voice.preview_url);
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
      toast({
        title: 'Preview unavailable',
        description: 'Could not play voice preview. Please check your browser audio settings.',
        variant: 'destructive',
      });
    });
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);


  const selectedVoice = voices.find(v => v.id === selectedVoiceId);

  const renderStepContent = () => {
    // If name step is skipped, currentStep 1 = Model, 2 = Agent Behaviour, 3 = Voice, 4 = Transcriber, 5 = Phone Number
    // If name step is not skipped, currentStep 0 = Name, 1 = Model, 2 = Agent Behaviour, 3 = Voice, 4 = Transcriber, 5 = Phone Number
    if (shouldSkipNameStep) {
      switch (currentStep) {
        case 1: // Model step
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Provider</label>
                <Select
                  value={selectedProvider}
                  onValueChange={(value) => {
                    setSelectedProvider(value);
                    const models = modelsByProvider[value];
                    if (models && models.length > 0) {
                      setSelectedModel(models[0].value);
                    }
                  }}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <span className="flex items-center gap-2">
                          <span>{provider.icon}</span>
                          <span>{provider.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelsByProvider[selectedProvider]?.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        case 2: // Agent Behaviour step
          return (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Define scenarios, conversation phases, and voice tone to customize your agent's behavior. These are optional but help create a more tailored experience.
                  </p>
                </div>
              </div>
              
              {renderSectionEditor(scenarios, "scenarios")}
              {renderSectionEditor(phases, "phases")}
              {renderSectionEditor(voiceTone, "voiceTone")}
            </div>
          );
        case 3: // Voice step
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Voice</label>
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
                      onClick={() => setShowVoiceSelector(true)}
                    >
                      {selectedVoice ? (
                        <span className="flex items-center gap-2">
                          <AudioLines className="h-4 w-4" />
                          {selectedVoice.name || selectedVoice.id}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Select a voice</span>
                      )}
                    </Button>
                    <VoiceSelectorDialog
                      open={showVoiceSelector}
                      onOpenChange={setShowVoiceSelector}
                      voices={voices}
                      selectedVoiceId={selectedVoiceId}
                      onSelectVoice={(voiceId) => {
                        setSelectedVoiceId(voiceId);
                        setShowVoiceSelector(false);
                      }}
                      playingVoiceId={playingVoiceId}
                      onPlayPreview={handlePlayPreview}
                      searchQuery={voiceSearchQuery}
                      onSearchChange={setVoiceSearchQuery}
                    />
                  </>
                )}
              </div>
            </div>
          );
        case 4: // Language step
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="bg-white">
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
          );
        case 5: // Preview step
          return (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Review your agent configuration before completing the setup.
              </p>
              
              <div className="space-y-4">
                {/* Name */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Name</h3>
                  </div>
                  <p className="text-sm">{name || "Not set"}</p>
                </div>

                {/* Model */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Model</h3>
                  </div>
                  <p className="text-sm">
                    {providers.find(p => p.value === selectedProvider)?.label} - {modelsByProvider[selectedProvider]?.find(m => m.value === selectedModel)?.label || selectedModel}
                  </p>
                </div>

                {/* Voice */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AudioLines className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Voice</h3>
                  </div>
                  <p className="text-sm">{selectedVoice?.name || selectedVoiceId || "Not selected"}</p>
                </div>

                {/* Language */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Language</h3>
                  </div>
                  <p className="text-sm capitalize">{selectedLanguage || "Not set"}</p>
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    } else {
      // Normal flow with name step
      switch (currentStep) {
        case 0:
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Assistant Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a name for your assistant"
                  className="w-full bg-white"
                />
              </div>
            </div>
          );
        case 1:
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Provider</label>
                <Select
                  value={selectedProvider}
                  onValueChange={(value) => {
                    setSelectedProvider(value);
                    const models = modelsByProvider[value];
                    if (models && models.length > 0) {
                      setSelectedModel(models[0].value);
                    }
                  }}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <span className="flex items-center gap-2">
                          <span>{provider.icon}</span>
                          <span>{provider.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelsByProvider[selectedProvider]?.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        case 2: // Agent Behaviour step
          return (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Define scenarios, conversation phases, and voice tone to customize your agent's behavior. These are optional but help create a more tailored experience.
                  </p>
                </div>
              </div>
              
              {renderSectionEditor(scenarios, "scenarios")}
              {renderSectionEditor(phases, "phases")}
              {renderSectionEditor(voiceTone, "voiceTone")}
            </div>
          );
        case 3: // Voice step
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Voice</label>
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
                      onClick={() => setShowVoiceSelector(true)}
                    >
                      {selectedVoice ? (
                        <span className="flex items-center gap-2">
                          <AudioLines className="h-4 w-4" />
                          {selectedVoice.name || selectedVoice.id}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Select a voice</span>
                      )}
                    </Button>
                    <VoiceSelectorDialog
                      open={showVoiceSelector}
                      onOpenChange={setShowVoiceSelector}
                      voices={voices}
                      selectedVoiceId={selectedVoiceId}
                      onSelectVoice={(voiceId) => {
                        setSelectedVoiceId(voiceId);
                        setShowVoiceSelector(false);
                      }}
                      playingVoiceId={playingVoiceId}
                      onPlayPreview={handlePlayPreview}
                      searchQuery={voiceSearchQuery}
                      onSearchChange={setVoiceSearchQuery}
                    />
                  </>
                )}
              </div>
            </div>
          );
        case 4: // Language step
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="bg-white">
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
          );
        case 5: // Preview step
          return (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Review your agent configuration before completing the setup.
              </p>
              
              <div className="space-y-4">
                {/* Name */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Name</h3>
                  </div>
                  <p className="text-sm">{name || "Not set"}</p>
                </div>

                {/* Model */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Model</h3>
                  </div>
                  <p className="text-sm">
                    {providers.find(p => p.value === selectedProvider)?.label} - {modelsByProvider[selectedProvider]?.find(m => m.value === selectedModel)?.label || selectedModel}
                  </p>
                </div>

                {/* Voice */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AudioLines className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Voice</h3>
                  </div>
                  <p className="text-sm">{selectedVoice?.name || selectedVoiceId || "Not selected"}</p>
                </div>

                {/* Language */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Language</h3>
                  </div>
                  <p className="text-sm capitalize">{selectedLanguage || "Not set"}</p>
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 md:p-8 bg-card border-b border-border">
        <Steps 
          numSteps={steps.length} 
          currentStep={shouldSkipNameStep ? currentStep : currentStep}
          steps={steps} 
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {shouldSkipNameStep 
                ? steps[currentStep]?.label
                : steps[currentStep]?.label
              }
            </h2>
            <p className="text-muted-foreground">
              {(() => {
                if (shouldSkipNameStep) {
                  if (currentStep === 1) return "Configure the AI model for your assistant.";
                  if (currentStep === 2) return "Define scenarios, phases, and voice tone to customize your agent's behavior.";
                  if (currentStep === 3) return "Select a voice for your assistant to use.";
                  if (currentStep === 4) return "Choose the language for your agent.";
                  if (currentStep === 5) return "Review your agent configuration before completing.";
                  return "";
                } else {
                  if (currentStep === 0) return "Give your assistant a name to identify it.";
                  if (currentStep === 1) return "Configure the AI model for your assistant.";
                  if (currentStep === 2) return "Define scenarios, phases, and voice tone to customize your agent's behavior.";
                  if (currentStep === 3) return "Select a voice for your assistant to use.";
                  if (currentStep === 4) return "Choose the language for your agent.";
                  if (currentStep === 5) return "Review your agent configuration before completing.";
                  return "";
                }
              })()}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            {renderStepContent()}
          </div>
        </div>
      </div>

      <div className="border-t border-border p-6 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => handleSetStep(-1)}
            disabled={(shouldSkipNameStep ? currentStep === 1 : currentStep === 0) || saving}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleSaveStep}
            disabled={!isStepValid() || saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {(shouldSkipNameStep ? currentStep === steps.length - 2 : currentStep === steps.length - 1) ? "Complete" : "Save & Continue"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Section Entry Modal */}
      <Dialog open={showSectionModal} onOpenChange={setShowSectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSectionEntry ? "Edit Entry" : "Add Entry"}
            </DialogTitle>
            <DialogDescription>
              {editingSectionType === "scenarios" && "Define a scenario your agent should handle."}
              {editingSectionType === "phases" && "Define a conversation phase your agent should follow."}
              {editingSectionType === "voiceTone" && "Define a tone or communication style for your agent."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="section-title">Title</Label>
              <Input
                id="section-title"
                value={sectionForm.title}
                onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                placeholder="Enter a title..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="section-description">Description</Label>
              <Textarea
                id="section-description"
                value={sectionForm.description}
                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                placeholder="Enter a description..."
                className="mt-1 min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="section-notes">Notes (optional)</Label>
              <Textarea
                id="section-notes"
                value={sectionForm.notes || ""}
                onChange={(e) => setSectionForm({ ...sectionForm, notes: e.target.value })}
                placeholder="Enter additional notes..."
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeSectionModal}>
              Cancel
            </Button>
            <Button onClick={saveSectionEntry}>
              {editingSectionEntry ? "Save Changes" : (() => {
                switch (editingSectionType) {
                  case "scenarios": return "Add Scenario";
                  case "phases": return "Add Conversation Phase";
                  case "voiceTone": return "Add Voice & Tone";
                  default: return "Add Entry";
                }
              })()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const Steps = ({
  numSteps,
  currentStep,
  steps,
}: {
  numSteps: number;
  currentStep: number;
  steps: StepType[];
}) => {
  return (
    <div className="flex items-center justify-center gap-2 max-w-2xl mx-auto">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isActive = isCompleted || isCurrent;
        const Icon = step.icon;

        return (
          <React.Fragment key={stepNum}>
            <Step 
              num={stepNum} 
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              icon={Icon} 
              label={step.label} 
            />
            {stepNum !== numSteps && (
              <div className={cn(
                "flex-1 h-0.5 rounded-full relative transition-colors",
                isCompleted ? "bg-primary" : "bg-muted"
              )}>
                {/* Thick line for completed connections */}
                {isCompleted && (
                  <div className="absolute top-0 bottom-0 left-0 right-0 bg-primary h-1 -top-0.5 rounded-full" />
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Step = ({ 
  num, 
  isCompleted,
  isCurrent,
  icon: Icon, 
  label 
}: { 
  num: number; 
  isCompleted: boolean;
  isCurrent: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) => {
  const isActive = isCompleted || isCurrent;
  
  return (
    <div className="relative flex flex-col items-center gap-2 min-w-[80px]">
      <div className="relative">
        {/* Glow effect for current step */}
        {isCurrent && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Step circle */}
        <div
          className={cn(
            "w-10 h-10 flex items-center justify-center shrink-0 rounded-full font-semibold text-sm relative z-10 transition-all duration-300",
            isCompleted
              ? "bg-primary border-2 border-primary text-primary-foreground"
              : isCurrent
              ? "bg-primary border-2 border-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary/20"
              : "border-2 border-muted-foreground/30 text-muted-foreground bg-background"
          )}
        >
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.div
                key="icon-check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="icon-step"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isCurrent ? "text-primary-foreground" : "text-muted-foreground"
                )} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <span className={cn(
        "text-xs font-medium text-center",
        isActive ? "text-foreground font-semibold" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  );
};
