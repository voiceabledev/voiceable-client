import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Plus, 
  Code,
  Phone,
  Save,
  ChevronDown,
  Copy,
  ExternalLink,
  Pencil,
  Mic,
  Braces,
  Eye,
  Lock,
  Undo,
  Redo,
  ArrowUpDown,
  ArrowLeftRight,
  ZoomOut,
  ZoomIn,
  MousePointer2,
  Hand
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddNodeModal } from "@/components/workflows/AddNodeModal";
import { NodeConfigPanel } from "@/components/workflows/NodeConfigPanel";

export interface WorkflowNode {
  id: string;
  type: "start" | "conversation" | "api-request" | "transfer-call" | "end-call" | "tool";
  name: string;
  prompt?: string;
  message?: string;
  x: number;
  y: number;
  extracting?: string[];
  cost?: string;
  latency?: string;
}

const initialNodes: WorkflowNode[] = [
  {
    id: "start",
    type: "start",
    name: "start",
    prompt: "You are Riley, appointment scheduling assistant for Wellness Partners health clinic. Start with: 'Thank you for calling Wellness Partners. This is Riley, your scheduling assistant. How may I help you today?' Listen for scheduling, rescheduling, canceling, or general questions.",
    x: 500,
    y: 100,
    cost: "$0.09/min",
    latency: "1.1s"
  },
  {
    id: "customer_type",
    type: "conversation",
    name: "customer_type",
    prompt: "Ask: 'Are you a new patient to Wellness Partners, or have you visited us before?' This helps me provide the right assistance for your appointment.",
    extracting: ["{{customer...}}"],
    x: 200,
    y: 400,
    cost: "$0.09/min",
    latency: "1.1s"
  },
  {
    id: "reschedule_cancel",
    type: "conversation",
    name: "reschedule_cancel",
    prompt: "Ask: 'I'll help you with that. Can you provide your name and date of birth so I can locate your appointment?' Determine if they want to reschedule or cancel.",
    extracting: ["{{patient...}}", "{{date_of...}}", "{{action_t...}}"],
    x: 650,
    y: 400,
    cost: "$0.09/min",
    latency: "1.1s"
  },
  {
    id: "general_info",
    type: "conversation",
    name: "general_info",
    prompt: "Provide clinic information. Hours: Monday-Friday 8am-5pm, Saturday 9am-12pm. We accept most insurance plans. For specific coverage questions, contact your insurance directly. Ask if they need anything else or want to schedule an appointment.",
    extracting: ["{{next_act...}}"],
    x: 1100,
    y: 400,
    cost: "$0.08/min",
    latency: "1.1s"
  }
];

const connectionLabels = [
  { from: "start", to: "customer_type", label: "User wanted to schedule a new appointment" },
  { from: "start", to: "reschedule_cancel", label: "User wanted to reschedule or cancel an appointment" },
  { from: "start", to: "general_info", label: "User had questions about clinic info, hours, or se..." },
  { from: "customer_type", to: "new_appointment", label: "User type determined, ready to proceed with appin..." },
  { from: "reschedule_cancel", to: "reschedule", label: "User wated to reschedule appointment" },
  { from: "reschedule_cancel", to: "cancel", label: "User wanted to cancel appointment" }
];

