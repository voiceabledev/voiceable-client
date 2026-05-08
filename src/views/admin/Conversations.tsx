"use client"

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { toast } = useToast();
  interface Conversation {
    conversation_id: string;
    agent_id?: string;
    agent_name?: string;
    user_id?: string;
    user_email?: string;
    status?: string;
    transcript?: unknown[];
    metadata?: {
      duration?: number;
      message_count?: number;
      total_cost?: number;
      [key: string]: unknown;
    };
    created_at?: string;
  }

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.conversations.list();
      if (response.data) {
        setConversations((response.data.data || []) as Conversation[]);
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
  }, [toast]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin")}
            className="flex-shrink-0 hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
              Admin - Conversations
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              View all conversations from the database
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
          ) : conversations.length === 0 ? (
            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
              <p className="text-muted-foreground">
                No conversations found.
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Conversation ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Agent</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Duration</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Cost</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversations.map((conv) => (
                      <tr key={conv.conversation_id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm font-mono">{conv.conversation_id}</td>
                        <td className="px-4 py-3 text-sm">{conv.agent_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">{conv.user_email || `User ${conv.user_id}`}</td>
                        <td className="px-4 py-3 text-sm">
                          {conv.metadata?.duration 
                            ? `${Math.floor(conv.metadata.duration / 60)}:${String(conv.metadata.duration % 60).padStart(2, '0')}`
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          ${conv.metadata?.total_cost?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {conv.created_at ? new Date(conv.created_at).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

