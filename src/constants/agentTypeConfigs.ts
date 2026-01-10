import type { AgentType } from "@/utils/agentTypeDetection";

export interface AgentTypeConfig {
  name: string;
  recommendedVoiceIds?: string[]; // Will be populated from available voices
  primaryGoals: string[]; // From PRIMARY_OUTCOMES
  behaviorPrompt: string; // Used for AI generation
}

export const AGENT_TYPE_CONFIGS: Record<AgentType, AgentTypeConfig> = {
  customer_support: {
    name: "Customer Support Agent",
    primaryGoals: ["call_transferred", "information_provided", "question_answered"],
    behaviorPrompt: "Create a customer support agent that can handle inquiries, troubleshoot issues, and escalate complex problems to human agents. The agent should be empathetic, patient, and solution-oriented.",
  },
  lead_generation: {
    name: "Lead Generation Agent",
    primaryGoals: ["lead_qualified", "lead_captured", "appointment_booked"],
    behaviorPrompt: "Build a lead generation agent that qualifies prospects, collects contact information, and schedules follow-up meetings. The agent should be engaging, ask strategic questions, and build rapport.",
  },
  sales_calls: {
    name: "Sales Agent",
    primaryGoals: ["lead_qualified", "appointment_booked", "follow_up_completed"],
    behaviorPrompt: "Design a sales agent that presents products, answers questions, handles objections, and closes deals over the phone. The agent should be confident, persuasive, and focused on understanding customer needs.",
  },
  appointment_booking: {
    name: "Appointment Booking Agent",
    primaryGoals: ["appointment_booked", "appointment_rescheduled", "information_provided"],
    behaviorPrompt: "Create an appointment booking agent that checks availability, schedules meetings, sends confirmations, and handles rescheduling. The agent should be organized, clear, and confirm all details.",
  },
  product_information: {
    name: "Product Information Agent",
    primaryGoals: ["information_provided", "question_answered", "feedback_collected"],
    behaviorPrompt: "Build a product information agent that provides detailed product specs, pricing, availability, and recommendations. The agent should be knowledgeable, helpful, and able to answer detailed questions.",
  },
  technical_support: {
    name: "Technical Support Agent",
    primaryGoals: ["call_transferred", "information_provided", "question_answered"],
    behaviorPrompt: "Design a technical support agent that troubleshoots issues, provides step-by-step solutions, and escalates when needed. The agent should be patient, methodical, and clear in explanations.",
  },
};

/**
 * Get configuration for an agent type
 */
export function getAgentTypeConfig(type: AgentType): AgentTypeConfig {
  return AGENT_TYPE_CONFIGS[type];
}
