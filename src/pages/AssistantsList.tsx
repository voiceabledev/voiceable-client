import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  ExternalLink,
  Edit,
  Trash2
} from "lucide-react";

const assistants = [
  {
    id: "9ca34dcd-1ccb-4f13-bc65-60d31553eab0",
    name: "Alex",
    providers: ["deepgram", "openai", "vapi"],
  },
  {
    id: "2f24e154-b38d-487e-b4a1-123456789abc",
    name: "Riley",
    providers: ["deepgram", "openai", "vapi"],
  },
];

export default function AssistantsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssistants = assistants.filter((assistant) =>
    assistant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssistantClick = (assistantId: string) => {
    navigate(`/assistants/${assistantId}`);
  };

  const handleCreateAssistant = () => {
    navigate("/assistants/new");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-semibold">Assistants</h1>
            <a 
              href="https://contextor.mintlify.app/" 
              className="text-muted-foreground hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex items-center gap-1 text-xs">
                Docs <ExternalLink className="h-3 w-3" />
              </span>
            </a>
          </div>
          <Button 
            variant="default" 
            className="gap-2"
            onClick={handleCreateAssistant}
          >
            <Plus className="h-4 w-4" />
            Create Assistant
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search Assistants" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border"
          />
        </div>
      </div>

      {/* Assistants List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filteredAssistants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No assistants found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search query" : "Get started by creating your first assistant"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateAssistant}>
                <Plus className="h-4 w-4 mr-2" />
                Create Assistant
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssistants.map((assistant) => (
              <div
                key={assistant.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleAssistantClick(assistant.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{assistant.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {assistant.providers.join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssistantClick(assistant.id);
                      }}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete logic here
                        console.log("Delete assistant:", assistant.id);
                      }}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{assistant.id.slice(0, 20)}...</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

