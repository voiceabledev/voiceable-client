import { useState } from "react";
import { 
  Users,
  Mail,
  User,
  Shield,
  Plus
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const members = [
  {
    email: "vbrazo@gmail.com",
    name: "",
    role: "Admin"
  }
];

export default function Members() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Admin");
  const [emails, setEmails] = useState<string[]>([]);

  const handleAddEmail = () => {
    if (email.trim() && !emails.includes(email.trim())) {
      setEmails([...emails, email.trim()]);
      setEmail("");
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter(e => e !== emailToRemove));
  };

  const handleInvite = () => {
    // TODO: Implement invite logic
    console.log("Inviting:", emails.length > 0 ? emails : [email], "with role:", role);
    setIsInviteModalOpen(false);
    setEmail("");
    setEmails([]);
    setRole("Admin");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <h1 className="text-lg md:text-xl font-semibold">Members</h1>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)} className="w-full sm:w-auto text-xs md:text-sm">
          <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
          <span className="hidden sm:inline">Invite Members</span>
          <span className="sm:hidden">Invite</span>
        </Button>
      </div>

      <div className="bg-secondary/30 border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="text-muted-foreground text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    Email
                  </div>
                </TableHead>
                <TableHead className="text-muted-foreground text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    Name
                  </div>
                </TableHead>
                <TableHead className="text-muted-foreground text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    Role
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member, index) => (
                <TableRow key={index} className="hover:bg-secondary/50 border-0">
                  <TableCell className="font-medium text-xs md:text-sm">{member.email}</TableCell>
                  <TableCell className="text-muted-foreground text-xs md:text-sm">{member.name || ""}</TableCell>
                  <TableCell className="text-muted-foreground text-xs md:text-sm">{member.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-center mb-3 md:mb-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center text-base md:text-lg">Invite New Members</DialogTitle>
            <DialogDescription className="text-center text-xs md:text-sm">
              Add people to your organization and collaborate with them.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 md:space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs md:text-sm">Invite Users by email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="username@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-9 md:h-10 text-xs md:text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddEmail}
                  disabled={!email.trim()}
                  className="h-9 md:h-10 w-9 md:w-10"
                >
                  <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              </div>
              {emails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {emails.map((emailItem, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
                    >
                      <span>{emailItem}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(emailItem)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs md:text-sm">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="h-9 md:h-10 text-xs md:text-sm">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsInviteModalOpen(false)}
              className="w-full sm:w-auto text-xs md:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={emails.length === 0 && !email.trim()}
              className="w-full sm:w-auto text-xs md:text-sm"
            >
              Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
