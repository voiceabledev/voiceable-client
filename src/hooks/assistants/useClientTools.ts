import { useState, useCallback } from "react";
import type { ClientTool } from "@/types/assistant";
import { getEmptyClientTool } from "@/utils/assistantHelpers";

export function useClientTools() {
  const [clientTools, setClientTools] = useState<ClientTool[]>([]);
  const [showClientToolModal, setShowClientToolModal] = useState(false);
  const [editingClientTool, setEditingClientTool] = useState<ClientTool | null>(null);
  const [clientToolForm, setClientToolForm] = useState<ClientTool>(getEmptyClientTool());

  const openClientToolModal = useCallback((tool?: ClientTool) => {
    if (tool) {
      setEditingClientTool(tool);
      setClientToolForm(tool);
    } else {
      setEditingClientTool(null);
      setClientToolForm(getEmptyClientTool());
    }
    setShowClientToolModal(true);
  }, []);

  const closeClientToolModal = useCallback(() => {
    setShowClientToolModal(false);
    setEditingClientTool(null);
    setClientToolForm(getEmptyClientTool());
  }, []);

  const saveClientTool = useCallback(() => {
    if (editingClientTool) {
      setClientTools((prev) =>
        prev.map((t) => (t.id === editingClientTool.id ? clientToolForm : t))
      );
    } else {
      setClientTools((prev) => [...prev, { ...clientToolForm, id: crypto.randomUUID() }]);
    }
    closeClientToolModal();
  }, [editingClientTool, clientToolForm, closeClientToolModal]);

  const deleteClientTool = useCallback((id: string) => {
    setClientTools((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    clientTools,
    setClientTools,
    showClientToolModal,
    setShowClientToolModal,
    editingClientTool,
    clientToolForm,
    setClientToolForm,
    openClientToolModal,
    closeClientToolModal,
    saveClientTool,
    deleteClientTool,
  };
}
