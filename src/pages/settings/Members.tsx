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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Members</h1>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Invite Members
        </Button>
      </div>

      <div className="bg-secondary/30 border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Role
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member, index) => (
              <TableRow key={index} className="hover:bg-secondary/50 border-0">
                <TableCell className="font-medium">{member.email}</TableCell>
                <TableCell className="text-muted-foreground">{member.name || ""}</TableCell>
                <TableCell className="text-muted-foreground">{member.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center">Invite New Members</DialogTitle>
            <DialogDescription className="text-center">
              Add people to your organization and collaborate with them.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Invite Users by email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="username@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddEmail}
                  disabled={!email.trim()}
                >
                  <Plus className="h-4 w-4" />
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
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
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

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={emails.length === 0 && !email.trim()}
            >
              Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
