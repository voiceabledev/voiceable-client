import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Plus, Trash2, Edit, Loader2, User, Building2, CreditCard } from "lucide-react";
import { phoneNumbersApi, PhoneNumber, Agent, agentsApi, UpdatePhoneNumberParams, paymentsApi, Payment } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PhoneNumberModal } from "@/components/PhoneNumberModal";
import { TabSectionCard } from "@/components/assistants/TabSectionCard";

interface PhoneNumbersTabProps {
  agent: Agent | null;
  agentId: string | undefined;
}

export default function PhoneNumbersTab({ agent, agentId }: PhoneNumbersTabProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPhoneNumberModalOpen, setIsPhoneNumberModalOpen] = useState(false);
  const [showContactSalesModal, setShowContactSalesModal] = useState(false);
  const [editingPhoneNumber, setEditingPhoneNumber] = useState<PhoneNumber | null>(null);
  const [hasMadePurchase, setHasMadePurchase] = useState<boolean | null>(null);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
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
        setAgents(response.data);
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
    const checkPurchaseStatus = async () => {
      setCheckingPurchase(true);
      try {
        const response = await paymentsApi.list();
        if (response.data) {
          const hasPurchase = response.data.some((payment: Payment) => payment.status === 'succeeded');
          setHasMadePurchase(hasPurchase);
        } else {
          setHasMadePurchase(false);
        }
      } catch (error) {
        console.error('Error checking purchase status:', error);
        setHasMadePurchase(false);
      } finally {
        setCheckingPurchase(false);
      }
    };
    checkPurchaseStatus();
  }, []);

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

  const handleDelete = async (phoneNumberId: number) => {
    if (!confirm("Are you sure you want to delete this phone number?")) {
      return;
    }

    try {
      await phoneNumbersApi.delete(phoneNumberId);
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
    }
  };

  if (checkingPurchase || loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Show purchase required message if user hasn't made a purchase
  if (hasMadePurchase === false) {
    return (
      <>
        <div className="flex md:items-center justify-center min-h-[calc(100vh-300px)] py-4 md:py-8 px-4">
          <div className="max-w-2xl w-full bg-card border border-border rounded-xl p-6 sm:p-8 md:p-12 text-center">
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="p-3 md:p-4 bg-primary/10 rounded-full">
                <Phone className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 md:mb-4">Phone Numbers Require Membership</h2>
            <p className="text-muted-foreground mb-6 md:mb-8 text-sm sm:text-base md:text-lg leading-relaxed px-2 sm:px-0">
              Phone number purchases require at least one successful payment. 
              You can use the widget to test your agent without purchasing a phone number.
              Please make a purchase to unlock phone number functionality.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate("/settings/billing")}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Buy Credits
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowContactSalesModal(true)}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Sales Modal */}
        <Dialog open={showContactSalesModal} onOpenChange={setShowContactSalesModal}>
          <DialogContent className="max-w-4xl w-full h-[90vh] max-h-[800px] p-0 flex flex-col">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
              <DialogTitle>Schedule a Meeting</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden min-h-0">
              <iframe
                src="https://calendly.com/imvitoroliveira"
                className="w-full h-full border-0"
                title="Calendly Scheduling"
                allow="camera; microphone; geolocation"
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Filter to only show phone numbers assigned to the current agent
  const agentPhoneNumbers = agentId 
    ? phoneNumbers.filter((pn) => pn.agent_id?.toString() === agentId)
    : [];

  return (
    <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
            <Phone className="h-4 w-4" />
            <span>PHONE NUMBER</span>
          </div>
          <TabSectionCard
            title="Phone Number"
            description="Manage the phone number assigned to this agent. Purchase a new number or import an existing one from your account."
            count={`${agentPhoneNumbers.length} phone number${agentPhoneNumbers.length !== 1 ? 's' : ''} assigned to this agent`}
            actionButton={
              agentPhoneNumbers.length === 0 ? (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPhoneNumberModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Number
                </Button>
              ) : null
            }
          >
          {agentPhoneNumbers.length > 0 ? (
            <div className="space-y-3">
              <div className="grid gap-3">
              {agentPhoneNumbers.map((phoneNumber) => (
                <div
                  key={phoneNumber.id}
                  className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{phoneNumber.phone_number}</span>
                      <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full capitalize">
                        {phoneNumber.provider}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {phoneNumber.label && (
                        <>
                          <span>{phoneNumber.label}</span>
                          <span>•</span>
                        </>
                      )}
                      {phoneNumber.agent_name ? (
                        <>
                          <User className="h-3 w-3" />
                          <span className="truncate">Assigned to {phoneNumber.agent_name}</span>
                        </>
                      ) : (
                        <span className="truncate italic">Unassigned</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={phoneNumber.agent_id ? phoneNumber.agent_id.toString() : "none"}
                      onValueChange={(value) => handleAgentChange(phoneNumber, value)}
                      disabled={loadingAgents}
                    >
                      <SelectTrigger className="w-40">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(phoneNumber)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <button
                      onClick={() => handleDelete(phoneNumber.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Phone className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No phone number assigned to this agent yet. Add a phone number to get started.
              </p>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setIsPhoneNumberModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Phone Number
              </Button>
            </div>
          )}
          </TabSectionCard>
        </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Phone Number</DialogTitle>
            <DialogDescription>
              Update the label for this phone number
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input value={formData.phone_number} disabled className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Label</label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Main Line, Support Line"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

