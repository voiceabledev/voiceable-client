import React, { createContext, useContext, ReactNode } from "react";

export interface WizardFormValues {
  name?: string;
  templateId?: string | null;
  provider?: string;
  model?: string;
  voiceIds?: string[];
  languages?: string[];
  selectedVoices?: any[];
  callOutcomes?: any[];
  escalationRules?: any[];
  scenarios?: any[];
  phases?: any[];
  voiceTone?: any[];
  integrationTools?: Record<string, any>;
  [key: string]: any;
}

export interface WizardContextValue {
  // Current state
  currentStep: number;
  formValues: WizardFormValues;
  isAgentCreated: boolean;
  agentId: string | null;
  agentSlug: string | null;
  
  // Available actions at current step
  availableActions: string[];
  
  // Navigation functions
  navigateToStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  
  // Form update functions
  updateFormValue: (key: string, value: any) => void;
  updateFormValues: (values: Partial<WizardFormValues>) => void;
  
  // Action execution functions (for agent to use)
  clickButton: (buttonId: string) => Promise<void>;
  fillField: (fieldId: string, value: any) => Promise<void>;
  selectOption: (fieldId: string, value: any) => Promise<void>;
  openIntegrationModal: (integrationType: string) => Promise<void>;
  openWorkflowModal: (initialData?: { toolChain?: any[]; name?: string; description?: string }) => Promise<void>;
  
  // Step-specific data
  getStepName: (step: number) => string;
  getAvailableActionsForStep: (step: number) => string[];
}

const WizardContext = createContext<WizardContextValue | null>(null);

export interface WizardContextProviderProps {
  children: ReactNode;
  value: WizardContextValue;
}

export function WizardContextProvider({ children, value }: WizardContextProviderProps) {
  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizardContext(): WizardContextValue {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizardContext must be used within WizardContextProvider");
  }
  return context;
}
