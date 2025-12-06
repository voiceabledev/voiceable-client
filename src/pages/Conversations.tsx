import { useState, useEffect } from "react";
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

const ConversationDetailPanel = ({
  selectedConversation,
  onClose,
  activeDetailTab,
  setActiveDetailTab,
  isPlaying,
  setIsPlaying,
}: {
  selectedConversation: Conversation;
  onClose: () => void;
  activeDetailTab: "overview" | "transcription" | "client";
  setActiveDetailTab: (tab: "overview" | "transcription" | "client") => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}) => (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="p-3 md:p-4 border-b border-border flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base md:text-lg font-semibold truncate">
          Conversation with {selectedConversation.agent}
        </h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground font-mono truncate">
        {selectedConversation.id}
      </p>
    </div>

    {/* Audio Waveform */}
    <div className="p-3 md:p-4 border-b border-border flex-shrink-0">
      <div className="bg-secondary/30 rounded-lg p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
            0:00
          </span>
        </div>
        {/* Waveform placeholder */}
        <div className="h-10 md:h-12 flex items-center gap-0.5 mb-2 md:mb-3 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-muted-foreground/30 rounded-full min-w-[2px]"
              style={{ height: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
        {/* Controls */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <Play className="h-4 w-4 md:h-5 md:w-5 ml-0.5" />
            )}
          </button>
          <span className="text-xs md:text-sm">1.0x</span>
          <button className="text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            <RotateCw className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          <span className="text-xs md:text-sm text-muted-foreground ml-auto">
            0:00 / {selectedConversation.duration}
          </span>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
        </div>
      </div>
    </div>

    {/* Info Banner */}
    <div className="mx-3 md:mx-4 mt-3 md:mt-4 p-2 md:p-3 rounded-lg bg-secondary/50 border border-border flex items-start gap-2 md:gap-3 flex-shrink-0">
      <Info className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      <p className="text-xs md:text-sm text-muted-foreground">
        You can now ensure your agent returns high quality responses to conversations like
        this one. Try Tests in the{" "}
        <span className="text-primary cursor-pointer">Transcription tab</span>.
      </p>
    </div>

    {/* Tabs */}
    <div className="px-3 md:px-4 mt-3 md:mt-4 flex-shrink-0">
      <div className="flex gap-2 md:gap-4 border-b border-border overflow-x-auto scrollbar-hide">
        {(["overview", "transcription", "client"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveDetailTab(tab)}
            className={cn(
              "pb-2 text-xs md:text-sm font-medium capitalize transition-colors flex-shrink-0",
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
    <div className="flex-1 overflow-auto p-3 md:p-4 min-h-0">
      {activeDetailTab === "overview" && (
        <div className="space-y-3 md:space-y-4 pb-4">
          <div>
            <h3 className="text-xs md:text-sm font-semibold mb-2">Summary</h3>
            <p className="text-xs md:text-sm text-muted-foreground whitespace-normal">
              {selectedConversation.summary}
            </p>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-xs md:text-sm text-muted-foreground">Call status</span>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                selectedConversation.status === "Successful" &&
                  "bg-success/10 text-success border-success/20"
              )}
            >
              {selectedConversation.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-xs md:text-sm text-muted-foreground">User ID</span>
            <span className="text-xs md:text-sm font-mono text-muted-foreground truncate ml-2">
              {selectedConversation.userId}
            </span>
          </div>

          {/* Metadata Section */}
          <div className="border-t border-border pt-3 md:pt-4 mt-3 md:mt-4">
            <h3 className="text-xs md:text-sm font-semibold mb-2 md:mb-3">Metadata</h3>
            <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="truncate ml-2">{selectedConversation.date}</span>
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

      {activeDetailTab === "transcription" && (
        <div className="space-y-3 md:space-y-4">
          <div className="p-2 md:p-3 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-1">User</p>
            <p className="text-xs md:text-sm">Ciao, come stai?</p>
          </div>
          <div className="p-2 md:p-3 rounded-lg bg-primary/10">
            <p className="text-xs text-primary mb-1">Agent</p>
            <p className="text-xs md:text-sm">
              Ciao! Come AI, non ho sentimenti, ma sono qui per aiutarti. Come posso
              assisterti oggi?
            </p>
          </div>
        </div>
      )}

      {activeDetailTab === "client" && (
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-xs md:text-sm text-muted-foreground">User ID</span>
            <span className="text-xs md:text-sm font-mono truncate ml-2">{selectedConversation.userId}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-xs md:text-sm text-muted-foreground">Session ID</span>
            <span className="text-xs md:text-sm font-mono truncate ml-2">{selectedConversation.id}</span>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default function Conversations() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "transcription" | "client">("overview");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // Show detail panel when conversation is selected on mobile
  useEffect(() => {
    if (selectedConversation) {
      setShowDetailPanel(true);
    }
  }, [selectedConversation]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold">Conversation history</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              New
            </Badge>
            <button className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground">
              View new features
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3 md:mb-4">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-9 md:pl-10 bg-secondary/50 border-border h-10 md:h-12 text-sm"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0 pb-2">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-md bg-secondary/50 text-xs md:text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors flex-shrink-0"
            >
              <Plus className="h-3 w-3" />
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex relative">
        {/* Table */}
        <div className={cn(
          "flex-1 overflow-auto",
          selectedConversation && "hidden md:block"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-foreground">
                      Date
                      <ChevronRight className="h-3 w-3 rotate-90" />
                    </button>
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Agent</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Duration</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Messages</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Call status</th>
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
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">{conv.date}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">{conv.agent}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">{conv.duration}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">{conv.messages}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
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
        </div>

        {/* Detail Panel */}
        {selectedConversation && (
          <>
            {/* Mobile: Bottom Sheet */}
            {showDetailPanel && (
              <>
                <div 
                  className="fixed inset-0 bg-black/50 z-40 md:hidden"
                  onClick={() => {
                    setShowDetailPanel(false);
                    setSelectedConversation(null);
                  }}
                />
                <div className="fixed inset-x-0 bottom-0 top-1/4 bg-card border-t border-border z-50 flex flex-col rounded-t-lg md:hidden overflow-hidden min-h-0">
                  <ConversationDetailPanel
                    selectedConversation={selectedConversation}
                    onClose={() => {
                      setShowDetailPanel(false);
                      setSelectedConversation(null);
                    }}
                    activeDetailTab={activeDetailTab}
                    setActiveDetailTab={setActiveDetailTab}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                  />
                </div>
              </>
            )}
            
            {/* Desktop: Side Panel */}
            <div className="hidden md:flex w-[500px] border-l border-border flex flex-col">
              <ConversationDetailPanel
                selectedConversation={selectedConversation}
                onClose={() => setSelectedConversation(null)}
                activeDetailTab={activeDetailTab}
                setActiveDetailTab={setActiveDetailTab}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
