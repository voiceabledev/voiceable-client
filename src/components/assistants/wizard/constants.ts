import {
  User,
  Code,
  AudioLines,
  Mic,
  Eye,
  Sparkles,
  Plug,
} from "lucide-react";
import { SectionEntry } from "@/types/assistant";
import type { StepType } from "./types";

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

export const WIDGET_SIZES = {
  small: { icon: 48, panelWidth: 320, panelHeight: 420 },
  medium: { icon: 56, panelWidth: 380, panelHeight: 500 },
  large: { icon: 64, panelWidth: 420, panelHeight: 580 },
};

export const steps: StepType[] = [
  { id: 1, label: "Name", icon: User },
  { id: 2, label: "Model", icon: Code },
  { id: 3, label: "Agent Behaviour", icon: Sparkles },
  { id: 4, label: "Voice", icon: AudioLines },
  { id: 5, label: "Language", icon: Mic },
  { id: 6, label: "Integrations", icon: Plug },
  { id: 7, label: "Preview", icon: Eye },
];

export type TemplateDefaults = {
  provider: string;
  model: string;
  recommendedVoiceIds?: string[]; // Voice IDs that work well for this template
  scenarios: SectionEntry[];
  phases: SectionEntry[];
  voiceTone: SectionEntry[];
};

export const templateDefaults: Record<string, TemplateDefaults> = {
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