export default function WorkflowEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleNodeClick = (node: WorkflowNode) => {
    setSelectedNode(node);
  };

  const handleAddNode = (type: WorkflowNode["type"]) => {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type,
      name: type === "conversation" ? "new_conversation" : type,
      x: 400,
      y: 300,
      cost: "$0.09/min",
      latency: "1.1s"
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
    setIsAddNodeOpen(false);
    setHasChanges(true);
  };

  const getNodeColor = (type: WorkflowNode["type"]) => {
    switch (type) {
      case "start":
        return "bg-primary border-primary";
      case "conversation":
        return "bg-sidebar border-sidebar-border";
      case "end-call":
        return "bg-destructive/20 border-destructive";
      case "transfer-call":
        return "bg-success/20 border-success";
      case "tool":
      case "api-request":
        return "bg-purple-500/20 border-purple-500";
      default:
        return "bg-card border-border";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/workflows")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold">Appointment Scheduler</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>46357f59-ba6c-4b4c-b6e4-06f2c92462b0</span>
              <button className="hover:text-foreground">
                <Copy className="h-3 w-3" />
              </button>
              <button className="hover:text-foreground">
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/20 text-warning text-sm">
              <div className="w-2 h-2 rounded-full bg-warning" />
              Unsaved changes
            </div>
          )}
          <Button variant="outline" size="sm">
            <Code className="h-4 w-4" />
          </Button>
          <Button variant="accent" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Call
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          <Button variant="subtle" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-52 border-r border-border p-4 space-y-3 flex-shrink-0">
          <Button 
            variant="accent" 
            className="w-full justify-start"
            onClick={() => setIsAddNodeOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add a Node
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <Pencil className="h-4 w-4 mr-2" />
            Global Prompt
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <Mic className="h-4 w-4 mr-2" />
            Global Voice
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <Braces className="h-4 w-4 mr-2" />
            Variables
          </Button>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-[#0a0a0a]">
          {/* Grid pattern */}
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />

          {/* Connection Lines (simplified) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Start to branches */}
            <path 
              d="M 600 200 L 600 280 L 300 280 L 300 400" 
              stroke="hsl(var(--primary))" 
              strokeWidth="2" 
              fill="none"
              strokeDasharray="4 4"
            />
            <path 
              d="M 600 200 L 600 280 L 750 280 L 750 400" 
              stroke="hsl(var(--primary))" 
              strokeWidth="2" 
              fill="none"
              strokeDasharray="4 4"
            />
            <path 
              d="M 600 200 L 600 280 L 1200 280 L 1200 400" 
              stroke="hsl(var(--primary))" 
              strokeWidth="2" 
              fill="none"
              strokeDasharray="4 4"
            />
          </svg>

          {/* Connection Labels */}
          <div className="absolute" style={{ left: 350, top: 340 }}>
            <div className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs whitespace-nowrap">
              User wanted to schedule a new appointment
            </div>
          </div>
          <div className="absolute" style={{ left: 620, top: 340 }}>
            <div className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs whitespace-nowrap">
              User wanted to reschedule or cancel an appointment
            </div>
          </div>
          <div className="absolute" style={{ left: 950, top: 340 }}>
            <div className="px-3 py-1.5 rounded-full bg-warning text-warning-foreground text-xs whitespace-nowrap">
              User had questions about clinic info, hours, or se...
            </div>
          </div>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={cn(
                "absolute cursor-pointer transition-all rounded-lg border-2 p-3 min-w-[200px] max-w-[280px]",
                getNodeColor(node.type),
                selectedNode?.id === node.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
              style={{ left: node.x, top: node.y }}
              onClick={() => handleNodeClick(node)}
            >
              {/* Node Header */}
              <div className="flex items-center justify-between mb-2">
                {node.type === "start" && (
                  <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                    Start Node
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{node.name}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <button className="hover:text-foreground p-0.5">
                    <Undo className="h-3 w-3" />
                  </button>
                  <button className="hover:text-foreground p-0.5">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Node Content */}
              {node.prompt && (
                <div className="text-xs text-muted-foreground mb-2">
                  <span className="text-foreground/70">Prompt:</span>
                  <p className="mt-0.5 line-clamp-4">{node.prompt}</p>
                </div>
              )}

              {/* Extracting Variables */}
              {node.extracting && node.extracting.length > 0 && (
                <div className="text-xs mb-2">
                  <span className="text-muted-foreground">Extracting ({node.extracting.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {node.extracting.map((v, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-[10px]">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/50">
                <span>Cost: <span className="text-primary">{node.cost}</span> →</span>
                <span>Latency: <span className="text-primary">{node.latency}</span> →</span>
              </div>

              {/* Connection Points */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background" />
            </div>
          ))}

          {/* Bottom Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-card border border-border">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Lock className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Redo className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MousePointer2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-secondary">
              <Hand className="h-4 w-4" />
            </Button>
          </div>

          {/* Keyboard Shortcut Hint */}
          <div className="absolute bottom-6 left-6 flex items-center gap-2 text-muted-foreground text-xs">
            <kbd className="px-2 py-1 rounded bg-secondary border border-border">⌘</kbd>
            <kbd className="px-2 py-1 rounded bg-secondary border border-border">≡</kbd>
          </div>
        </div>

        {/* Right Panel - Node Config */}
        {selectedNode && (
          <NodeConfigPanel 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)}
            onUpdate={(updated) => {
              setNodes(nodes.map(n => n.id === updated.id ? updated : n));
              setSelectedNode(updated);
              setHasChanges(true);
            }}
          />
        )}
      </div>

      <AddNodeModal 
        isOpen={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        onSelect={handleAddNode}
      />
    </div>
  );
}
