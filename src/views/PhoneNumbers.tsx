"use client"

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Phone, 
  Search, 
  Plus,
  Trash2,
  Loader2,
  User
} from "lucide-react";
import { PhoneNumberModal } from "@/components/PhoneNumberModal";
import { phoneNumbersApi, PhoneNumber, agentsApi, Agent, UpdatePhoneNumberParams } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function PhoneNumbers() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchPhoneNumbers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await phoneNumbersApi.list();
      if (response.data) {
        setPhoneNumbers(response.data);
      }
    } catch (err) {
      toast({
        title: 'Error loading phone numbers',
        description: err instanceof Error ? err.message : 'Failed to fetch phone numbers',
        variant: 'destructive',
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
    fetchPhoneNumbers();
    fetchAgents();
  }, [fetchPhoneNumbers, fetchAgents]);

  const handleDelete = async (phoneNumber: PhoneNumber) => {
    if (!confirm(`Are you sure you want to delete ${phoneNumber.phone_number}?`)) {
      return;
    }

    try {
      await phoneNumbersApi.delete(phoneNumber.id);
      toast({
        title: 'Success',
        description: 'Phone number deleted successfully.',
      });
      fetchPhoneNumbers();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete phone number',
        variant: 'destructive',
      });
    }
  };

  const handleAgentChange = async (phoneNumber: PhoneNumber, agentId: string) => {
    try {
      const updateParams: UpdatePhoneNumberParams = {
        agent_id: agentId !== "none" ? agentId : "",
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

  const filteredPhoneNumbers = phoneNumbers.filter(phone =>
    phone.phone_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    phone.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    phone.agent_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <h1 className="text-lg md:text-xl font-semibold">Phone Numbers</h1>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : phoneNumbers.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-muted flex items-center justify-center mb-4 md:mb-6">
                <Phone className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3 text-center">Phone Numbers</h2>
              <p className="text-muted-foreground text-center max-w-md mb-2 text-sm md:text-base">
                Assistants are able to be connected to phone numbers for calls.
              </p>
              <p className="text-muted-foreground text-center max-w-md mb-4 md:mb-6 text-sm md:text-base">
                Browse and purchase available phone numbers from Twilio and assign them to your assistants.
              </p>
              
              <Button 
                variant="outline" 
                className="mb-4 w-full sm:w-auto" 
                onClick={() => setModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Purchase Phone Number
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full sm:w-80 max-w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search Phone Numbers" 
                  className="pl-9 bg-secondary/50 border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                {filteredPhoneNumbers.map((phone) => (
                  <div
                    key={phone.id}
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{phone.phone_number}</span>
                        <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                          {phone.provider}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {phone.label && (
                          <>
                            <span>{phone.label}</span>
                            <span>•</span>
                          </>
                        )}
                        {phone.agent_name ? (
                          <>
                            <User className="h-3 w-3" />
                            <span className="truncate">Assigned to {phone.agent_name}</span>
                          </>
                        ) : (
                          <span className="truncate italic">Unassigned</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={phone.agent_id ? phone.agent_id.toString() : "none"}
                        onValueChange={(value) => handleAgentChange(phone, value)}
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
                      <button
                        onClick={() => handleDelete(phone)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPhoneNumbers.length === 0 && searchQuery && (
                <div className="text-center py-8 text-muted-foreground">
                  No phone numbers found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <PhoneNumberModal open={modalOpen} onOpenChange={(open) => {
        setModalOpen(open);
        if (!open) {
          fetchPhoneNumbers();
        }
      }} />
    </div>
  );
}
