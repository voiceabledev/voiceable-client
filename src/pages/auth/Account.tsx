import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User,
  AlertTriangle
} from "lucide-react";

export default function Account() {
  const [email] = useState("vbrazo@gmail.com");
  const [newPassword, setNewPassword] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Account</h1>
      </div>

      {/* Settings Card */}
      <div className="bg-secondary/30 border border-border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Settings</h2>
        <p className="text-muted-foreground text-sm mb-6">Customize your account details.</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              value={email}
              className="bg-secondary/50"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label>New Password</Label>
            <Input 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-secondary/50"
            />
          </div>

          <Button variant="accent" className="w-full">
            Update New Password
          </Button>
        </div>
      </div>

      {/* Delete Account Card */}
      <div className="bg-secondary/30 border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">Delete Account</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Permanently remove your account and all its contents. Upon deletion of your account, any orgs without any members will be deleted immediately. Neither the account, nor the orgs will be recoverable. Proceed with caution.
        </p>

        <p className="text-sm mb-4">
          To confirm, please type your email address: <span className="font-semibold">{email}</span>
        </p>

        <div className="space-y-4">
          <Input 
            placeholder="Enter your email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className="bg-secondary/50"
          />

          <Button 
            variant="destructive" 
            disabled={confirmEmail !== email}
            className="bg-destructive/80 hover:bg-destructive"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
