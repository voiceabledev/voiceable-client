import { sendChatGPTMessage } from "@/services/chatgptService";
import type { ChatMessage, WizardContext } from "@/utils/setupAssistantPrompts";

export type AgentType = 
  | "customer_support"
  | "lead_generation"
  | "sales_calls"
  | "appointment_booking"
  | "product_information"
  | "technical_support";

export interface AgentTypeDetectionResult {
  type: AgentType;
  confidence: "high" | "medium" | "low";
}

/**
 * Detects the agent type from a user description using AI
 */
export async function detectAgentType(description: string): Promise<AgentTypeDetectionResult | null> {
  if (!description.trim()) {
    return null;
  }

  const systemPrompt = `You are an AI assistant that classifies agent descriptions into one of these 6 types:
1. customer_support - For handling customer inquiries, troubleshooting issues, and providing support
2. lead_generation - For qualifying prospects, collecting contact information, and generating leads
3. sales_calls - For presenting products, handling objections, and closing deals
4. appointment_booking - For scheduling meetings, checking availability, and managing appointments
5. product_information - For providing product specs, pricing, availability, and recommendations
6. technical_support - For troubleshooting technical issues, providing step-by-step solutions

Respond with ONLY the type name (e.g., "customer_support") and nothing else.`;

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: `Classify this agent description: "${description.trim()}"`,
    },
  ];

  const emptyContext: WizardContext = {
    currentStep: 0,
    formValues: {},
    availableActions: [],
  };

  try {
    const response = await sendChatGPTMessage(messages, emptyContext);
    const detectedType = response.trim().toLowerCase().replace(/[^a-z_]/g, "") as AgentType;

    // Validate the detected type
    const validTypes: AgentType[] = [
      "customer_support",
      "lead_generation",
      "sales_calls",
      "appointment_booking",
      "product_information",
      "technical_support",
    ];

    if (validTypes.includes(detectedType)) {
      // Simple confidence scoring based on response clarity
      const confidence: "high" | "medium" | "low" = 
        response.trim().toLowerCase() === detectedType ? "high" : "medium";
      
      return {
        type: detectedType,
        confidence,
      };
    }

    // Fallback: try keyword matching if AI detection fails
    const lowerDescription = description.toLowerCase();
    if (lowerDescription.includes("customer support") || lowerDescription.includes("customer service") || lowerDescription.includes("support agent")) {
      return { type: "customer_support", confidence: "medium" };
    }
    if (lowerDescription.includes("lead generation") || lowerDescription.includes("qualify") || lowerDescription.includes("prospect")) {
      return { type: "lead_generation", confidence: "medium" };
    }
    if (lowerDescription.includes("sales") || lowerDescription.includes("close") || lowerDescription.includes("deal")) {
      return { type: "sales_calls", confidence: "medium" };
    }
    if (lowerDescription.includes("appointment") || lowerDescription.includes("booking") || lowerDescription.includes("schedule") || lowerDescription.includes("calendar")) {
      return { type: "appointment_booking", confidence: "medium" };
    }
    if (lowerDescription.includes("product") && (lowerDescription.includes("information") || lowerDescription.includes("spec") || lowerDescription.includes("pricing"))) {
      return { type: "product_information", confidence: "medium" };
    }
    if (lowerDescription.includes("technical support") || lowerDescription.includes("troubleshoot") || lowerDescription.includes("technical issue")) {
      return { type: "technical_support", confidence: "medium" };
    }

    return null;
  } catch (error) {
    console.error("Error detecting agent type:", error);
    // Fallback to keyword matching on error
    const lowerDescription = description.toLowerCase();
    if (lowerDescription.includes("customer support") || lowerDescription.includes("customer service")) {
      return { type: "customer_support", confidence: "low" };
    }
    if (lowerDescription.includes("lead generation") || lowerDescription.includes("qualify")) {
      return { type: "lead_generation", confidence: "low" };
    }
    if (lowerDescription.includes("sales")) {
      return { type: "sales_calls", confidence: "low" };
    }
    if (lowerDescription.includes("appointment") || lowerDescription.includes("booking") || lowerDescription.includes("schedule")) {
      return { type: "appointment_booking", confidence: "low" };
    }
    if (lowerDescription.includes("product") && lowerDescription.includes("information")) {
      return { type: "product_information", confidence: "low" };
    }
    if (lowerDescription.includes("technical support") || lowerDescription.includes("troubleshoot")) {
      return { type: "technical_support", confidence: "low" };
    }
    return null;
  }
}
