import React from "react";
import { ChevronDown, GitBranch, Check, X, GitMerge } from "lucide-react";
import { cn } from "@/lib/utils";

// Linear Connector - Tool to tool connection
interface LinearConnectorProps {
  distance?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
  animated?: boolean;
}

export const LinearConnector: React.FC<LinearConnectorProps> = ({
  distance = "md",
  variant = "primary",
  animated = false,
}) => {
  const heights = {
    sm: "h-6",
    md: "h-12",
    lg: "h-16",
  };

  return (
    <div className="relative flex flex-col items-center py-2">
      <div
        className={cn(
          "w-0.5 relative rounded-full",
          heights[distance],
          variant === "primary"
            ? "bg-gradient-to-b from-primary/40 to-primary/20"
            : "bg-slate-200 dark:bg-slate-800"
        )}
      >
        {animated && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/40 to-transparent animate-pulse rounded-full" />
        )}
      </div>

      {/* Arrow indicator */}
      <div className={cn(
        "flex items-center justify-center p-1 rounded-full border shadow-sm relative -mt-1",
        variant === "primary" ? "bg-white dark:bg-slate-900 border-primary/20" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      )}>
        <ChevronDown className={cn(
          "w-3 h-3",
          variant === "primary" ? "text-primary animate-bounce-slow" : "text-slate-400"
        )} />
      </div>
    </div>
  );
};

// Branch Connector - Decision point with split paths
interface BranchConnectorProps {
  branchLabels: {
    left: string;
    right: string;
  };
}

export const BranchConnector: React.FC<BranchConnectorProps> = ({
  branchLabels,
}) => {
  return (
    <div className="relative w-full flex flex-col items-center gap-4 my-6">
      {/* Decision node */}
      <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 border-2 border-primary flex items-center justify-center shadow-sm">
        <GitBranch className="w-4 h-4 text-primary" />
      </div>

      {/* Y-shaped split paths (SVG) */}
      <svg
        width="100%"
        height="80"
        viewBox="0 0 100 80"
        className="absolute top-8 pointer-events-none"
        style={{ overflow: "visible" }}
        preserveAspectRatio="none"
      >
        {/* Left path (True branch) */}
        <path
          d="M 50 0 Q 50 20, 25 40 L 25 80"
          stroke="hsl(var(--workflow-branch-true) / 0.3)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="4 2"
        />
        {/* Right path (False branch) */}
        <path
          d="M 50 0 Q 50 20, 75 40 L 75 80"
          stroke="hsl(var(--workflow-branch-false) / 0.3)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="4 2"
        />
      </svg>

      {/* Branch labels */}
      <div className="flex w-full justify-between px-8 mt-16">
        <BranchLabel color="green">{branchLabels.left}</BranchLabel>
        <BranchLabel color="red">{branchLabels.right}</BranchLabel>
      </div>
    </div>
  );
};

// Branch Label Component
interface BranchLabelProps {
  color: "green" | "red";
  children: React.ReactNode;
}

const BranchLabel: React.FC<BranchLabelProps> = ({ color, children }) => {
  const styles = {
    green: {
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-700 dark:text-green-300",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-700 dark:text-red-300",
    },
  };

  const style = styles[color];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-semibold",
        style.bg,
        style.border,
        style.text
      )}
    >
      {children}
    </div>
  );
};

// Branch Header Component - For use inside conditional branches
interface BranchHeaderProps {
  label: string;
  icon: React.ReactNode;
  color: "green" | "red";
}

export const BranchHeader: React.FC<BranchHeaderProps> = ({
  label,
  icon,
  color,
}) => {
  const styles = {
    green: {
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-700 dark:text-green-300",
      iconBg: "bg-green-100 dark:bg-green-900/50",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-700 dark:text-red-300",
      iconBg: "bg-red-100 dark:bg-red-900/50",
    },
  };

  const style = styles[color];

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border-2",
        style.bg,
        style.border
      )}
    >
      <div className={cn("w-5 h-5 rounded flex items-center justify-center", style.iconBg)}>
        {icon}
      </div>
      <span className={cn("text-xs font-semibold", style.text)}>{label}</span>
    </div>
  );
};

// Merge Connector - Shows paths merging back together
export const MergeConnector: React.FC = () => {
  return (
    <div className="relative w-full flex flex-col items-center gap-4 my-6">
      {/* Merge paths (inverted Y) */}
      <svg
        width="100%"
        height="60"
        viewBox="0 0 100 60"
        className="relative pointer-events-none"
        style={{ overflow: "visible" }}
        preserveAspectRatio="none"
      >
        {/* Left path merging */}
        <path
          d="M 25 0 L 25 30 Q 25 45, 50 60"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="4 2"
        />
        {/* Right path merging */}
        <path
          d="M 75 0 L 75 30 Q 75 45, 50 60"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="4 2"
        />
      </svg>

      {/* Merge node */}
      <div className="w-7 h-7 rounded-full bg-primary/10 dark:bg-primary/20 border-2 border-primary/50 flex items-center justify-center shadow-sm -mt-2">
        <GitMerge className="w-3.5 h-3.5 text-primary/70" />
      </div>
    </div>
  );
};
