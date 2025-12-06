import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [email] = useState("vbrazo@gmail.com");
  const [newPassword, setNewPassword] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  return (
    <div className="max-w-2xl pt-4 md:pt-6 pl-4 md:pl-6 pr-4 md:pr-6 pb-4 md:pb-6">
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings")}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <h1 className="text-lg md:text-xl font-semibold">Account</h1>
      </div>

      {/* Settings Card */}
      <div className="bg-secondary/30 border border-border rounded-lg p-4 md:p-6 mb-4 md:mb-6">
        <h2 className="text-base md:text-lg font-semibold mb-2">Settings</h2>
        <p className="text-muted-foreground text-xs md:text-sm mb-4 md:mb-6">Customize your account details.</p>

        <div className="space-y-3 md:space-y-4">
          <div className="space-y-2">
            <Label className="text-xs md:text-sm">Email</Label>
            <Input 
              value={email}
              className="bg-secondary/50 h-9 md:h-10 text-xs md:text-sm"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs md:text-sm">New Password</Label>
            <Input 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-secondary/50 h-9 md:h-10 text-xs md:text-sm"
            />
          </div>

          <Button variant="accent" className="w-full text-xs md:text-sm">
            Update New Password
          </Button>
        </div>
      </div>

      {/* Delete Account Card */}
      <div className="bg-secondary/30 border border-border rounded-lg p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold mb-2">Delete Account</h2>
        <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">
          Permanently remove your account and all its contents. Upon deletion of your account, any orgs without any members will be deleted immediately. Neither the account, nor the orgs will be recoverable. Proceed with caution.
        </p>

        <p className="text-xs md:text-sm mb-3 md:mb-4">
          To confirm, please type your email address: <span className="font-semibold">{email}</span>
        </p>

        <div className="space-y-3 md:space-y-4">
          <Input 
            placeholder="Enter your email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className="bg-secondary/50 h-9 md:h-10 text-xs md:text-sm"
          />

          <Button 
            variant="destructive" 
            disabled={confirmEmail !== email}
            className="bg-destructive/80 hover:bg-destructive w-full text-xs md:text-sm"
          >
            <AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
