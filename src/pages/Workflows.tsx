import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Upload,
  FileText,
  Code,
  MoreVertical
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { CreateWorkflowModal } from "@/components/workflows/CreateWorkflowModal";

const workflows = [
  {
    id: "1",
    name: "Appointment Scheduler",
    stepCount: 24,
    created: "Dec 5, 2025",
    updated: "Dec 5, 2025"
  }
];

export default function Workflows() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            <span className="text-muted-foreground">⚡</span>
            Workflows
            <Badge variant="secondary" className="bg-secondary text-muted-foreground">
              Beta
            </Badge>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="accent" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload JSON
          </Button>
          <Button variant="outline" onClick={() => {
            window.location.href = "https://voiceable.mintlify.app/";
          }}>
            <FileText className="h-4 w-4 mr-2" />
            Docs
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Select defaultValue="recent">
            <SelectTrigger className="w-[180px] bg-secondary/50">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Created</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="updated">Last Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="text-muted-foreground font-medium">Name</TableHead>
              <TableHead className="text-muted-foreground font-medium">Step Count</TableHead>
              <TableHead className="text-muted-foreground font-medium">Created</TableHead>
              <TableHead className="text-muted-foreground font-medium">Updated</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.map((workflow) => (
              <TableRow
                key={workflow.id}
                className="hover:bg-secondary/50 cursor-pointer"
                onClick={() => navigate(`/workflows/${workflow.id}`)}
              >
                <TableCell className="font-medium">{workflow.name}</TableCell>
                <TableCell className="text-muted-foreground">{workflow.stepCount}</TableCell>
                <TableCell className="text-muted-foreground">{workflow.created}</TableCell>
                <TableCell className="text-muted-foreground">{workflow.updated}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Code className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateWorkflowModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
