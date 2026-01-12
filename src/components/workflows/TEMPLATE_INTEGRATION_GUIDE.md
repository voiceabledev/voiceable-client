# EditableWorkflow Template Integration Guide

This document explains how to integrate the new WorkflowTemplates and WorkflowTriggerEditor components into the existing EditableWorkflow component.

## Overview

The EditableWorkflow component already supports:
- Visual workflow representation
- Adding/removing tools
- Tool configuration
- Tool chain wizard

**New enhancements needed:**
1. Template selection button
2. Trigger editor integration
3. Template application logic

## Integration Steps

### 1. Add Template Selection Button

Add a "Use Template" button to the workflow header (before the tool chain visualization):

```tsx
import { WorkflowTemplates } from './WorkflowTemplates';

// Add state
const [showTemplateModal, setShowTemplateModal] = useState(false);
const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);

// Add button in the header section
<div className="mb-4 flex items-center justify-between">
  <h3 className="text-lg font-semibold">Workflow Tools</h3>
  <div className="flex gap-2">
    <Button
      variant="outline"
      onClick={() => setShowTemplateModal(true)}
      disabled={readOnly}
    >
      <Sparkles className="mr-2 h-4 w-4" />
      Use Template
    </Button>
    <Button
      variant="outline"
      onClick={handleConfigureAllTools}
      disabled={readOnly || sortedToolChain.length === 0}
    >
      Configure Tools
    </Button>
  </div>
</div>

// Add modal at the end of the component
<WorkflowTemplates
  open={showTemplateModal}
  onOpenChange={setShowTemplateModal}
  onSelectTemplate={handleSelectTemplate}
  onCreateCustom={() => setShowTemplateModal(false)}
  connectedIntegrations={connectedIntegrations}
/>
```

### 2. Handle Template Selection

Add handler to apply template to workflow:

```tsx
const handleSelectTemplate = (template: WorkflowTemplate) => {
  if (!onToolChainUpdate) return;

  // Apply template's tool chain
  onToolChainUpdate(template.toolChain);

  // Close template modal
  setShowTemplateModal(false);

  // Optionally open configuration wizard
  setShowToolChainWizard(true);
};
```

### 3. Add Trigger Editor (Optional Enhancement)

For custom workflows, add trigger configuration:

```tsx
import { WorkflowTriggerEditor } from './WorkflowTriggerEditor';

// Add state
const [workflowTriggers, setWorkflowTriggers] = useState<string[]>([]);

// Add section before or after the tool chain
<div className="mb-6">
  <WorkflowTriggerEditor
    triggers={workflowTriggers}
    onTriggersChange={setWorkflowTriggers}
    workflowName={agentFunction.workflow_name}
  />
</div>
```

### 4. Fetch Connected Integrations

Add effect to load user's connected integrations:

```tsx
import { integrationsApi } from '@/lib/api';

useEffect(() => {
  const loadConnectedIntegrations = async () => {
    try {
      const response = await integrationsApi.list();
      if (response.data) {
        const types = response.data.map((i: UserIntegration) => i.integration_type);
        setConnectedIntegrations(types);
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  loadConnectedIntegrations();
}, []);
```

## Component Hierarchy

```
EditableWorkflow
├── Header (with "Use Template" button)
├── WorkflowTriggerEditor (optional, for custom workflows)
├── Tool Chain Visualization
│   ├── Agent icon
│   ├── Tool cards (clickable)
│   └── Add tool buttons (+)
├── Workflow Description (auto-generated)
└── Modals
    ├── WorkflowTemplates (new)
    ├── ToolSelectionModal
    ├── ToolActionModal
    ├── ToolConfigurationModal
    └── ToolChainConfigurationWizard
```

## Props to Add (Optional)

If you want to expose triggers to parent components:

```tsx
type EditableWorkflowProps = {
  agentFunction: AgentFunction;
  agentId: string;
  onToolChainUpdate?: (toolChain: ToolInChain[]) => void;
  onConfigureCredentials?: (integrationType: string) => void;
  readOnly?: boolean;

  // New props
  triggers?: string[];
  onTriggersChange?: (triggers: string[]) => void;
  showTriggerEditor?: boolean;
};
```

## Backend Integration (Future)

To persist triggers, you'll need to:

1. Add `triggers` field to agent functions table
2. Update API endpoint to accept triggers
3. Store/retrieve triggers with workflow configuration

## Usage Example

```tsx
<EditableWorkflow
  agentFunction={workflow}
  agentId={agentId}
  onToolChainUpdate={handleToolChainUpdate}
  triggers={workflowTriggers}
  onTriggersChange={setWorkflowTriggers}
  showTriggerEditor={true}
/>
```

## Notes

- Templates are pre-configured with sensible defaults
- Users can customize templates after selection
- Trigger editor validates minimum 1 trigger
- Connected integrations filter available templates
- Templates show which integrations are required but not connected
