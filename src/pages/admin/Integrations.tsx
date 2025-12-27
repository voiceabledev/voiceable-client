import { useState, useEffect } from "react";
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
  Plug,
} from "lucide-react";
import { adminApi, AdminIntegration } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminIntegrations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<AdminIntegration[]>([]);
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

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const response = await adminApi.integrations.list({ page, per_page: 30 });
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
    fetchIntegrations();
  }, [page]);

  const filteredIntegrations = integrations.filter(integration =>
    integration.integration_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    integration.user_id.toString().includes(searchTerm)
  );

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
              View all user integrations
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by type or user ID..."
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIntegrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
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
                        <TableCell>{integration.user_id}</TableCell>
                        <TableCell>
                          {new Date(integration.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
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
    </div>
  );
}

