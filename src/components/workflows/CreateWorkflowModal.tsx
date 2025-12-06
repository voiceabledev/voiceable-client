import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const templates = [
  {
    id: "lead-qualification",
    name: "Lead Qualification Agent",
    description: "Let callers schedule, reschedule, or cancel meetings using natural voice prompts — no manual coordination required.",
  },
  {
    id: "appointment-scheduler",
    name: "Appointment Scheduler",
    description: "Automatically remind customers about outstanding payments and collect responses — efficiently and politely.",
  },
  {
    id: "customer-satisfaction",
    name: "Customer Satisfaction Survey",
    description: "Answer questions, resolve issues, and route requests — a 24/7 voice-based support experience.",
  },
  {
    id: "blank",
    name: "Blank",
    description: "Start with a blank canvas",
  },
];

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkflowModal({ isOpen, onClose }: CreateWorkflowModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("lead-qualification");
  const [workflowName, setWorkflowName] = useState("");
  const navigate = useNavigate();

  const handleCreate = () => {
    onClose();
    navigate("/workflows/new");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create Workflow</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-colors",
                selectedTemplate === template.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              <h3 className={cn(
                "font-medium mb-1",
                selectedTemplate === template.id ? "text-primary" : "text-foreground"
              )}>
                {template.name}
              </h3>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <Label htmlFor="workflow-name" className="text-sm text-muted-foreground">
            Workflow name
          </Label>
          <Input
            id="workflow-name"
            placeholder="Enter workflow name"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="mt-2 bg-secondary/50"
          />
        </div>

        <Button 
          variant="accent" 
          className="w-full mt-6"
          onClick={handleCreate}
        >
          Use template
        </Button>
      </DialogContent>
    </Dialog>
  );
}
