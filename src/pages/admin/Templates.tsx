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
} from "lucide-react";
import { adminApi, AgentTemplate, AgentBehaviour } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Icon options for built-in icons
const iconOptions = [
  { value: "plus", label: "Plus" },
  { value: "heart", label: "Heart" },
  { value: "star", label: "Star" },
  { value: "calendar", label: "Calendar" },
  { value: "message-circle", label: "Message Circle" },
  { value: "target", label: "Target" },
  { value: "clipboard-list", label: "Clipboard List" },
];

export default function AdminTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [behaviours, setBehaviours] = useState<AgentBehaviour[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AgentTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    system_prompt: "",
    first_message: "",
    icon_name: "",
    icon_url: "",
    active: true,
    position: 0,
    agent_behaviour_id: undefined as number | undefined,
  });
  const [iconType, setIconType] = useState<"builtin" | "custom">("builtin");

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.templates.list();
      if (response.data) {
        setTemplates(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load templates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchBehaviours = useCallback(async () => {
    try {
      const response = await adminApi.behaviours.list();
      if (response.data) {
        setBehaviours(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching behaviours:", error);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchBehaviours();
  }, [fetchTemplates, fetchBehaviours]);

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      title: "",
      description: "",
      system_prompt: "",
      first_message: "",
      icon_name: "",
      icon_url: "",
      active: true,
      position: templates.length,
      agent_behaviour_id: undefined,
    });
    setIconType("builtin");
    setDialogOpen(true);
  };

  const handleEdit = (template: AgentTemplate) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      description: template.description,
      system_prompt: template.system_prompt || "",
      first_message: template.first_message || "",
      icon_name: template.icon_name || "",
      icon_url: template.icon_url || "",
      active: template.active ?? true,
      position: template.position || 0,
      agent_behaviour_id: template.agent_behaviour_id,
    });
    setIconType(template.icon_url ? "custom" : "builtin");
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      await adminApi.templates.destroy(id);
      toast({
        title: "Success",
        description: "Template deleted successfully.",
      });
      fetchTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (template: AgentTemplate) => {
    try {
      await adminApi.templates.update(template.id, {
        active: !template.active,
      });
      toast({
        title: "Success",
        description: `Template ${!template.active ? "activated" : "deactivated"} successfully.`,
      });
      fetchTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update template.",
        variant: "destructive",
      });
    }
  };

  const handleMovePosition = async (template: AgentTemplate, direction: "up" | "down") => {
    const currentIndex = templates.findIndex(t => t.id === template.id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= templates.length) return;

    const targetTemplate = templates[newIndex];
    const newPosition = targetTemplate.position || 0;

    try {
      await adminApi.templates.update(template.id, {
        position: newPosition,
      });
      fetchTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update template position.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast({
        title: "Error",
        description: "Title and description are required.",
        variant: "destructive",
      });
      return;
    }

    if (iconType === "builtin" && !formData.icon_name) {
      toast({
        title: "Error",
        description: "Please select an icon.",
        variant: "destructive",
      });
      return;
    }

    if (iconType === "custom" && !formData.icon_url) {
      toast({
        title: "Error",
        description: "Please provide an icon URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        icon_name: iconType === "builtin" ? formData.icon_name : "",
        icon_url: iconType === "custom" ? formData.icon_url : "",
      };

      if (editingTemplate) {
        await adminApi.templates.update(editingTemplate.id, payload);
        toast({
          title: "Success",
          description: "Template updated successfully.",
        });
      } else {
        await adminApi.templates.create(payload);
        toast({
          title: "Success",
          description: "Template created successfully.",
        });
      }
      setDialogOpen(false);
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save template.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-semibold">Templates</h1>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground mb-4">No templates found.</p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Position</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Behaviour</TableHead>
                <TableHead className="w-20">Active</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template, index) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMovePosition(template, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMovePosition(template, "down")}
                        disabled={index === templates.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{template.title}</TableCell>
                  <TableCell className="max-w-md truncate">{template.description}</TableCell>
                  <TableCell>
                    {template.icon_name ? (
                      <span className="text-xs text-muted-foreground">{template.icon_name}</span>
                    ) : template.icon_url ? (
                      <img src={template.icon_url} alt={template.title} className="h-6 w-6 object-contain" />
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {template.agent_behaviour?.name || "None"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {template.active ? (
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
                        onClick={() => handleToggleActive(template)}
                        title={template.active ? "Deactivate" : "Activate"}
                      >
                        {template.active ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(template)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(template.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>
              {editingTemplate ? "Update the template details." : "Create a new agent template."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Template Title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Template description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="system_prompt">System Prompt *</Label>
              <Textarea
                id="system_prompt"
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                placeholder="System prompt for the agent"
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_message">First Message *</Label>
              <Textarea
                id="first_message"
                value={formData.first_message}
                onChange={(e) => setFormData({ ...formData, first_message: e.target.value })}
                placeholder="First message the agent will say"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Icon Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={iconType === "builtin"}
                    onChange={() => setIconType("builtin")}
                  />
                  Built-in Icon
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={iconType === "custom"}
                    onChange={() => setIconType("custom")}
                  />
                  Custom URL
                </label>
              </div>
            </div>

            {iconType === "builtin" ? (
              <div className="space-y-2">
                <Label htmlFor="icon_name">Icon *</Label>
                <select
                  id="icon_name"
                  value={formData.icon_name}
                  onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select an icon</option>
                  {iconOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="icon_url">Icon URL *</Label>
                <Input
                  id="icon_url"
                  value={formData.icon_url}
                  onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                  placeholder="https://example.com/icon.png"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="agent_behaviour_id">Behaviour</Label>
              <select
                id="agent_behaviour_id"
                value={formData.agent_behaviour_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    agent_behaviour_id: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {behaviours.map((behaviour) => (
                  <option key={behaviour.id} value={behaviour.id}>
                    {behaviour.name}
                  </option>
                ))}
              </select>
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingTemplate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

