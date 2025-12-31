import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  User,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const email = user?.email || "";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [discardingAccount, setDiscardingAccount] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [discardAccountExpanded, setDiscardAccountExpanded] = useState(false);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all password fields.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'New password and confirmation must match.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setUpdatingPassword(true);
    try {
      await authApi.updatePasswordLoggedIn(currentPassword, newPassword, confirmPassword);
      
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.',
      });
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: 'Error updating password',
        description: error instanceof Error ? error.message : 'Failed to update password',
        variant: 'destructive',
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDiscardAccount = async () => {
    if (confirmEmail !== email) {
      toast({
        title: 'Email mismatch',
        description: 'Please enter your email address correctly to confirm.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Are you sure you want to discard your account? This action cannot be undone. You will not be able to sign up again with this email address.`)) {
      return;
    }

    setDiscardingAccount(true);
    try {
      await authApi.discardAccount();
      
      toast({
        title: 'Account discarded',
        description: 'Your account has been discarded. You will be signed out.',
      });
      
      // Sign out and redirect
      await signOut();
      navigate("/login");
    } catch (error) {
      toast({
        title: 'Error discarding account',
        description: error instanceof Error ? error.message : 'Failed to discard account',
        variant: 'destructive',
      });
    } finally {
      setDiscardingAccount(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
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
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-2xl p-4 md:p-6 pr-4 md:pr-6 pb-4 md:pb-6">
          {/* Settings Card */}
      <div className="bg-secondary/30 border border-border rounded-lg mb-4 md:mb-6">
        <button 
          className="w-full flex items-start justify-between gap-2 p-4 md:p-6"
          onClick={() => setSettingsExpanded(!settingsExpanded)}
        >
          <div className="text-left flex-1">
            <h2 className="text-base md:text-lg font-semibold mb-2">Settings</h2>
            <p className="text-muted-foreground text-xs md:text-sm">Customize your account details.</p>
          </div>
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", settingsExpanded && "rotate-180")} />
        </button>

        {settingsExpanded && (
          <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-3 md:space-y-4 border-t border-border pt-4">
            <div className="space-y-2">
              <Label className="text-xs md:text-sm">Email</Label>
              <Input 
                value={email}
                className="bg-secondary/50 h-9 md:h-10 text-xs md:text-sm"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs md:text-sm">Current Password</Label>
              <Input 
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="bg-secondary/50 h-9 md:h-10 text-xs md:text-sm"
                disabled={updatingPassword}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs md:text-sm">New Password</Label>
              <Input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="bg-secondary/50 h-9 md:h-10 text-xs md:text-sm"
                disabled={updatingPassword}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs md:text-sm">Confirm New Password</Label>
              <Input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="bg-secondary/50 h-9 md:h-10 text-xs md:text-sm"
                disabled={updatingPassword}
              />
            </div>

            <Button 
              variant="accent" 
              className="w-full text-xs md:text-sm"
              onClick={handleUpdatePassword}
              disabled={updatingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {updatingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Discard Account Card */}
      <div className="bg-secondary/30 border border-border rounded-lg">
        <button 
          className="w-full flex items-start justify-between gap-2 p-4 md:p-6"
          onClick={() => setDiscardAccountExpanded(!discardAccountExpanded)}
        >
          <div className="text-left flex-1">
            <h2 className="text-base md:text-lg font-semibold mb-2">Discard Account</h2>
            <p className="text-muted-foreground text-xs md:text-sm">
              Discard your account and all its contents. Your account will be deactivated and you will not be able to sign up again with this email address. This action cannot be undone. Proceed with caution.
            </p>
          </div>
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", discardAccountExpanded && "rotate-180")} />
        </button>

        {discardAccountExpanded && (
          <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-3 md:space-y-4 border-t border-border pt-4">
            <p className="text-xs md:text-sm">
              To confirm, please type your email address: <span className="font-semibold">{email}</span>
            </p>

            <div className="space-y-3 md:space-y-4">
              <Input 
                placeholder="Enter your email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="bg-secondary/50 h-9 md:h-10 text-xs md:text-sm"
                disabled={discardingAccount}
              />

              <Button 
                variant="destructive" 
                disabled={confirmEmail !== email || discardingAccount}
                className="bg-destructive/80 hover:bg-destructive w-full text-xs md:text-sm"
                onClick={handleDiscardAccount}
              >
                {discardingAccount ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2 animate-spin" />
                    Discarding...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                    Discard Account
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}
