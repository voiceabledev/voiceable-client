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
  Shield,
  User as UserIcon,
  Building2,
  Edit,
  Trash2,
  Archive,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { adminApi, AdminUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminUsers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(100);
  const [users, setUsers] = useState<AdminUser[]>([]);
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
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | 'enterprise'>('user');
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDiscard, setUserToDiscard] = useState<AdminUser | null>(null);
  const [userToRestore, setUserToRestore] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [discarding, setDiscarding] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.users.list({ page, per_page: 30 });
      if (response.data) {
        setUsers(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setSelectedRole(user.role || 'user');
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;

    try {
      await adminApi.users.update(editingUser.id, { role: selectedRole });
      toast({
        title: "Success",
        description: "User role updated successfully.",
      });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const handleDiscardClick = (user: AdminUser) => {
    setUserToDiscard(user);
    setShowDiscardDialog(true);
  };

  const handleDiscard = async () => {
    if (!userToDiscard) return;

    setDiscarding(true);
    try {
      await adminApi.users.discard(userToDiscard.id);
      toast({
        title: "Success",
        description: "User discarded successfully.",
      });
      setShowDiscardDialog(false);
      setUserToDiscard(null);
      fetchUsers();
    } catch (error) {
      console.error("Error discarding user:", error);
      toast({
        title: "Error",
        description: "Failed to discard user.",
        variant: "destructive",
      });
    } finally {
      setDiscarding(false);
    }
  };

  const handleRestoreClick = (user: AdminUser) => {
    setUserToRestore(user);
    setShowRestoreDialog(true);
  };

  const handleRestore = async () => {
    if (!userToRestore) return;

    setRestoring(true);
    try {
      await adminApi.users.restore(userToRestore.id);
      toast({
        title: "Success",
        description: "User restored successfully.",
      });
      setShowRestoreDialog(false);
      setUserToRestore(null);
      fetchUsers();
    } catch (error) {
      console.error("Error restoring user:", error);
      toast({
        title: "Error",
        description: "Failed to restore user.",
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
    }
  };

  const handleDeleteClick = (user: AdminUser) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      await adminApi.users.destroy(userToDelete.id);
      toast({
        title: "Success",
        description: "User permanently deleted successfully.",
      });
      setShowDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const isDiscarded = (user: AdminUser) => {
    return user.deleted_at !== null && user.deleted_at !== undefined;
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="bg-red-500/10 text-red-600 border-red-500/20"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'enterprise':
        return <Badge variant="default" className="bg-blue-500/10 text-blue-600 border-blue-500/20"><Building2 className="h-3 w-3 mr-1" />Enterprise</Badge>;
      default:
        return <Badge variant="secondary"><UserIcon className="h-3 w-3 mr-1" />User</Badge>;
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div 
        ref={headerRef}
        className="p-4 md:p-6 border-b border-border flex-shrink-0 bg-card/50 backdrop-blur-sm sticky top-0 z-20"
      >
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
              Admin - Users
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage all users in the system
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
                placeholder="Search users by email..."
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
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Total Credits</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      const discarded = isDiscarded(user);
                      return (
                        <TableRow key={user.id} className={discarded ? "opacity-60" : ""}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                            {discarded ? (
                              <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                                <Archive className="h-3 w-3 mr-1" />
                                Discarded
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                                Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            ${((user.total_credits || 0) / 100).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            ${((user.total_spent || 0) / 100).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!discarded && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(user)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDiscardClick(user)}
                                    className="text-orange-600 hover:text-orange-700"
                                  >
                                    <Archive className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {discarded && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRestoreClick(user)}
                                    className="text-green-600 hover:text-green-700"
                                    title="Restore user"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(user)}
                                    className="text-destructive hover:text-destructive"
                                    title="Delete permanently"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * pagination.per_page) + 1} to {Math.min(page * pagination.per_page, pagination.total)} of {pagination.total} users
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

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select value={selectedRole} onValueChange={(value: 'user' | 'admin' | 'enterprise') => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discard Confirmation Dialog */}
      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard User</DialogTitle>
            <DialogDescription>
              Are you sure you want to discard {userToDiscard?.email}? The user will not be able to login, but the account can be restored later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscardDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDiscard} disabled={discarding}>
              {discarding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Discarding...
                </>
              ) : (
                "Discard"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore User</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore {userToRestore?.email}? The user will be able to login again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRestore} disabled={restoring}>
              {restoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                "Restore"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Permanently Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete User Permanently
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-2 mt-2">
                <p>
                  Are you absolutely sure you want to permanently delete {userToDelete?.email}?
                </p>
                <p className="font-semibold text-destructive">
                  This action cannot be undone. All user data will be permanently removed from the system.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

