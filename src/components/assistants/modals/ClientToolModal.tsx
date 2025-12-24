import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Plus, X, Settings2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClientTool } from "@/types/assistant";

type ClientToolModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingClientTool: ClientTool | null;
  clientToolForm: ClientTool;
  setClientToolForm: React.Dispatch<React.SetStateAction<ClientTool>>;
  onSave: () => void;
  onClose: () => void;
};

export const ClientToolModal: React.FC<ClientToolModalProps> = ({
  open,
  onOpenChange,
  editingClientTool,
  clientToolForm,
  setClientToolForm,
  onSave,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <div className="p-6 border-b">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>{editingClientTool ? "Edit Client Tool" : "Add Client Tool"}</DialogTitle>
                <DialogDescription>
                  Define a tool that will be executed on the client side.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="general" className="h-full flex flex-col">
            <div className="px-6 border-b bg-secondary/20">
              <TabsList className="h-12 bg-transparent gap-6">
                <TabsTrigger
                  value="general"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full px-1"
                >
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="parameters"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full px-1"
                >
                  Parameters
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 p-6">
              <TabsContent value="general" className="mt-0 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Name</label>
                  <Input
                    value={clientToolForm.name}
                    onChange={(e) => setClientToolForm({ ...clientToolForm, name: e.target.value })}
                    placeholder="e.g., open_support_ticket"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Description</label>
                  <Textarea
                    value={clientToolForm.description}
                    onChange={(e) => setClientToolForm({ ...clientToolForm, description: e.target.value })}
                    placeholder="Explain what this tool does and when the LLM should use it..."
                    className="min-h-[100px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="parameters" className="mt-0 space-y-6">
                <p className="text-sm text-muted-foreground">Parameters configuration coming soon...</p>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        <div className="p-6 border-t bg-secondary/10">
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={!clientToolForm.name}>
              {editingClientTool ? "Save changes" : "Create tool"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
