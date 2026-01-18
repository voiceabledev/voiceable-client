import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Phone, Plus, Trash2, Edit, Loader2, User, MoreVertical } from "lucide-react";
import { phoneNumbersApi, PhoneNumber, Agent, agentsApi, UpdatePhoneNumberParams } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PhoneNumberModal } from "@/components/PhoneNumberModal";
import { WorkflowStyleCard } from "@/components/assistants/WorkflowStyleCard";
import { MembershipStatusMessage } from "@/components/assistants/MembershipStatusMessage";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface PhoneNumbersTabProps {
  agent: Agent | null;
  agentId: string | undefined;
}

export default function PhoneNumbersTab({ agent, agentId }: PhoneNumbersTabProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPhoneNumberModalOpen, setIsPhoneNumberModalOpen] = useState(false);
  const [deletePhoneNumberId, setDeletePhoneNumberId] = useState<string | null>(null);
  const [editingPhoneNumber, setEditingPhoneNumber] = useState<PhoneNumber | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [formData, setFormData] = useState({
    phone_number: "",
    label: "",
    provider: "twilio" as const,
  });

  const fetchPhoneNumbers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await phoneNumbersApi.list();
      if (response.data) {
        setPhoneNumbers(response.data);
      } else {
        setPhoneNumbers([]);
      }
    } catch (error) {
      console.error("Failed to fetch phone numbers:", error);
      toast({
        title: "Error",
        description: "Failed to load phone numbers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const response = await agentsApi.list();
      if (response.data) {
        // Handle paginated response structure
        const agentsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any).data || [];
        setAgents(agentsData);
      }
    } catch (err) {
      toast({
        title: 'Error loading agents',
        description: err instanceof Error ? err.message : 'Failed to fetch agents',
        variant: 'destructive',
      });
    } finally {
      setLoadingAgents(false);
    }
  }, [toast]);


  useEffect(() => {
    if (agentId) {
      fetchPhoneNumbers();
      fetchAgents();
    }
  }, [agentId, fetchPhoneNumbers, fetchAgents]);

  const handleOpenDialog = (phoneNumber?: PhoneNumber) => {
    if (phoneNumber) {
      setEditingPhoneNumber(phoneNumber);
      setFormData({
        phone_number: phoneNumber.phone_number,
        label: phoneNumber.label || "",
        provider: "twilio" as const,
      });
    } else {
      setEditingPhoneNumber(null);
      setFormData({
        phone_number: "",
        label: "",
        provider: "twilio" as const,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPhoneNumber(null);
    setFormData({
      phone_number: "",
      label: "",
      provider: "twilio",
    });
  };

  const handleSave = async () => {
    if (!formData.phone_number || !formData.label) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingPhoneNumber) {
        // Update existing phone number
        await phoneNumbersApi.update(editingPhoneNumber.id, {
          agent_id: agentId,
          label: formData.label,
        });
        toast({
          title: "Success",
          description: "Phone number updated successfully",
        });
      } else {
        // Create new phone number (this would typically be from available numbers)
        // For now, we'll just update an existing one to assign it to the agent
        toast({
          title: "Info",
          description: "Please use the phone numbers page to purchase and assign numbers",
        });
      }
      handleCloseDialog();
      fetchPhoneNumbers();
    } catch (error) {
      console.error("Failed to save phone number:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save phone number",
        variant: "destructive",
      });
    }
  };

  const handleAgentChange = async (phoneNumber: PhoneNumber, agentIdValue: string) => {
    try {
      const updateParams: UpdatePhoneNumberParams = {
        agent_id: agentIdValue !== "none" ? agentIdValue : "",
      };

      await phoneNumbersApi.update(phoneNumber.id, updateParams);
      toast({
        title: 'Success',
        description: 'Phone number updated successfully.',
      });
      fetchPhoneNumbers();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update phone number',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletePhoneNumberId) return;

    try {
      await phoneNumbersApi.delete(Number(deletePhoneNumberId));
      toast({
        title: "Success",
        description: "Phone number deleted successfully",
      });
      fetchPhoneNumbers();
    } catch (error) {
      console.error("Failed to delete phone number:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete phone number",
        variant: "destructive",
      });
    } finally {
      setDeletePhoneNumberId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
              <Phone className="h-4 w-4" />
              <span>PHONE NUMBER</span>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              {/* Skeleton header */}
              <div className="mb-6">
                <div className="h-6 bg-muted/50 rounded w-48 mb-2 animate-pulse" />
                <div className="h-4 bg-muted/30 rounded w-96 animate-pulse" />
              </div>

              {/* Skeleton cards */}
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card animate-pulse"
                  >
                    <div className="flex-shrink-0 p-2 rounded-lg bg-muted/50 h-9 w-9" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted/50 rounded w-32" />
                      <div className="h-3 bg-muted/30 rounded w-48" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-9 bg-muted/50 rounded w-40" />
                      <div className="h-9 bg-muted/50 rounded w-9" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter to only show phone numbers assigned to the current agent
  const agentPhoneNumbers = agentId 
    ? phoneNumbers.filter((pn) => pn.agent_id?.toString() === agentId)
    : [];

  // Determine membership status
  const membershipStatus = user?.membership_status || 'free';


  // Block cancelled or suspended users from seeing phone numbers
  if (membershipStatus === 'cancelled' || membershipStatus === 'suspended') {
    const title = membershipStatus === 'cancelled'
      ? 'Phone Number Access Unavailable'
      : 'Account Suspended';
    const description = membershipStatus === 'cancelled'
      ? 'Your membership has been cancelled. Please contact support to reactivate your account and restore phone number access.'
      : 'Your account has been suspended. Please contact support for assistance with your account.';

    return (
      <MembershipStatusMessage
        status={membershipStatus}
        title={title}
        description={description}
      />
    );
  }

  // If user has phone numbers, show them (for active, trial, expired, free users)
  if (agentPhoneNumbers.length > 0) {
    // Will show phone numbers UI below
  }
  // Show membership required message only for trial and free users
  else if (membershipStatus === 'trial' || membershipStatus === 'free') {
    return (
      <MembershipStatusMessage
        status={membershipStatus}
        title="Phone Numbers Require Membership"
        description="Phone number purchases require at least one successful payment. You can use the widget to test your agent without purchasing a phone number. Please make a purchase to unlock phone number functionality."
        primaryButtonText="Buy Credits"
        primaryButtonAction={() => navigate("/settings/billing")}
      />
    );
  }
  // Show expired membership message
  else if (membershipStatus === 'expired') {
    return (
      <MembershipStatusMessage
        status="expired"
        title="Membership Expired"
        description="Your membership has expired. Please renew your membership to purchase new phone numbers. You can still use the widget to test your agent."
        primaryButtonText="Renew Membership"
        primaryButtonAction={() => navigate("/settings/billing")}
      />
    );
  }

  return (
    <div className="space-y-6">
        <div>
          <WorkflowStyleCard
            title="Phone Number"
            description="Manage the phone number assigned to this agent. Purchase a new number or import an existing one from your account."
            icon={Phone}
            expanded={expanded}
            onToggle={() => setExpanded(!expanded)}
            count={agentPhoneNumbers.length}
            actionButton={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPhoneNumberModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Number
              </Button>
            }
          >
          {agentPhoneNumbers.length > 0 ? (
            <div className="space-y-3">
              <div className="grid gap-3">
              {agentPhoneNumbers.map((phoneNumber) => (
                <div
                  key={phoneNumber.id}
                  className={cn(
                    "relative flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl overflow-hidden",
                    "bg-card border border-border shadow-sm",
                    "hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5",
                    "transition-all duration-300 group"
                  )}
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 p-2 rounded-lg transition-all duration-300",
                    "bg-primary/10 group-hover:bg-primary/15"
                  )}>
                    <Phone className="h-5 w-5 text-primary" />
                  </div>

                  {/* Phone Number Info */}
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold tracking-tight">
                        {phoneNumber.phone_number}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {phoneNumber.label && (
                        <>
                          <span className="font-medium">{phoneNumber.label}</span>
                          <span className="hidden sm:inline">•</span>
                        </>
                      )}
                      {phoneNumber.agent_name ? (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3" />
                          <span className="truncate">Assigned to {phoneNumber.agent_name}</span>
                        </div>
                      ) : (
                        <span className="truncate italic text-muted-foreground/70">Unassigned</span>
                      )}
                    </div>
                  </div>

                  {/* Agent Assignment & Actions */}
                  <div className="flex items-center gap-2 relative z-10 flex-wrap sm:flex-nowrap">
                    <Select
                      value={phoneNumber.agent_id ? phoneNumber.agent_id.toString() : "none"}
                      onValueChange={(value) => handleAgentChange(phoneNumber, value)}
                      disabled={loadingAgents}
                    >
                      <SelectTrigger className="w-full sm:w-40 h-9 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No agent</SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            {agent.name || `Agent ${agent.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 flex-shrink-0 hover:bg-secondary/80 transition-all"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleOpenDialog(phoneNumber)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Label
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletePhoneNumberId(phoneNumber.id.toString())}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              </div>
            </div>
          ) : (
            <div className="relative text-center py-12 px-4">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl" />

              {/* Content */}
              <div className="relative z-10">
                <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4 shadow-sm">
                  <Phone className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Phone Numbers Yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                  This agent doesn't have a phone number assigned yet. Add a phone number to enable inbound and outbound calls.
                </p>
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => setIsPhoneNumberModalOpen(true)}
                  className="shadow-sm hover:shadow-md transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Phone Number
                </Button>
              </div>
            </div>
          )}
          </WorkflowStyleCard>
        </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Edit className="h-4 w-4 text-primary" />
              </div>
              Edit Phone Number
            </DialogTitle>
            <DialogDescription>
              Update the label for this phone number to help identify its purpose
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone-number" className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Phone Number
              </Label>
              <Input
                id="phone-number"
                value={formData.phone_number}
                disabled
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label" className="flex items-center gap-2">
                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                Label
              </Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Main Line, Support Line"
              />
              <p className="text-xs text-muted-foreground">
                Choose a descriptive name to identify this number
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePhoneNumberId} onOpenChange={(open) => !open && setDeletePhoneNumberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              Delete Phone Number
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this phone number? This action cannot be undone and the number will be removed from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Phone Number Modal for adding/purchasing numbers */}
      <PhoneNumberModal
        open={isPhoneNumberModalOpen}
        onOpenChange={(open) => {
          setIsPhoneNumberModalOpen(open);
          if (!open) {
            fetchPhoneNumbers();
          }
        }}
        defaultAgentId={agentId}
      />
    </div>
  );
}

