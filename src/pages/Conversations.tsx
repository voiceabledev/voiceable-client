import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  ChevronRight,
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  MoreHorizontal,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  date: string;
  agent: string;
  duration: string;
  messages: number;
  status: "Successful" | "Failed" | "In Progress";
  summary: string;
  userId: string;
  credits: {
    call: number;
    llm: number;
  };
  llmCost: string;
}

const conversations: Conversation[] = [
  {
    id: "conv_6501kbhxyve3f3htf1n31mkfdnv9",
    date: "Dec 3, 2025, 3:01 AM",
    agent: "Rosane Agent",
    duration: "0:13",
    messages: 3,
    status: "Successful",
    summary: "The user greeted the AI in Italian, asking how it was doing. The AI responded in Italian, explaining that as an AI, it doesn't have feelings.",
    userId: "leCia3tU7jgwP3ItTe2pHQppCXA2",
    credits: { call: 77, llm: 15 },
    llmCost: "$0.00697 / min",
  },
  {
    id: "conv_7602lchyzwf4g4iug2o42nlgenw0",
    date: "Dec 2, 2025, 11:45 PM",
    agent: "Alex Assistant",
    duration: "2:34",
    messages: 12,
    status: "Successful",
    summary: "User inquired about product pricing and availability. The assistant provided detailed information and helped schedule a follow-up call.",
    userId: "user_abc123xyz",
    credits: { call: 154, llm: 42 },
    llmCost: "$0.01245 / min",
  },
  {
    id: "conv_8703mdiazxg5h5jvh3p53omhfox1",
    date: "Dec 2, 2025, 9:22 AM",
    agent: "Riley Support",
    duration: "0:45",
    messages: 5,
    status: "Failed",
    summary: "Call was disconnected due to network issues before the conversation could complete.",
    userId: "user_def456abc",
    credits: { call: 23, llm: 8 },
    llmCost: "$0.00234 / min",
  },
];

const filterOptions = [
  "Date After",
  "Date Before",
  "Call status",
  "Criteria",
  "Data",
  "Duration",
  "Rating",
  "Comments",
  "Agent",
  "Tools",
  "User",
];

export default function Conversations() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "transcription" | "client">("overview");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold">Conversation history</h1>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            New
          </Badge>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            View new features
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 bg-secondary/50 border-border h-12"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-secondary/50 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <Plus className="h-3 w-3" />
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground">
                    Date
                    <ChevronRight className="h-3 w-3 rotate-90" />
                  </button>
                </th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Agent</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Duration</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Messages</th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Call status</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((conv) => (
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
                  <td className="px-6 py-4 text-sm">{conv.date}</td>
                  <td className="px-6 py-4 text-sm">{conv.agent}</td>
                  <td className="px-6 py-4 text-sm">{conv.duration}</td>
                  <td className="px-6 py-4 text-sm">{conv.messages}</td>
                  <td className="px-6 py-4">
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
        </div>

        {/* Detail Panel */}
        {selectedConversation && (
          <div className="w-[500px] border-l border-border flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">
                  Conversation with {selectedConversation.agent}
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

            {/* Audio Waveform */}
            <div className="p-4 border-b border-border">
              <div className="bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                    0:00
                  </span>
                </div>
                {/* Waveform placeholder */}
                <div className="h-12 flex items-center gap-0.5 mb-3">
                  {Array.from({ length: 80 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-muted-foreground/30 rounded-full"
                      style={{ height: `${Math.random() * 100}%` }}
                    />
                  ))}
                </div>
                {/* Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </button>
                  <span className="text-sm">1.0x</span>
                  <button className="text-muted-foreground hover:text-foreground">
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button className="text-muted-foreground hover:text-foreground">
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-muted-foreground ml-auto">
                    0:00 / {selectedConversation.duration}
                  </span>
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="mx-4 mt-4 p-3 rounded-lg bg-secondary/50 border border-border flex items-start gap-3">
              <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                You can now ensure your agent returns high quality responses to conversations like
                this one. Try Tests in the{" "}
                <span className="text-primary cursor-pointer">Transcription tab</span>.
              </p>
            </div>

            {/* Tabs */}
            <div className="px-4 mt-4">
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
                          "bg-success/10 text-success border-success/20"
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
                </div>
              )}

              {activeDetailTab === "transcription" && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-xs text-muted-foreground mb-1">User</p>
                    <p className="text-sm">Ciao, come stai?</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <p className="text-xs text-primary mb-1">Agent</p>
                    <p className="text-sm">
                      Ciao! Come AI, non ho sentimenti, ma sono qui per aiutarti. Come posso
                      assisterti oggi?
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
                </div>
              )}
            </div>

            {/* Metadata Sidebar */}
            <div className="border-t border-border p-4 bg-secondary/20">
              <h3 className="text-sm font-semibold mb-3">Metadata</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{selectedConversation.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connection duration</span>
                  <span>{selectedConversation.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credits (call)</span>
                  <span>{selectedConversation.credits.call}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credits (LLM)</span>
                  <span>{selectedConversation.credits.llm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LLM Cost</span>
                  <span>{selectedConversation.llmCost}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}