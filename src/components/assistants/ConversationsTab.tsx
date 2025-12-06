import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  date: string;
  duration: string;
  messages: number;
  status: "Successful" | "Failed" | "In Progress";
  summary: string;
  userId: string;
}

interface ConversationsTabProps {
  assistantName: string;
}

const mockConversations: Conversation[] = [
  {
    id: "conv_001abc",
    date: "Dec 5, 2025, 2:15 PM",
    duration: "1:45",
    messages: 8,
    status: "Successful",
    summary: "User asked about account settings and password reset. The assistant guided them through the process successfully.",
    userId: "user_xyz123",
  },
  {
    id: "conv_002def",
    date: "Dec 4, 2025, 10:30 AM",
    duration: "0:32",
    messages: 4,
    status: "Successful",
    summary: "Quick inquiry about business hours and location.",
    userId: "user_abc456",
  },
  {
    id: "conv_003ghi",
    date: "Dec 3, 2025, 4:50 PM",
    duration: "3:12",
    messages: 15,
    status: "Failed",
    summary: "Complex technical support request. Call dropped due to connection issues.",
    userId: "user_def789",
  },
];

export default function ConversationsTab({ assistantName }: ConversationsTabProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "transcription" | "client">("overview");
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.id.toLowerCase().includes(searchQuery.toLowerCase())
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
              {filteredConversations.map((conv) => (
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
                  <td className="px-4 py-3 text-sm">{conv.date}</td>
                  <td className="px-4 py-3 text-sm">{conv.duration}</td>
                  <td className="px-4 py-3 text-sm">{conv.messages}</td>
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
                      {conv.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>No conversations found</p>
            </div>
          )}
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
              {(["overview", "transcription", "client"] as const).map((tab) => (
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
                  {tab === "client" ? "Client data" : tab}
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
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-xs text-muted-foreground mb-1">User</p>
                  <p className="text-sm">Hi, I need help with my account.</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <p className="text-xs text-primary mb-1">{assistantName}</p>
                  <p className="text-sm">
                    Hello! I'd be happy to help you with your account. What seems to be the issue?
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-xs text-muted-foreground mb-1">User</p>
                  <p className="text-sm">I forgot my password and need to reset it.</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <p className="text-xs text-primary mb-1">{assistantName}</p>
                  <p className="text-sm">
                    No problem! I can guide you through the password reset process. First, could you
                    please confirm the email address associated with your account?
                  </p>
                </div>
              </div>
            )}

            {activeDetailTab === "client" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">User ID</span>
                  <span className="text-sm font-mono">{selectedConversation.userId}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Session ID</span>
                  <span className="text-sm font-mono">{selectedConversation.id}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm">{selectedConversation.date}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}