import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  TrendingDown,
  ArrowDown,
  ArrowUp,
  Play,
  Pause,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Get API base URL
function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const runtimeConfig = (window as any).__API_BASE_URL__;
    if (runtimeConfig) {
      return runtimeConfig;
    }
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api/v1';
    }
    return `${protocol}//${hostname}/api/v1`;
  }
  return 'http://localhost:3000/api/v1';
}

const API_BASE_URL = getApiBaseUrl();

interface CreditTransaction {
  id: number;
  conversation_id: string;
  amount_cents: number;
  amount_dollars: number;
  currency: string;
  transaction_type: 'deduction' | 'refund';
  status: string;
  total_cost_cents?: number;
  total_cost_dollars?: number;
  duration_seconds?: number;
  message_count?: number;
  llm_model_name?: string;
  voice_name?: string;
  user?: {
    id: number;
    email: string;
  };
  agent?: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface SpendingSummary {
  total_deductions_cents: number;
  total_deductions_dollars: number;
  total_refunds_cents: number;
  total_refunds_dollars: number;
  total_spending_cents: number;
  total_spending_dollars: number;
  net_balance_cents: number;
  net_balance_dollars: number;
}

export default function AdminConversationSpending() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 30,
    total: 0,
    total_pages: 1,
    has_more: false,
  });
  const [playingConversationId, setPlayingConversationId] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await adminApi.creditTransactions.list({ page, per_page: 30 });
      if (response.data) {
        setTransactions(response.data.data || []);
        setPagination(response.data.pagination || pagination);
        setSummary(response.data.summary || null);
      }
    } catch (error) {
      console.error("Error fetching credit transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation spending.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.conversation_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.agent?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTransactionTypeBadge = (type: string) => {
    if (type === 'deduction') {
      return <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
        <ArrowDown className="h-3 w-3 mr-1" />
        Deduction
      </Badge>;
    } else {
      return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
        <ArrowUp className="h-3 w-3 mr-1" />
        Refund
      </Badge>;
    }
  };

  const handlePlayConversation = async (conversationId: string) => {
    // If already playing this conversation, pause it
    if (playingConversationId === conversationId && audioRef.current) {
      audioRef.current.pause();
      setPlayingConversationId(null);
      return;
    }

    // If playing a different conversation, stop it first
    if (audioRef.current && playingConversationId) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    setLoadingAudio(conversationId);
    
    try {
      const token = localStorage.getItem('auth_token');
      const url = `${API_BASE_URL}/conversations/${conversationId}/audio`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create or reuse audio element
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      audio.src = audioUrl;
      
      // Set up event listeners
      const handleEnded = () => {
        setPlayingConversationId(null);
        URL.revokeObjectURL(audioUrl);
      };

      const handleError = () => {
        setPlayingConversationId(null);
        setLoadingAudio(null);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: 'Playback error',
          description: 'Could not play conversation audio.',
          variant: 'destructive',
        });
      };

      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      await audio.play();
      setPlayingConversationId(conversationId);
      setLoadingAudio(null);
    } catch (error) {
      console.error('Error playing conversation:', error);
      setLoadingAudio(null);
      toast({
        title: 'Playback error',
        description: 'Could not play conversation audio. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
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
              Admin - Conversation Spending
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              View all conversation credit transactions and spending
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600">
                  ${(Number(summary.total_deductions_dollars) || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Refunds</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(Number(summary.total_refunds_dollars) || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Spending</p>
                <p className="text-2xl font-bold">
                  ${(Number(summary.total_spending_dollars) || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Net Balance</p>
                <p className={`text-2xl font-bold ${(Number(summary.net_balance_cents) || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(Number(summary.net_balance_dollars) || 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, conversation ID, or agent..."
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
                    <TableHead>User</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Audio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => {
                      const isPlaying = playingConversationId === transaction.conversation_id;
                      const isLoading = loadingAudio === transaction.conversation_id;
                      
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.user?.email || `User #${transaction.user?.id || 'N/A'}`}
                          </TableCell>
                          <TableCell>
                            {transaction.agent?.name || 'N/A'}
                          </TableCell>
                          <TableCell>{getTransactionTypeBadge(transaction.transaction_type)}</TableCell>
                          <TableCell>
                            ${transaction.amount_dollars !== undefined 
                              ? Number(transaction.amount_dollars).toFixed(3)
                              : (transaction.amount_cents / 100).toFixed(3)}
                          </TableCell>
                          <TableCell>
                            {transaction.total_cost_dollars !== undefined 
                              ? `$${Number(transaction.total_cost_dollars).toFixed(3)}`
                              : transaction.total_cost_cents !== undefined
                              ? `$${(transaction.total_cost_cents / 100).toFixed(3)}`
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {transaction.duration_seconds ? `${Math.round(transaction.duration_seconds)}s` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePlayConversation(transaction.conversation_id)}
                              disabled={isLoading}
                              className="h-8 w-8 p-0"
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
                Showing {((page - 1) * pagination.per_page) + 1} to {Math.min(page * pagination.per_page, pagination.total)} of {pagination.total} transactions
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
    </div>
  );
}

