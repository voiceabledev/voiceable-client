import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  ArrowLeft,
  Loader2,
  Search,
  Plug,
  ExternalLink,
  CheckCircle,
  XCircle,
  Phone,
  Code,
  Webhook,
  FileText,
  ChevronDown,
} from "lucide-react";
import { adminApi, AdminIntegration, AdminAgent } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import ConversationsTab from "@/components/assistants/ConversationsTab";

type IntegrationFilter = 'all' | 'agent' | 'user';

export default function AdminIntegrations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<AdminIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<IntegrationFilter>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 30,
    total: 0,
    total_pages: 1,
    has_more: false,
  });
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [agentDetails, setAgentDetails] = useState<AdminAgent | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const typeParam = filterType === 'all' ? undefined : filterType;
      const response = await adminApi.integrations.list({ 
        page, 
        per_page: 30,
        type: typeParam
      });
      if (response.data) {
        setIntegrations(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error) {
      console.error("Error fetching integrations:", error);
      toast({
        title: "Error",
        description: "Failed to load integrations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset to first page when filter changes
  }, [filterType]);

  useEffect(() => {
    fetchIntegrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterType]);

  const filteredIntegrations = integrations.filter(integration =>
    integration.integration_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    integration.user_id.toString().includes(searchTerm) ||
    integration.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    integration.agent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    integration.agent_id?.toString().includes(searchTerm)
  );

  const handleAgentClick = async (agentId: number) => {
    setSelectedAgentId(agentId);
    setDialogOpen(true);
    setLoadingAgent(true);
    
    try {
      const response = await adminApi.agents.show(agentId);
      if (response.data?.data) {
        setAgentDetails(response.data.data);
      } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
        // Fallback: if data is directly in response.data
        setAgentDetails(response.data as unknown as AdminAgent);
      }
    } catch (error) {
      console.error("Error fetching agent details:", error);
      toast({
        title: "Error",
        description: "Failed to load agent details.",
        variant: "destructive",
      });
    } finally {
      setLoadingAgent(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAgentId(null);
    setAgentDetails(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
            className="flex-shrink-0 hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
              Admin - Integrations
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              View all integrations
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <Tabs value={filterType} onValueChange={(value) => setFilterType(value as IntegrationFilter)}>
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="all" className="flex-1 md:flex-none">All</TabsTrigger>
                <TabsTrigger value="agent" className="flex-1 md:flex-none">Agent</TabsTrigger>
                <TabsTrigger value="user" className="flex-1 md:flex-none">User</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by type, user email, or agent name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIntegrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No integrations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIntegrations.map((integration) => (
                      <TableRow key={integration.id}>
                        <TableCell>
                          <Badge variant="outline">
                            <Plug className="h-3 w-3 mr-1" />
                            {integration.integration_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={integration.integration_category === 'agent' ? 'default' : 'secondary'}>
                            {integration.integration_category === 'agent' ? 'Agent' : 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell>{integration.user_email || `User #${integration.user_id}`}</TableCell>
                        <TableCell>
                          {integration.agent_name && integration.agent_id ? (
                            <Button
                              variant="link"
                              className="h-auto p-0 text-primary hover:underline"
                              onClick={() => handleAgentClick(integration.agent_id!)}
                            >
                              {integration.agent_name} (ID: {integration.agent_id})
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(integration.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.total_pages > 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
                Showing {((page - 1) * pagination.per_page) + 1} to {Math.min(page * pagination.per_page, pagination.total)} of {pagination.total} integrations
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                  disabled={page >= pagination.total_pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agent Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-[95vw] md:max-w-6xl h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Agent Details</DialogTitle>
            <DialogDescription>
              View agent information and conversations
            </DialogDescription>
          </DialogHeader>
          
          {loadingAgent ? (
            <div className="flex items-center justify-center py-12 flex-1">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : agentDetails ? (
            <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
              <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden min-h-0">
                <div className="overflow-x-auto mb-4">
                  <TabsList className="inline-flex min-w-full md:grid md:w-full md:grid-cols-5">
                    <TabsTrigger value="details" className="whitespace-nowrap">Details</TabsTrigger>
                    <TabsTrigger value="tools" className="whitespace-nowrap">Tools</TabsTrigger>
                    <TabsTrigger value="prompt" className="whitespace-nowrap">Prompt</TabsTrigger>
                    <TabsTrigger value="phone-numbers" className="whitespace-nowrap">Phone Numbers</TabsTrigger>
                    <TabsTrigger value="conversations" className="whitespace-nowrap">Conversations</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="details" className="flex-1 overflow-y-auto mt-0">
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                          <p className="text-base font-semibold">{agentDetails.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <div className="mt-1">
                            {agentDetails.published ? (
                              <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="h-3 w-3 mr-1" />
                                Unpublished
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">User</label>
                          <p className="text-base">{agentDetails.user_email || `User #${agentDetails.user_id}`}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">ElevenLabs Agent ID</label>
                          <p className="text-sm font-mono">{agentDetails.elevenlabs_agent_id || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Created</label>
                          <p className="text-base">{new Date(agentDetails.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Updated</label>
                          <p className="text-base">{new Date(agentDetails.updated_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tools" className="flex-1 overflow-y-auto mt-0">
                  <div className="space-y-6">
                    {/* Integration Tools */}
                    {agentDetails.integration_tools && Object.keys(agentDetails.integration_tools).length > 0 ? (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Plug className="h-5 w-5" />
                          Integration Tools
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(agentDetails.integration_tools).map(([type, config]) => (
                            <div key={type} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                                <Badge variant={config.enabled ? "default" : "secondary"}>
                                  {config.enabled ? "Enabled" : "Disabled"}
                                </Badge>
                              </div>
                              {config.enabled_tools && config.enabled_tools.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm text-muted-foreground mb-1">Enabled Tools:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {config.enabled_tools.map((tool) => (
                                      <Badge key={tool} variant="outline" className="text-xs">
                                        {tool}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Plug className="h-5 w-5" />
                          Integration Tools
                        </h3>
                        <p className="text-muted-foreground">No integration tools configured</p>
                      </div>
                    )}

                    {/* Webhook Tools */}
                    {agentDetails.webhook_tools && agentDetails.webhook_tools.length > 0 ? (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Webhook className="h-5 w-5" />
                          Webhook Tools ({agentDetails.webhook_tools.length})
                        </h3>
                        <div className="space-y-2">
                          {agentDetails.webhook_tools.map((tool: Record<string, unknown>, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="font-medium">{tool.name as string || `Webhook ${index + 1}`}</div>
                              {tool.url && (
                                <p className="text-sm text-muted-foreground mt-1 font-mono truncate">
                                  {(tool.url as string).substring(0, 60)}...
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Webhook className="h-5 w-5" />
                          Webhook Tools
                        </h3>
                        <p className="text-muted-foreground">No webhook tools configured</p>
                      </div>
                    )}

                    {/* Client Tools */}
                    {agentDetails.client_tools && agentDetails.client_tools.length > 0 ? (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          Client Tools ({agentDetails.client_tools.length})
                        </h3>
                        <div className="space-y-2">
                          {agentDetails.client_tools.map((tool: Record<string, unknown>, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="font-medium">{tool.name as string || `Client Tool ${index + 1}`}</div>
                              {tool.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {tool.description as string}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          Client Tools
                        </h3>
                        <p className="text-muted-foreground">No client tools configured</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="prompt" className="flex-1 overflow-y-auto mt-0">
                  {agentDetails.conversation_config ? (() => {
                    const config = agentDetails.conversation_config as Record<string, unknown>;
                    const templatePrompt = config.system_prompt_template as string | undefined;
                    const toolsPrompt = config.system_prompt_tools as string | undefined;
                    const behavioursPrompt = config.system_prompt_behaviours as string | undefined;
                    
                    const hasAnyPrompt = templatePrompt || toolsPrompt || behavioursPrompt;
                    
                    if (!hasAnyPrompt) {
                      return (
                        <div className="flex items-center justify-center py-12">
                          <p className="text-muted-foreground">No prompt configured</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            System Prompt Components
                          </h3>
                        </div>
                        
                        <div className="space-y-2">
                          {/* Template Prompt */}
                          {templatePrompt && (
                            <Collapsible defaultOpen={false}>
                              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                                <span className="text-sm font-medium">Template System Prompt</span>
                                <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="bg-muted rounded-lg p-4 mt-2">
                                  <pre className="text-sm whitespace-pre-wrap font-mono overflow-x-auto max-h-96 overflow-y-auto">
                                    {templatePrompt}
                                  </pre>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                          
                          {/* Tools Prompt */}
                          {toolsPrompt && (
                            <Collapsible defaultOpen={false}>
                              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                                <span className="text-sm font-medium">Tools System Prompt</span>
                                <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="bg-muted rounded-lg p-4 mt-2">
                                  <pre className="text-sm whitespace-pre-wrap font-mono overflow-x-auto max-h-96 overflow-y-auto">
                                    {toolsPrompt}
                                  </pre>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                          
                          {/* Behaviours Prompt */}
                          {behavioursPrompt && (
                            <Collapsible defaultOpen={false}>
                              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                                <span className="text-sm font-medium">Behaviours System Prompt</span>
                                <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="bg-muted rounded-lg p-4 mt-2">
                                  <pre className="text-sm whitespace-pre-wrap font-mono overflow-x-auto max-h-96 overflow-y-auto">
                                    {behavioursPrompt}
                                  </pre>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-muted-foreground">No conversation config available</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="phone-numbers" className="flex-1 overflow-y-auto mt-0">
                  {agentDetails.phone_numbers && agentDetails.phone_numbers.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Phone className="h-5 w-5" />
                          Phone Numbers ({agentDetails.phone_numbers.length})
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {agentDetails.phone_numbers.map((phone) => (
                          <div key={phone.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium font-mono text-lg">{phone.phone_number}</p>
                                <p className="text-sm text-muted-foreground capitalize mt-1">{phone.provider}</p>
                              </div>
                              {phone.elevenlabs_phone_number_id && (
                                <div className="ml-4">
                                  <p className="text-xs text-muted-foreground mb-1">ElevenLabs ID</p>
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {phone.elevenlabs_phone_number_id.substring(0, 12)}...
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-muted-foreground">No phone numbers associated with this agent</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="conversations" className="flex-1 overflow-hidden mt-0 min-h-0">
                  {agentDetails.elevenlabs_agent_id ? (
                    <div className="h-full overflow-hidden">
                      <ConversationsTab 
                        assistantName={agentDetails.name} 
                        agentId={agentDetails.elevenlabs_agent_id} 
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12 h-full">
                      <p className="text-muted-foreground">
                        No ElevenLabs Agent ID available. Conversations cannot be loaded.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 flex-1">
              <p className="text-muted-foreground">No agent details available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

