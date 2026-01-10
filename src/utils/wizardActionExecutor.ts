import { WizardAction, WizardActionType } from "./wizardActions";

/**
 * Executes wizard actions on DOM elements
 * Uses data attributes for reliable targeting
 */

export interface ActionExecutionResult {
  success: boolean;
  message: string;
  error?: Error;
}

/**
 * Clicks a button by its data attribute or ID
 */
export async function clickButton(buttonId: string): Promise<ActionExecutionResult> {
  try {
    // Try data attribute first
    let button = document.querySelector(`[data-wizard-action="${buttonId}"]`) as HTMLElement;
    
    // Fallback to ID
    if (!button) {
      button = document.getElementById(buttonId) as HTMLElement;
    }
    
    // Fallback to button with text content
    if (!button) {
      const buttons = Array.from(document.querySelectorAll("button"));
      button = buttons.find(btn => 
        btn.textContent?.toLowerCase().includes(buttonId.toLowerCase()) ||
        btn.getAttribute("aria-label")?.toLowerCase().includes(buttonId.toLowerCase())
      ) as HTMLElement;
    }

    if (!button) {
      return {
        success: false,
        message: `Button "${buttonId}" not found`,
        error: new Error(`Button not found: ${buttonId}`),
      };
    }

    // Check if button is disabled
    if (button.hasAttribute("disabled") || button.classList.contains("disabled")) {
      return {
        success: false,
        message: `Button "${buttonId}" is disabled`,
        error: new Error(`Button is disabled: ${buttonId}`),
      };
    }

    // Trigger click
    button.click();
    
    // Also trigger React synthetic event if needed
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    button.dispatchEvent(event);

    return {
      success: true,
      message: `Clicked button: ${buttonId}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to click button: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Fills a form field by its data attribute or name
 */
export async function fillField(
  fieldId: string,
  value: string | number | boolean
): Promise<ActionExecutionResult> {
  try {
    // Try data attribute first
    let field = document.querySelector(`[data-wizard-field="${fieldId}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    
    // Fallback to name attribute
    if (!field) {
      field = document.querySelector(`[name="${fieldId}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    }
    
    // Fallback to ID
    if (!field) {
      field = document.getElementById(fieldId) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    }

    if (!field) {
      return {
        success: false,
        message: `Field "${fieldId}" not found`,
        error: new Error(`Field not found: ${fieldId}`),
      };
    }

    // Set value based on field type
    if (field instanceof HTMLInputElement) {
      if (field.type === "checkbox" || field.type === "radio") {
        field.checked = Boolean(value);
      } else {
        field.value = String(value);
      }
    } else if (field instanceof HTMLTextAreaElement) {
      field.value = String(value);
    } else if (field instanceof HTMLSelectElement) {
      field.value = String(value);
    }

    // Trigger React onChange event
    const event = new Event("input", { bubbles: true, cancelable: true });
    field.dispatchEvent(event);
    
    // Also trigger change event
    const changeEvent = new Event("change", { bubbles: true, cancelable: true });
    field.dispatchEvent(changeEvent);

    return {
      success: true,
      message: `Filled field "${fieldId}" with value: ${value}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to fill field: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Selects an option in a dropdown or checkbox/radio group
 */
export async function selectOption(
  fieldId: string,
  value: string | number
): Promise<ActionExecutionResult> {
  try {
    // Try to find select element
    let select = document.querySelector(`[data-wizard-field="${fieldId}"]`) as HTMLSelectElement;
    
    if (!select) {
      select = document.querySelector(`select[name="${fieldId}"]`) as HTMLSelectElement;
    }
    
    if (!select) {
      select = document.getElementById(fieldId) as HTMLSelectElement;
    }

    if (select) {
      select.value = String(value);
      const event = new Event("change", { bubbles: true, cancelable: true });
      select.dispatchEvent(event);
      return {
        success: true,
        message: `Selected option "${value}" in "${fieldId}"`,
      };
    }

    // Try to find radio button or checkbox
    const radioOrCheckbox = document.querySelector(
      `input[type="radio"][name="${fieldId}"][value="${value}"], input[type="checkbox"][name="${fieldId}"][value="${value}"]`
    ) as HTMLInputElement;

    if (radioOrCheckbox) {
      radioOrCheckbox.checked = true;
      const event = new Event("change", { bubbles: true, cancelable: true });
      radioOrCheckbox.dispatchEvent(event);
      return {
        success: true,
        message: `Selected option "${value}" in "${fieldId}"`,
      };
    }

    // Try to find button with value
    const button = document.querySelector(
      `button[data-value="${value}"], [data-wizard-action="${fieldId}"][data-value="${value}"]`
    ) as HTMLElement;

    if (button) {
      button.click();
      return {
        success: true,
        message: `Selected option "${value}" via button`,
      };
    }

    return {
      success: false,
      message: `Option selector "${fieldId}" with value "${value}" not found`,
      error: new Error(`Option not found: ${fieldId} = ${value}`),
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to select option: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Executes a wizard action
 */
export async function executeAction(action: WizardAction): Promise<ActionExecutionResult> {
  switch (action.type) {
    case "CLICK_BUTTON":
      return await clickButton(action.target);
    
    case "FILL_FIELD":
      if (!action.value) {
        return {
          success: false,
          message: "No value provided for FILL_FIELD action",
          error: new Error("Missing value"),
        };
      }
      return await fillField(action.target, action.value);
    
    case "SELECT_OPTION":
      if (!action.value) {
        return {
          success: false,
          message: "No value provided for SELECT_OPTION action",
          error: new Error("Missing value"),
        };
      }
      return await selectOption(action.target, action.value);
    
    case "NAVIGATE_STEP":
      // Navigation is handled by context, not DOM manipulation
      return {
        success: false,
        message: "NAVIGATE_STEP should be handled by wizard context",
        error: new Error("Use context.navigateToStep instead"),
      };
    
    case "OPEN_INTEGRATION_MODAL":
      // Integration modal opening is handled by context, not DOM manipulation
      return {
        success: false,
        message: "OPEN_INTEGRATION_MODAL should be handled by wizard context",
        error: new Error("Use context.openIntegrationModal instead"),
      };
    
    case "NONE":
    default:
      return {
        success: false,
        message: "No action to execute",
        error: new Error("Invalid action type"),
      };
  }
}
