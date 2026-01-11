import { sendChatGPTMessage } from "@/services/chatgptService";
import type { ChatMessage, WizardContext } from "@/utils/setupAssistantPrompts";
import type { AgentType } from "./agentTypeDetection";

/**
 * Fallback template messages based on agent type
 */
function getTemplateFirstMessage(agentType?: AgentType, assistantName?: string): string {
  switch (agentType) {
    case "customer_support":
      return `Hi! Thank you for calling. I'm here to help with your inquiry, troubleshoot any issues, or assist with your needs. How can I help you today?`;
    case "lead_generation":
      return `Hello! Thank you for your interest. I'd love to learn more about what you're looking for and see how we can help. What brings you here today?`;
    case "sales_calls":
      return `Hi there! Thanks for taking the time to speak with me. I'm here to help you find the perfect solution for your needs. What can I help you with today?`;
    case "appointment_booking":
      return `Thank you for calling. This is your scheduling assistant. How may I help you today?`;
    case "product_information":
      return `Hello! Thank you for calling. I can help you with product information, pricing, availability, and recommendations. What would you like to know?`;
    case "technical_support":
      return `Hi there, this is technical support. I'm here to help troubleshoot any issues you're experiencing. How can I assist you today?`;
    default:
      return `Hi there! Thank you for calling. How can I help you today?`;
  }
}

/**
 * Generates a personalized first message for an agent using AI
 * Falls back to template messages if generation fails
 * 
 * @param systemPrompt - The agent's system prompt/description
 * @param agentType - Optional detected agent type
 * @param assistantName - Optional assistant name
 * @param timeout - Maximum time to wait for generation in ms (default: 5000)
 * @returns Generated first message or fallback template
 */
export async function generateFirstMessage(
  systemPrompt: string,
  agentType?: AgentType,
  assistantName?: string,
  timeout: number = 5000
): Promise<string> {
  if (!systemPrompt.trim()) {
    return getTemplateFirstMessage(agentType, assistantName);
  }

  const systemMessage: ChatMessage = {
    role: "system",
    content: `You are an AI assistant that creates natural, welcoming first messages for voice AI agents. 
    
Create a brief, friendly first message (1-2 sentences) that the agent will say when answering a call. 
The message should:
- Sound natural and conversational
- Be welcoming and professional
- Briefly indicate what the agent can help with
- Be appropriate for a voice conversation (not too long)

Respond with ONLY the first message text, nothing else. No explanations, no quotes, just the message itself.`,
  };

  const userMessage: ChatMessage = {
    role: "user",
    content: `Based on this agent description: "${systemPrompt.trim()}"${
      agentType ? ` and agent type: ${agentType.replace(/_/g, " ")}` : ""
    }, create a brief, friendly first message that the agent will say when answering a call.`,
  };

  const messages: ChatMessage[] = [systemMessage, userMessage];
  const emptyContext: WizardContext = {
    currentStep: 0,
    formValues: {},
    availableActions: [],
  };

  try {
    // Create a promise with timeout
    const generationPromise = sendChatGPTMessage(messages, emptyContext);
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("Generation timeout")), timeout)
    );

    // Race between generation and timeout
    const response = await Promise.race([generationPromise, timeoutPromise]);
    
    // Clean up the response - remove quotes, extra whitespace, etc.
    const cleanedResponse = response
      .trim()
      .replace(/^["']|["']$/g, "") // Remove surrounding quotes
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .trim();

    // Validate response is reasonable (not empty, not too long)
    if (cleanedResponse.length > 0 && cleanedResponse.length < 500) {
      return cleanedResponse;
    }

    // If response is invalid, fall back to template
    console.warn("AI generated invalid first message, using template");
    return getTemplateFirstMessage(agentType, assistantName);
  } catch (error) {
    // Log error but don't throw - always return a fallback message
    console.error("Error generating first message with AI:", error);
    return getTemplateFirstMessage(agentType, assistantName);
  }
}
