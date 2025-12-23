import { LucideIcon } from "lucide-react";

interface TabSectionHeaderProps {
  icon: LucideIcon;
  label: string;
}

export function TabSectionHeader({ icon: Icon, label }: TabSectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}
