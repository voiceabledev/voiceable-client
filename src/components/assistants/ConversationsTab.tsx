import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { conversationsApi, Conversation } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ConversationDisplay extends Conversation {
  date: string;
  duration: string;
  messages: number;
  status: "Successful" | "Failed" | "In Progress";
  summary: string;
  userId: string;
}

interface ConversationsTabProps {
  assistantName: string;
  agentId?: string;
}

export default function ConversationsTab({ assistantName, agentId }: ConversationsTabProps) {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationDisplay[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDisplay | null>(null);
  const [conversationDetails, setConversationDetails] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "transcription">("overview");
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchConversations = useCallback(async () => {
    if (!agentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await conversationsApi.list({ 
        agent_id: agentId,
        summary_mode: 'include' 
      });
      
      if (response.data) {
        const formattedConversations: ConversationDisplay[] = response.data.map(conv => ({
          ...conv,
          date: conv.date || 'N/A',
          duration: conv.duration || '0:00',
          messages: conv.messages || 0,
          status: conv.call_successful === 'success' ? 'Successful' : 
                  conv.call_successful === 'failure' ? 'Failed' : 
                  'In Progress' as "Successful" | "Failed" | "In Progress",
          summary: conv.summary || 'No summary available',
          userId: conv.user_id || 'Unknown User',
        }));
        setConversations(formattedConversations);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conversations';
      toast({
        title: 'Error loading conversations',
        description: errorMessage,
        variant: 'destructive',
      });
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [agentId, toast]);

  const fetchConversationDetails = useCallback(async (conversationId: string) => {
    try {
      const response = await conversationsApi.get(conversationId);
      if (response.data) {
        setConversationDetails(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conversation details';
      toast({
        title: 'Error loading conversation details',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch conversation details when one is selected
  useEffect(() => {
    if (selectedConversation?.id) {
      fetchConversationDetails(selectedConversation.id);
    }
  }, [selectedConversation?.id, fetchConversationDetails]);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.agent_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary/50 border-border"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Duration</th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Messages</th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Loading conversations...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredConversations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p className="text-sm">{searchQuery ? 'No conversations found matching your search.' : agentId ? 'No conversations found for this agent.' : 'Please select an agent to view conversations.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredConversations.map((conv) => (
                  <tr
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "border-b border-border cursor-pointer transition-colors",
                      selectedConversation?.id === conv.id
                        ? "bg-sidebar-accent"
                        : "hover:bg-secondary/30"
                    )}
                  >
                    <td className="px-4 py-3 text-sm">{conv.date || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{conv.duration || '0:00'}</td>
                    <td className="px-4 py-3 text-sm">{conv.messages || 0}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          conv.status === "Successful" &&
                            "bg-success/10 text-success border-success/20",
                          conv.status === "Failed" &&
                            "bg-destructive/10 text-destructive border-destructive/20",
                          conv.status === "In Progress" &&
                            "bg-warning/10 text-warning border-warning/20"
                        )}
                      >
                        {conv.status || 'Unknown'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedConversation && (
        <div className="w-[400px] border-l border-border flex flex-col bg-card">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold">
                Conversation with {assistantName}
              </h2>
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {selectedConversation.id}
            </p>
          </div>

          {/* Audio Player */}
          <div className="p-4 border-b border-border">
            <div className="bg-secondary/30 rounded-lg p-3">
              {/* Waveform */}
              <div className="h-10 flex items-center gap-0.5 mb-3">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-muted-foreground/30 rounded-full"
                    style={{ height: `${Math.random() * 100}%` }}
                  />
                ))}
              </div>
              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </button>
                <span className="text-xs">1.0x</span>
                <button className="text-muted-foreground hover:text-foreground">
                  <RotateCcw className="h-3 w-3" />
                </button>
                <button className="text-muted-foreground hover:text-foreground">
                  <RotateCw className="h-3 w-3" />
                </button>
                <span className="text-xs text-muted-foreground ml-auto">
                  0:00 / {selectedConversation.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 pt-3">
            <div className="flex gap-4 border-b border-border">
              {(["overview", "transcription"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveDetailTab(tab)}
                  className={cn(
                    "pb-2 text-sm font-medium capitalize transition-colors",
                    activeDetailTab === tab
                      ? "text-foreground border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-4">
            {activeDetailTab === "overview" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Call status</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      selectedConversation.status === "Successful" &&
                        "bg-success/10 text-success border-success/20",
                      selectedConversation.status === "Failed" &&
                        "bg-destructive/10 text-destructive border-destructive/20"
                    )}
                  >
                    {selectedConversation.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">User ID</span>
                  <span className="text-sm font-mono text-muted-foreground">
                    {selectedConversation.userId}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm">{selectedConversation.duration}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Messages</span>
                  <span className="text-sm">{selectedConversation.messages}</span>
                </div>
              </div>
            )}

            {activeDetailTab === "transcription" && (
              <div className="space-y-3">
                {conversationDetails?.transcript && conversationDetails.transcript.length > 0 ? (
                  conversationDetails.transcript.map((turn, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-3 rounded-lg",
                        turn.role === 'user' ? "bg-secondary/30" : "bg-primary/10"
                      )}
                    >
                      <p className={cn(
                        "text-xs mb-1",
                        turn.role === 'user' ? "text-muted-foreground" : "text-primary"
                      )}>
                        {turn.role === 'user' ? 'User' : assistantName}
                        {turn.time_in_call_secs !== undefined && (
                          <span className="ml-2 text-muted-foreground">
                            [{Math.floor(turn.time_in_call_secs)}s]
                          </span>
                        )}
                      </p>
                      <p className="text-sm">{turn.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No transcript available</p>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}