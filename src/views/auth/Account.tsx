"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User,
  AlertTriangle,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function Account() {
  const { user } = useAuth();
  const email = user?.email || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [deleteAccountExpanded, setDeleteAccountExpanded] = useState(false);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Account</h1>
      </div>

      {/* Settings Card */}
      <div className="bg-secondary/30 border border-border rounded-lg mb-6">
        <button 
          className="w-full flex items-start justify-between gap-2 p-6"
          onClick={() => setSettingsExpanded(!settingsExpanded)}
        >
          <div className="text-left flex-1">
            <h2 className="text-lg font-semibold mb-2">Settings</h2>
            <p className="text-muted-foreground text-sm">Customize your account details.</p>
          </div>
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", settingsExpanded && "rotate-180")} />
        </button>

        {settingsExpanded && (
          <div className="px-6 pb-6 space-y-4 border-t border-border pt-4">
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
        )}
      </div>

      {/* Delete Account Card */}
      <div className="bg-secondary/30 border border-border rounded-lg">
        <button 
          className="w-full flex items-start justify-between gap-2 p-6"
          onClick={() => setDeleteAccountExpanded(!deleteAccountExpanded)}
        >
          <div className="text-left flex-1">
            <h2 className="text-lg font-semibold mb-2">Delete Account</h2>
            <p className="text-muted-foreground text-sm">
              Permanently remove your account and all its contents. Upon deletion of your account, any orgs without any members will be deleted immediately. Neither the account, nor the orgs will be recoverable. Proceed with caution.
            </p>
          </div>
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", deleteAccountExpanded && "rotate-180")} />
        </button>

        {deleteAccountExpanded && (
          <div className="px-6 pb-6 space-y-4 border-t border-border pt-4">
            <p className="text-sm">
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
        )}
      </div>
    </div>
  );
}
