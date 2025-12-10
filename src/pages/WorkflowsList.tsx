import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Loader2,
  GitBranch,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Workflow {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export default function WorkflowsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // TODO: Replace with actual API call when backend is ready
  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      // For now, use mock data
      // const response = await workflowsApi.list();
      // if (response.data && Array.isArray(response.data)) {
      //   setWorkflows(response.data);
      // } else {
      //   setWorkflows([]);
      // }
      
      // Mock data for now
      setWorkflows([
        {
          id: "1",
          name: "Customer Support Workflow",
          description: "Handles technical and billing support routing",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workflows';
      setWorkflows([]);
      toast({
        title: 'Error loading workflows',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const filteredWorkflows = workflows.filter((workflow) =>
    (workflow.name || 'Unnamed Workflow').toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWorkflowClick = (workflowId: string) => {
    navigate(`/workflows/${workflowId}`);
  };

  const handleCreateWorkflow = () => {
    navigate("/workflows/new");
  };

  const handleDeleteWorkflow = async (workflow: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement delete API call
    // try {
    //   await workflowsApi.delete(workflow.id);
    //   setWorkflows(workflows.filter(w => w.id !== workflow.id));
    //   toast({ title: "Workflow deleted" });
    // } catch (err) {
    //   toast({
    //     title: "Error deleting workflow",
    //     description: err instanceof Error ? err.message : "Failed to delete workflow",
    //     variant: "destructive",
    //   });
    // }
    
    // For now, just remove from local state
    setWorkflows(workflows.filter(w => w.id !== workflow.id));
    toast({ title: "Workflow deleted" });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Workflows</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage automated workflows for your assistants
            </p>
          </div>
          <Button 
            onClick={handleCreateWorkflow}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search Workflows" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border"
          />
        </div>
      </div>

      {/* Workflows List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading workflows...</p>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <GitBranch className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search query" : "Get started by creating your first workflow"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateWorkflow}>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleWorkflowClick(workflow.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <GitBranch className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">{workflow.name || 'Unnamed Workflow'}</h3>
                    </div>
                    {workflow.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {workflow.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWorkflowClick(workflow.id);
                      }}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => handleDeleteWorkflow(workflow, e)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {workflow.updated_at && (
                  <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                    Updated {new Date(workflow.updated_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
