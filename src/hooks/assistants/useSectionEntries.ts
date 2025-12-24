import { useState, useCallback, useMemo } from "react";
import type { SectionEntry, SectionType } from "@/types/assistant";
import { generateSectionEntryId, createSectionEntry } from "@/utils/assistantHelpers";

export function useSectionEntries() {
  const [cenarios, setCenarios] = useState<SectionEntry[]>([]);
  const [etapas, setEtapas] = useState<SectionEntry[]>([]);
  const [tomDeVoz, setTomDeVoz] = useState<SectionEntry[]>([]);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSectionType, setEditingSectionType] = useState<SectionType | null>(null);
  const [editingSectionEntry, setEditingSectionEntry] = useState<SectionEntry | null>(null);
  const [sectionForm, setSectionForm] = useState<Omit<SectionEntry, "id">>({
    title: "",
    description: "",
    notes: "",
  });
  const [showPromptPreviewModal, setShowPromptPreviewModal] = useState(false);

  const getSectionSetter = useCallback((type: SectionType) => {
    switch (type) {
      case "scenarios": return setCenarios;
      case "phases": return setEtapas;
      case "voiceTone": return setTomDeVoz;
    }
  }, []);

  const openSectionModal = useCallback((type: SectionType, entry?: SectionEntry) => {
    setEditingSectionType(type);
    if (entry) {
      setEditingSectionEntry(entry);
      setSectionForm({
        title: entry.title,
        description: entry.description,
        notes: entry.notes || "",
      });
    } else {
      setEditingSectionEntry(null);
      setSectionForm({ title: "", description: "", notes: "" });
    }
    setShowSectionModal(true);
  }, []);

  const closeSectionModal = useCallback(() => {
    setShowSectionModal(false);
    setEditingSectionType(null);
    setEditingSectionEntry(null);
    setSectionForm({ title: "", description: "", notes: "" });
  }, []);

  const saveSectionEntry = useCallback(() => {
    if (!editingSectionType) return;
    const setter = getSectionSetter(editingSectionType);
    
    if (editingSectionEntry) {
      setter((prev) =>
        prev.map((e) => (e.id === editingSectionEntry.id ? { ...sectionForm, id: e.id } : e))
      );
    } else {
      setter((prev) => [...prev, { ...sectionForm, id: generateSectionEntryId() }]);
    }
    closeSectionModal();
  }, [editingSectionType, editingSectionEntry, sectionForm, getSectionSetter, closeSectionModal]);

  const removeSectionEntryById = useCallback((type: SectionType, id: string) => {
    const setter = getSectionSetter(type);
    setter((prev) => prev.filter((e) => e.id !== id));
  }, [getSectionSetter]);

  const addSectionEntry = useCallback((type: SectionType) => {
    openSectionModal(type);
  }, [openSectionModal]);

  const derivedSystemPrompt = useMemo(() => {
    const sections = [
      ...cenarios.map(c => `## ${c.title}\n${c.description}`),
      ...etapas.map(e => `## ${e.title}\n${e.description}`),
      ...tomDeVoz.map(t => `## ${t.title}\n${t.description}`),
    ];
    return sections.join("\n\n");
  }, [cenarios, etapas, tomDeVoz]);

  return {
    cenarios,
    setCenarios,
    etapas,
    setEtapas,
    tomDeVoz,
    setTomDeVoz,
    showSectionModal,
    setShowSectionModal,
    editingSectionType,
    editingSectionEntry,
    sectionForm,
    setSectionForm,
    showPromptPreviewModal,
    setShowPromptPreviewModal,
    openSectionModal,
    closeSectionModal,
    saveSectionEntry,
    removeSectionEntryById,
    addSectionEntry,
    derivedSystemPrompt,
  };
}
