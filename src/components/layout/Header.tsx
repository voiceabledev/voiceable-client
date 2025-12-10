import { FileText, MessageCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  title?: string;
  showDocs?: boolean;
  rightContent?: React.ReactNode;
}

export function Header({ title, showDocs = true, rightContent }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const userInitials = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  const handleSignOut = async () => {
    const redirectPath = await signOut();
    if (redirectPath) {
      navigate(redirectPath);
    }
  };

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6">
      <div>
        {title && <h1 className="text-lg font-semibold">{title}</h1>}
      </div>
      <div className="flex items-center gap-2">
        {showDocs && (
          <>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => window.open('https://contextor.mintlify.app/', '_blank')}>
              <FileText className="h-4 w-4 mr-2" />
              Docs
            </Button>
            {/* <Button variant="ghost" size="sm" className="text-muted-foreground">
              <MessageCircle className="h-4 w-4 mr-2" />
              Discord
            </Button> */}
          </>
        )}
        <ThemeToggle />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {rightContent}
      </div>
    </header>
  );
}
