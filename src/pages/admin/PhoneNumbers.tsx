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
  Phone,
} from "lucide-react";
import { adminApi, AdminPhoneNumber } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminPhoneNumbers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phoneNumbers, setPhoneNumbers] = useState<AdminPhoneNumber[]>([]);
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

  const fetchPhoneNumbers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.phoneNumbers.list({ page, per_page: 30 });
      if (response.data) {
        setPhoneNumbers(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
      toast({
        title: "Error",
        description: "Failed to load phone numbers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhoneNumbers();
  }, [page]);

  const filteredPhoneNumbers = phoneNumbers.filter(pn =>
    pn.phone_number.includes(searchTerm) ||
    pn.user_id.toString().includes(searchTerm)
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
              Admin - Phone Numbers
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              View all phone numbers across all users
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
                placeholder="Search by phone number or user ID..."
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
                    <TableHead>Phone Number</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Agent ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPhoneNumbers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No phone numbers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPhoneNumbers.map((pn) => (
                      <TableRow key={pn.id}>
                        <TableCell className="font-medium">{pn.phone_number}</TableCell>
                        <TableCell>{pn.user_id}</TableCell>
                        <TableCell>{pn.agent_id || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{pn.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(pn.created_at).toLocaleDateString()}
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
                Showing {((page - 1) * pagination.per_page) + 1} to {Math.min(page * pagination.per_page, pagination.total)} of {pagination.total} phone numbers
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

