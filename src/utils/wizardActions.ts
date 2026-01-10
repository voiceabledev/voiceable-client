/**
 * Wizard action types and parsers
 * Handles parsing ChatGPT responses to extract actionable intents
 */

export type WizardActionType =
  | "CLICK_BUTTON"
  | "FILL_FIELD"
  | "NAVIGATE_STEP"
  | "SELECT_OPTION"
  | "OPEN_INTEGRATION_MODAL"
  | "ENABLE_FUNCTION"
  | "SKIP_PHASE"
  | "ADVANCE_FLOW"
  | "NONE";

export interface WizardAction {
  type: WizardActionType;
  target: string;
  value?: string;
  message?: string;
}

/**
 * Parses a ChatGPT response to extract action intent
 * Looks for JSON action blocks in the response
 */
export function parseActionFromResponse(response: string): WizardAction | null {
  // Try to extract JSON action block
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const actionData = JSON.parse(jsonMatch[1]);
      if (actionData.action && actionData.target) {
        return {
          type: actionData.action as WizardActionType,
          target: actionData.target,
          value: actionData.value,
          message: actionData.message,
        };
      }
    } catch (e) {
      console.warn("Failed to parse action JSON:", e);
    }
  }

  // Try to find action in plain text (fallback)
  const lowerResponse = response.toLowerCase();
  
  // Check for navigation intent
  if (lowerResponse.includes("next step") || lowerResponse.includes("move to step")) {
    const stepMatch = response.match(/step\s*(\d+)/i);
    const stepNumber = stepMatch ? parseInt(stepMatch[1]) : null;
    if (stepNumber !== null) {
      return {
        type: "NAVIGATE_STEP",
        target: "step",
        value: stepNumber.toString(),
        message: response,
      };
    }
    return {
      type: "NAVIGATE_STEP",
      target: "next",
      message: response,
    };
  }

  // Check for button click intent
  if (lowerResponse.includes("click") || lowerResponse.includes("press") || lowerResponse.includes("select")) {
    // Try to identify which button
    if (lowerResponse.includes("next")) {
      return {
        type: "CLICK_BUTTON",
        target: "next",
        message: response,
      };
    }
    if (lowerResponse.includes("save") || lowerResponse.includes("save and continue")) {
      return {
        type: "CLICK_BUTTON",
        target: "save",
        message: response,
      };
    }
    if (lowerResponse.includes("back") || lowerResponse.includes("previous")) {
      return {
        type: "CLICK_BUTTON",
        target: "back",
        message: response,
      };
    }
  }

  // Check for field fill intent
  if (lowerResponse.includes("enter") || lowerResponse.includes("fill") || lowerResponse.includes("set")) {
    // Try to extract field name and value
    const fieldMatch = response.match(/(?:enter|fill|set)\s+(\w+)\s+(?:to\s+)?["']?([^"']+)["']?/i);
    if (fieldMatch) {
      return {
        type: "FILL_FIELD",
        target: fieldMatch[1],
        value: fieldMatch[2],
        message: response,
      };
    }
  }

  // Check for integration modal opening intent
  if (lowerResponse.includes("open") && (lowerResponse.includes("integration") || lowerResponse.includes("crm") || lowerResponse.includes("scheduling") || lowerResponse.includes("connect"))) {
    // Try to extract integration type
    const integrationMatch = response.match(/(?:open|connect|setup|add)\s+(?:integration\s+)?(?:for\s+)?(?:the\s+)?(?:crm\s+)?(?:scheduling\s+)?(?:tool\s+)?["']?(\w+)["']?/i);
    if (integrationMatch) {
      return {
        type: "OPEN_INTEGRATION_MODAL",
        target: "integration_modal",
        value: integrationMatch[1],
        message: response,
      };
    }
    // Generic integration modal open
    if (lowerResponse.includes("integration modal") || lowerResponse.includes("connect integration")) {
      return {
        type: "OPEN_INTEGRATION_MODAL",
        target: "integration_modal",
        message: response,
      };
    }
  }

  return null;
}

/**
 * Validates an action before execution
 */
export function validateAction(action: WizardAction, availableActions: string[]): boolean {
  if (action.type === "NONE") {
    return false;
  }

  // Integration flow actions are always valid when on step 5
  const integrationFlowActions: WizardActionType[] = [
    "OPEN_INTEGRATION_MODAL",
    "ENABLE_FUNCTION",
    "SKIP_PHASE",
    "ADVANCE_FLOW",
  ];

  if (integrationFlowActions.includes(action.type)) {
    return true;
  }

  // Check if action target is available
  if (availableActions.length > 0 && !availableActions.includes(action.target)) {
    // Allow navigation and common actions even if not explicitly listed
    if (action.type === "NAVIGATE_STEP" || ["next", "back", "save"].includes(action.target)) {
      return true;
    }
    return false;
  }

  return true;
}

/**
 * Formats action for logging/debugging
 */
export function formatAction(action: WizardAction): string {
  return `${action.type}(${action.target}${action.value ? `, ${action.value}` : ""})`;
}
