import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  Settings,
} from "lucide-react";
import { adminApi, AgentBehaviour, AgentBehaviourSection } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SECTION_TYPES = [
  { value: "scenarios", label: "Scenarios" },
  { value: "phases", label: "Phases" },
  { value: "voice_tone", label: "Voice Tone" },
] as const;

export default function AdminBehaviours() {
  const { toast } = useToast();
  const [behaviours, setBehaviours] = useState<AgentBehaviour[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sectionsDialogOpen, setSectionsDialogOpen] = useState(false);
  const [editingBehaviour, setEditingBehaviour] = useState<AgentBehaviour | null>(null);
  const [editingSectionsFor, setEditingSectionsFor] = useState<AgentBehaviour | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true,
    position: 0,
  });
  const [sections, setSections] = useState<Omit<AgentBehaviourSection, "id">[]>([]);

  const fetchBehaviours = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.behaviours.list();
      if (response.data) {
        setBehaviours(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching behaviours:", error);
      toast({
        title: "Error",
        description: "Failed to load behaviours.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBehaviours();
  }, [fetchBehaviours]);

  const handleCreate = () => {
    setEditingBehaviour(null);
    setFormData({
      name: "",
      description: "",
      active: true,
      position: behaviours.length,
    });
    setSections([]);
    setDialogOpen(true);
  };

  const handleEdit = (behaviour: AgentBehaviour) => {
    setEditingBehaviour(behaviour);
    setFormData({
      name: behaviour.name,
      description: behaviour.description || "",
      active: behaviour.active ?? true,
      position: behaviour.position || 0,
    });
    setSections(
      (behaviour.sections || []).map((s) => ({
        section_type: s.section_type,
        label: s.label,
        description: s.description || "",
        add_label: s.add_label || "",
        title_placeholder: s.title_placeholder || "",
        description_placeholder: s.description_placeholder || "",
        notes_placeholder: s.notes_placeholder || "",
        notes_label: s.notes_label || "",
        position: s.position || 0,
      }))
    );
    setDialogOpen(true);
  };

  const handleEditSections = (behaviour: AgentBehaviour) => {
    setEditingSectionsFor(behaviour);
    setSections(
      (behaviour.sections || []).map((s) => ({
        section_type: s.section_type,
        label: s.label,
        description: s.description || "",
        add_label: s.add_label || "",
        title_placeholder: s.title_placeholder || "",
        description_placeholder: s.description_placeholder || "",
        notes_placeholder: s.notes_placeholder || "",
        notes_label: s.notes_label || "",
        position: s.position || 0,
      }))
    );
    setSectionsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this behaviour?")) {
      return;
    }

    try {
      await adminApi.behaviours.destroy(id);
      toast({
        title: "Success",
        description: "Behaviour deleted successfully.",
      });
      fetchBehaviours();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete behaviour.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (behaviour: AgentBehaviour) => {
    try {
      await adminApi.behaviours.update(behaviour.id, {
        active: !behaviour.active,
      });
      toast({
        title: "Success",
        description: `Behaviour ${!behaviour.active ? "activated" : "deactivated"} successfully.`,
      });
      fetchBehaviours();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update behaviour.",
        variant: "destructive",
      });
    }
  };

  const handleMovePosition = async (behaviour: AgentBehaviour, direction: "up" | "down") => {
    const currentIndex = behaviours.findIndex((b) => b.id === behaviour.id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= behaviours.length) return;

    const targetBehaviour = behaviours[newIndex];
    const newPosition = targetBehaviour.position || 0;

    try {
      await adminApi.behaviours.update(behaviour.id, {
        position: newPosition,
      });
      fetchBehaviours();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update behaviour position.",
        variant: "destructive",
      });
    }
  };

  const handleAddSection = () => {
    const existingTypes = sections.map((s) => s.section_type);
    const availableType = SECTION_TYPES.find((t) => !existingTypes.includes(t.value));
    if (!availableType) {
      toast({
        title: "Error",
        description: "All section types are already added.",
        variant: "destructive",
      });
      return;
    }

    setSections([
      ...sections,
      {
        section_type: availableType.value,
        label: "",
        description: "",
        add_label: "",
        title_placeholder: "",
        description_placeholder: "",
        notes_placeholder: "",
        notes_label: "",
        position: sections.length,
      },
    ]);
  };

  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleUpdateSection = (index: number, updates: Partial<Omit<AgentBehaviourSection, "id">>) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], ...updates };
    setSections(updated);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Name is required.",
        variant: "destructive",
      });
      return;
    }

    // Validate sections
    for (const section of sections) {
      if (!section.label) {
        toast({
          title: "Error",
          description: "All sections must have a label.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        sections: sections,
      };

      if (editingBehaviour) {
        await adminApi.behaviours.update(editingBehaviour.id, payload);
        toast({
          title: "Success",
          description: "Behaviour updated successfully.",
        });
      } else {
        await adminApi.behaviours.create(payload);
        toast({
          title: "Success",
          description: "Behaviour created successfully.",
        });
      }
      setDialogOpen(false);
      fetchBehaviours();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save behaviour.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSections = async () => {
    if (!editingSectionsFor) return;

    // Validate sections
    for (const section of sections) {
      if (!section.label) {
        toast({
          title: "Error",
          description: "All sections must have a label.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      await adminApi.behaviours.update(editingSectionsFor.id, {
        sections: sections,
      });
      toast({
        title: "Success",
        description: "Sections updated successfully.",
      });
      setSectionsDialogOpen(false);
      fetchBehaviours();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save sections.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-semibold">Behaviours</h1>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Behaviour
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : behaviours.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground mb-4">No behaviours found.</p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Behaviour
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Position</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead className="w-20">Active</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {behaviours.map((behaviour, index) => (
                <TableRow key={behaviour.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMovePosition(behaviour, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMovePosition(behaviour, "down")}
                        disabled={index === behaviours.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{behaviour.name}</TableCell>
                  <TableCell className="max-w-md truncate">{behaviour.description || "-"}</TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {behaviour.sections?.length || 0} section(s)
                    </span>
                  </TableCell>
                  <TableCell>
                    {behaviour.active ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleActive(behaviour)}
                        title={behaviour.active ? "Deactivate" : "Activate"}
                      >
                        {behaviour.active ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditSections(behaviour)}
                        title="Edit Sections"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(behaviour)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(behaviour.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create/Edit Behaviour Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBehaviour ? "Edit Behaviour" : "Create Behaviour"}</DialogTitle>
            <DialogDescription>
              {editingBehaviour ? "Update the behaviour details." : "Create a new agent behaviour."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Behaviour Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Behaviour description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>Sections</Label>
                <Button variant="outline" size="sm" onClick={handleAddSection} disabled={sections.length >= 3}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>

              {sections.map((section, index) => {
                const sectionType = SECTION_TYPES.find((t) => t.value === section.section_type);
                return (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">
                        {sectionType?.label || section.section_type}
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSection(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Label *</Label>
                      <Input
                        value={section.label}
                        onChange={(e) =>
                          handleUpdateSection(index, { label: e.target.value })
                        }
                        placeholder="Section label"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={section.description}
                        onChange={(e) =>
                          handleUpdateSection(index, { description: e.target.value })
                        }
                        placeholder="Section description"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Add Label</Label>
                        <Input
                          value={section.add_label}
                          onChange={(e) =>
                            handleUpdateSection(index, { add_label: e.target.value })
                          }
                          placeholder="Add button label"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Title Placeholder</Label>
                        <Input
                          value={section.title_placeholder}
                          onChange={(e) =>
                            handleUpdateSection(index, { title_placeholder: e.target.value })
                          }
                          placeholder="Title placeholder"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description Placeholder</Label>
                      <Input
                        value={section.description_placeholder}
                        onChange={(e) =>
                          handleUpdateSection(index, { description_placeholder: e.target.value })
                        }
                        placeholder="Description placeholder"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Notes Placeholder</Label>
                        <Input
                          value={section.notes_placeholder}
                          onChange={(e) =>
                            handleUpdateSection(index, { notes_placeholder: e.target.value })
                          }
                          placeholder="Notes placeholder"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Notes Label</Label>
                        <Input
                          value={section.notes_label}
                          onChange={(e) =>
                            handleUpdateSection(index, { notes_label: e.target.value })
                          }
                          placeholder="Notes label"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingBehaviour ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sections Dialog */}
      <Dialog open={sectionsDialogOpen} onOpenChange={setSectionsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sections: {editingSectionsFor?.name}</DialogTitle>
            <DialogDescription>Update the sections for this behaviour.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label>Sections</Label>
              <Button variant="outline" size="sm" onClick={handleAddSection} disabled={sections.length >= 3}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>

            {sections.map((section, index) => {
              const sectionType = SECTION_TYPES.find((t) => t.value === section.section_type);
              return (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">
                      {sectionType?.label || section.section_type}
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSection(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Label *</Label>
                    <Input
                      value={section.label}
                      onChange={(e) => handleUpdateSection(index, { label: e.target.value })}
                      placeholder="Section label"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={section.description}
                      onChange={(e) => handleUpdateSection(index, { description: e.target.value })}
                      placeholder="Section description"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Add Label</Label>
                      <Input
                        value={section.add_label}
                        onChange={(e) => handleUpdateSection(index, { add_label: e.target.value })}
                        placeholder="Add button label"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Title Placeholder</Label>
                      <Input
                        value={section.title_placeholder}
                        onChange={(e) =>
                          handleUpdateSection(index, { title_placeholder: e.target.value })
                        }
                        placeholder="Title placeholder"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description Placeholder</Label>
                    <Input
                      value={section.description_placeholder}
                      onChange={(e) =>
                        handleUpdateSection(index, { description_placeholder: e.target.value })
                      }
                      placeholder="Description placeholder"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Notes Placeholder</Label>
                      <Input
                        value={section.notes_placeholder}
                        onChange={(e) =>
                          handleUpdateSection(index, { notes_placeholder: e.target.value })
                        }
                        placeholder="Notes placeholder"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes Label</Label>
                      <Input
                        value={section.notes_label}
                        onChange={(e) => handleUpdateSection(index, { notes_label: e.target.value })}
                        placeholder="Notes label"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSectionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSections}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

