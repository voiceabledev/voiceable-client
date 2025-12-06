import { FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  title?: string;
  showDocs?: boolean;
  rightContent?: React.ReactNode;
}

export function Header({ title, showDocs = true, rightContent }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6">
      <div>
        {title && <h1 className="text-lg font-semibold">{title}</h1>}
      </div>
      <div className="flex items-center gap-2">
        {showDocs && (
          <>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <FileText className="h-4 w-4 mr-2" />
              Docs
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <MessageCircle className="h-4 w-4 mr-2" />
              Discord
            </Button>
          </>
        )}
        <ThemeToggle />
        {rightContent}
      </div>
    </header>
  );
}
