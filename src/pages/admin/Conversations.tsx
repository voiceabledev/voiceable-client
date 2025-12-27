import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader2,
  Search,
  MessageSquare,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminConversations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await adminApi.conversations.list();
      if (response.data) {
        setConversations(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

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
              Admin - Conversations
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              View all conversations (stored in ElevenLabs)
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
              <p className="text-muted-foreground">
                Conversations are stored in ElevenLabs. Use the conversations endpoint with admin access to view them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

