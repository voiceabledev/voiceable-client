import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordConfirm() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast({
        title: 'Invalid link',
        description: 'Password reset link is invalid or expired.',
        variant: 'destructive',
      });
      navigate('/reset-password');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== passwordConfirmation) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }

    if (!token) return;

    setIsLoading(true);
    try {
      await authApi.updatePassword(token, password, passwordConfirmation);
      toast({
        title: 'Password reset',
        description: 'Your password has been reset successfully.',
      });
      navigate('/login');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      toast({
        title: 'Reset failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Reset your password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary/50"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordConfirmation">Confirm Password</Label>
            <Input
              id="passwordConfirmation"
              type="password"
              placeholder="Confirm new password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="bg-secondary/50"
              required
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            variant="accent" 
            className="w-full" 
            disabled={isLoading || password !== passwordConfirmation}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-sm text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
