import { useEffect } from "react";
import { agentTemplatesApi, adminApi } from "@/lib/api";
import type { BehaviourConfig } from "@/components/assistants/SectionEditors";
import { templateDefaults } from "../constants";
import type { CreateAgentWizardProps } from "../types";

interface UseTemplateDefaultsProps {
  templateId?: string;
  firstMessage?: string;
  setTemplate: (template: any) => void;
  setSelectedProvider: (provider: string) => void;
  setSelectedModel: (model: string) => void;
  setScenarios: (scenarios: any[]) => void;
  setPhases: (phases: any[]) => void;
  setVoiceTone: (voiceTone: any[]) => void;
  setFirstMessage: (message: string) => void;
  setBehaviourConfig: (config: BehaviourConfig | undefined) => void;
  setCurrentBehaviourId: (id: number | undefined) => void;
  setCurrentBehaviourName: (name: string | undefined) => void;
  currentBehaviourId?: number;
}

export function useTemplateDefaults({
  templateId,
  firstMessage: initialFirstMessage,
  setTemplate,
  setSelectedProvider,
  setSelectedModel,
  setScenarios,
  setPhases,
  setVoiceTone,
  setFirstMessage,
  setBehaviourConfig,
  setCurrentBehaviourId,
  setCurrentBehaviourName,
  currentBehaviourId,
}: UseTemplateDefaultsProps) {
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        if (templateId) {
          // Load template and its associated behaviour
          const response = await agentTemplatesApi.list();
          if (response.data) {
            const templates = Array.isArray(response.data) ? response.data : [];
            const foundTemplate = templates.find(t => t.id.toString() === templateId);
            if (foundTemplate) {
              setTemplate(foundTemplate);
              
              // Pre-populate from template defaults if available
              const templateDefault = templateDefaults[foundTemplate.title];
              if (templateDefault) {
                // Pre-populate model
                setSelectedProvider(templateDefault.provider);
                setSelectedModel(templateDefault.model);
                
                // Pre-populate scenarios, phases, and voice tone with fresh IDs
                const generateId = () => `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                setScenarios(templateDefault.scenarios.map(s => ({ ...s, id: generateId() })));
                setPhases(templateDefault.phases.map(p => ({ ...p, id: generateId() })));
                setVoiceTone(templateDefault.voiceTone.map(v => ({ ...v, id: generateId() })));
                
                // Pre-populate first message if template has one and initialData doesn't override it
                if (foundTemplate.first_message && !initialFirstMessage) {
                  setFirstMessage(foundTemplate.first_message);
                }
              } else if (foundTemplate.first_message && !initialFirstMessage) {
                // Even without template defaults, pre-populate first message
                setFirstMessage(foundTemplate.first_message);
              }
              
              // If template has a behaviour ID, load the full behaviour with sections
              if (foundTemplate.agent_behaviour_id && foundTemplate.agent_behaviour) {
                // Check if sections are already loaded in the response
                if (foundTemplate.agent_behaviour.sections && foundTemplate.agent_behaviour.sections.length > 0) {
                  // Sections are included, use them
                  const config: BehaviourConfig = {};
                  foundTemplate.agent_behaviour.sections.forEach(section => {
                    if (section.section_type === "scenarios") {
                      config.scenarios = {
                        label: section.label,
                        description: section.description,
                        add_label: section.add_label,
                        title_placeholder: section.title_placeholder,
                        description_placeholder: section.description_placeholder,
                        notes_placeholder: section.notes_placeholder,
                        notes_label: section.notes_label,
                      };
                    } else if (section.section_type === "phases") {
                      config.phases = {
                        label: section.label,
                        description: section.description,
                        add_label: section.add_label,
                        title_placeholder: section.title_placeholder,
                        description_placeholder: section.description_placeholder,
                        notes_placeholder: section.notes_placeholder,
                        notes_label: section.notes_label,
                      };
                    } else if (section.section_type === "voice_tone") {
                      config.voiceTone = {
                        label: section.label,
                        description: section.description,
                        add_label: section.add_label,
                        title_placeholder: section.title_placeholder,
                        description_placeholder: section.description_placeholder,
                        notes_placeholder: section.notes_placeholder,
                        notes_label: section.notes_label,
                      };
                    }
                  });
                  setBehaviourConfig(config);
                  setCurrentBehaviourId(foundTemplate.agent_behaviour.id);
                  setCurrentBehaviourName(foundTemplate.agent_behaviour.name);
                } else {
                  // Sections not included, fetch the full behaviour
                  try {
                    const behaviourResponse = await adminApi.behaviours.show(foundTemplate.agent_behaviour_id);
                    if (behaviourResponse.data) {
                      const behaviour = behaviourResponse.data;
                      if (behaviour.sections && behaviour.sections.length > 0) {
                        const config: BehaviourConfig = {};
                        behaviour.sections.forEach((section) => {
                          if (section.section_type === "scenarios") {
                            config.scenarios = {
                              label: section.label,
                              description: section.description,
                              add_label: section.add_label,
                              title_placeholder: section.title_placeholder,
                              description_placeholder: section.description_placeholder,
                              notes_placeholder: section.notes_placeholder,
                              notes_label: section.notes_label,
                            };
                          } else if (section.section_type === "phases") {
                            config.phases = {
                              label: section.label,
                              description: section.description,
                              add_label: section.add_label,
                              title_placeholder: section.title_placeholder,
                              description_placeholder: section.description_placeholder,
                              notes_placeholder: section.notes_placeholder,
                              notes_label: section.notes_label,
                            };
                          } else if (section.section_type === "voice_tone") {
                            config.voiceTone = {
                              label: section.label,
                              description: section.description,
                              add_label: section.add_label,
                              title_placeholder: section.title_placeholder,
                              description_placeholder: section.description_placeholder,
                              notes_placeholder: section.notes_placeholder,
                              notes_label: section.notes_label,
                            };
                          }
                        });
                        setBehaviourConfig(config);
                        setCurrentBehaviourId(behaviour.id);
                        setCurrentBehaviourName(behaviour.name);
                      }
                    }
                  } catch (error) {
                    console.error("Error loading template behaviour:", error);
                    // Fallback to default behaviour
                    await loadDefaultBehaviour();
                  }
                }
              } else {
                // Template has no behaviour, load default
                await loadDefaultBehaviour();
              }
            }
          }
        } else {
          // No template selected, load default behaviour
          await loadDefaultBehaviour();
        }
      } catch (error) {
        console.error("Error loading template/behaviour:", error);
        // Fallback to default behaviour on error
        await loadDefaultBehaviour();
      }
    };

    const loadDefaultBehaviour = async () => {
      try {
        const response = await adminApi.behaviours.list();
        if (response.data) {
          const behaviours = Array.isArray(response.data) ? response.data : [];
          const defaultBehaviour = behaviours.find(b => b.name === "Default");
          if (defaultBehaviour?.sections) {
            const config: BehaviourConfig = {};
            defaultBehaviour.sections.forEach(section => {
              if (section.section_type === "scenarios") {
                config.scenarios = {
                  label: section.label,
                  description: section.description,
                  add_label: section.add_label,
                  title_placeholder: section.title_placeholder,
                  description_placeholder: section.description_placeholder,
                  notes_placeholder: section.notes_placeholder,
                  notes_label: section.notes_label,
                };
              } else if (section.section_type === "phases") {
                config.phases = {
                  label: section.label,
                  description: section.description,
                  add_label: section.add_label,
                  title_placeholder: section.title_placeholder,
                  description_placeholder: section.description_placeholder,
                  notes_placeholder: section.notes_placeholder,
                  notes_label: section.notes_label,
                };
              } else if (section.section_type === "voice_tone") {
                config.voiceTone = {
                  label: section.label,
                  description: section.description,
                  add_label: section.add_label,
                  title_placeholder: section.title_placeholder,
                  description_placeholder: section.description_placeholder,
                  notes_placeholder: section.notes_placeholder,
                  notes_label: section.notes_label,
                };
              }
            });
            setBehaviourConfig(config);
            setCurrentBehaviourId(defaultBehaviour.id);
            setCurrentBehaviourName(defaultBehaviour.name);
            // Set template to null to indicate no template selected
            setTemplate(null);
          }
        }
      } catch (error) {
        console.error("Error loading default behaviour:", error);
      }
    };
    
    loadTemplate();
  }, [templateId, initialFirstMessage, setTemplate, setSelectedProvider, setSelectedModel, setScenarios, setPhases, setVoiceTone, setFirstMessage, setBehaviourConfig, setCurrentBehaviourId, setCurrentBehaviourName, currentBehaviourId]);
}
