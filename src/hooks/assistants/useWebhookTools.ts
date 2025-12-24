import { useState, useCallback } from "react";
import type { WebhookTool } from "@/types/assistant";
import { getEmptyWebhookTool } from "@/utils/assistantHelpers";

export function useWebhookTools() {
  const [webhookTools, setWebhookTools] = useState<WebhookTool[]>([]);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [editingWebhookTool, setEditingWebhookTool] = useState<WebhookTool | null>(null);
  const [webhookForm, setWebhookForm] = useState<WebhookTool>(getEmptyWebhookTool());

  const openWebhookModal = useCallback((tool?: WebhookTool) => {
    if (tool) {
      setEditingWebhookTool(tool);
      setWebhookForm(tool);
    } else {
      setEditingWebhookTool(null);
      setWebhookForm(getEmptyWebhookTool());
    }
    setShowWebhookModal(true);
  }, []);

  const closeWebhookModal = useCallback(() => {
    setShowWebhookModal(false);
    setEditingWebhookTool(null);
    setWebhookForm(getEmptyWebhookTool());
  }, []);

  const saveWebhookTool = useCallback(() => {
    if (editingWebhookTool) {
      setWebhookTools((prev) =>
        prev.map((t) => (t.id === editingWebhookTool.id ? webhookForm : t))
      );
    } else {
      setWebhookTools((prev) => [...prev, { ...webhookForm, id: crypto.randomUUID() }]);
    }
    closeWebhookModal();
  }, [editingWebhookTool, webhookForm, closeWebhookModal]);

  const deleteWebhookTool = useCallback((id: string) => {
    setWebhookTools((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    webhookTools,
    setWebhookTools,
    showWebhookModal,
    setShowWebhookModal,
    editingWebhookTool,
    webhookForm,
    setWebhookForm,
    openWebhookModal,
    closeWebhookModal,
    saveWebhookTool,
    deleteWebhookTool,
  };
}
