import type { AgentType } from "./agentTypeDetection";
import type { ToolInChain, ConditionalConfig } from "@/types/functions";

export interface InferredWorkflow {
  toolChain: ToolInChain[];
  name: string;
  description: string;
  triggerPhrases?: string[];
}

/**
 * Infers a workflow configuration from an agent type
 * Always includes SMS as the first tool for data collection
 */
export function inferWorkflowFromAgentType(
  agentType: AgentType,
  agentName: string
): InferredWorkflow {
  // Base SMS tool - always included first
  const smsTool: ToolInChain = {
    type: "twilio",
    role: "communication",
    method: "sms",
    config: {},
  };

  const toolChain: ToolInChain[] = [smsTool];
  let description = "";
  let triggerPhrases: string[] = [];

  switch (agentType) {
    case "customer_support":
      toolChain.push({
        type: "pipedrive",
        role: "crm",
        method: "search_persons",
        config: {},
      });
      // Add conditional: if person not found, create person
      const customerSupportCondition: ConditionalConfig = {
        expression: "result.length === 0",
        then: [
          {
            type: "pipedrive",
            role: "crm",
            method: "create_person",
            config: {},
          }
        ],
        else: []
      };
      toolChain.push({
        type: "condition",
        role: "control",
        method: "branch",
        config: customerSupportCondition,
      });
      toolChain.push({
        type: "pipedrive",
        role: "crm",
        method: "create_activity",
        config: {},
      });
      description = `Support workflow for ${agentName} that collects customer inquiries via SMS and creates support tickets in Pipedrive.`;
      triggerPhrases = ["support", "help", "issue", "problem", "customer service"];
      break;

    case "lead_generation":
      toolChain.push({
        type: "pipedrive",
        role: "crm",
        method: "search_persons",
        config: {},
      });
      // Add conditional: if person not found, create person
      const leadGenCondition: ConditionalConfig = {
        expression: "result.length === 0",
        then: [
          {
            type: "pipedrive",
            role: "crm",
            method: "create_person",
            config: {},
          }
        ],
        else: []
      };
      toolChain.push({
        type: "condition",
        role: "control",
        method: "branch",
        config: leadGenCondition,
      });
      toolChain.push({
        type: "pipedrive",
        role: "crm",
        method: "create_deal",
        config: {},
      });
      description = `Lead qualification workflow for ${agentName} that qualifies prospects via SMS and creates deals in Pipedrive.`;
      triggerPhrases = ["interested", "qualify", "lead", "prospect", "inquiry"];
      break;

    case "sales_calls":
      toolChain.push({
        type: "pipedrive",
        role: "crm",
        method: "search_persons",
        config: {},
      });
      // Add conditional: if person not found, create person
      const salesCallsCondition: ConditionalConfig = {
        expression: "result.length === 0",
        then: [
          {
            type: "pipedrive",
            role: "crm",
            method: "create_person",
            config: {},
          }
        ],
        else: []
      };
      toolChain.push({
        type: "condition",
        role: "control",
        method: "branch",
        config: salesCallsCondition,
      });
      toolChain.push({
        type: "pipedrive",
        role: "crm",
        method: "create_deal",
        config: {},
      });
      description = `Sales workflow for ${agentName} that handles sales conversations via SMS and creates deals in Pipedrive.`;
      triggerPhrases = ["sales", "buy", "purchase", "deal", "quote"];
      break;

    case "appointment_booking":
      // Note: Appointment booking workflows explicitly exclude CRM tools (e.g. Pipedrive, HubSpot)
      // to keep the workflow focused purely on scheduling.
      toolChain.push(
        {
          type: "calcom",
          role: "scheduling",
          method: "get_event_types",
          config: {},
        },
        {
          type: "calcom",
          role: "scheduling",
          method: "get_available_slots",
          config: {},
        },
        {
          type: "calcom",
          role: "scheduling",
          method: "create_booking",
          config: {},
        }
      );
      description = `Appointment booking workflow for ${agentName} that collects booking details via SMS, checks availability, and creates appointments in Cal.com.`;
      triggerPhrases = ["schedule", "book", "appointment", "meeting", "reserve"];
      break;

    case "product_information":
      toolChain.push({
        type: "search_knowledge_base",
        role: "knowledge",
        config: {}
      });

      description = `Product information workflow for ${agentName} that searches knowledge base to provide product information, specs, pricing, and availability.`;
      triggerPhrases = ["product", "information", "specs", "pricing", "availability", "inquiry", "what is", "tell me about"];
      break;

    case "technical_support":
      toolChain.push({
        type: "pipedrive",
        role: "crm",
        method: "search_persons",
        config: {},
      });
      // Add conditional: if person not found, create person
      const techSupportCondition: ConditionalConfig = {
        expression: "result.length === 0",
        then: [
          {
            type: "pipedrive",
            role: "crm",
            method: "create_person",
            config: {},
          }
        ],
        else: []
      };
      toolChain.push({
        type: "condition",
        role: "control",
        method: "branch",
        config: techSupportCondition,
      });
      toolChain.push({
        type: "pipedrive",
        role: "crm",
        method: "create_activity",
        config: {},
      });
      description = `Technical support workflow for ${agentName} that collects technical issues via SMS and creates support tickets in Pipedrive.`;
      triggerPhrases = ["technical", "troubleshoot", "bug", "error", "technical issue"];
      break;

    default:
      // Fallback: just SMS
      description = `Communication workflow for ${agentName} that handles inquiries via SMS.`;
      triggerPhrases = ["help", "question", "inquiry"];
  }

  // Generate workflow name
  const workflowName = `${agentName} Workflow`;

  return {
    toolChain,
    name: workflowName,
    description,
    triggerPhrases,
  };
}
