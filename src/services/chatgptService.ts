import { buildChatPrompt, type ChatMessage, type WizardContext } from "@/utils/setupAssistantPrompts";

export type { ChatMessage };

// Get API base URL (same logic as api.ts)
function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = import.meta.env.VITE_API_BASE_URL;
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  if (typeof window !== 'undefined') {
    const runtimeConfig = (window as any).__API_BASE_URL__;
    if (runtimeConfig) {
      return runtimeConfig.endsWith('/') ? runtimeConfig.slice(0, -1) : runtimeConfig;
    }
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api/v1';
    }
    return `${protocol}//${hostname}/api/v1`;
  }
  return 'http://localhost:3000/api/v1';
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Sends a message to ChatGPT and returns the response
 * Uses backend endpoint if available, otherwise falls back to direct OpenAI call
 */
export async function sendChatGPTMessage(
  messages: ChatMessage[],
  wizardContext: WizardContext
): Promise<string> {
  try {
    // Try backend endpoint first
    const response = await fetch(`${API_BASE_URL}/agents/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("auth_token") || ""}`,
      },
      body: JSON.stringify({
        messages: buildChatPrompt(messages, wizardContext),
        context: wizardContext,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.response || data.message || "I'm here to help!";
    }

    // If backend endpoint doesn't exist, throw to use fallback
    throw new Error("Backend endpoint not available");
  } catch (error) {
    console.warn("Backend ChatGPT endpoint not available, using fallback:", error);
    
    // Fallback: Use direct OpenAI API call (requires API key in env)
    // Note: In production, this should always go through backend for security
    return sendDirectOpenAIMessage(messages, wizardContext);
  }
}

/**
 * Fallback: Direct OpenAI API call
 * WARNING: This exposes API keys in frontend - should only be used in development
 * or with a proxy endpoint
 */
async function sendDirectOpenAIMessage(
  messages: ChatMessage[],
  wizardContext: WizardContext
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "OpenAI API key not configured. Please set VITE_OPENAI_API_KEY or implement backend endpoint."
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: buildChatPrompt(messages, wizardContext),
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get ChatGPT response");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm here to help!";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

/**
 * Streams a ChatGPT response (for future enhancement)
 */
export async function* streamChatGPTMessage(
  messages: ChatMessage[],
  wizardContext: WizardContext
): AsyncGenerator<string, void, unknown> {
  // Implementation for streaming responses
  // This can be added later for better UX
  const response = await sendChatGPTMessage(messages, wizardContext);
  yield response;
}
