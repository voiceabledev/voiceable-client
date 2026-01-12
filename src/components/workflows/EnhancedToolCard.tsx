import React from "react";
import { Trash2, GripVertical, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { INTEGRATION_METADATA } from "@/constants/assistant";
import type { ToolInChain } from "@/types/functions";

interface EnhancedToolCardProps {
  tool: ToolInChain;
  index: number;
  onClick?: () => void;
  onRemove?: () => void;
  draggable?: boolean;
  readOnly?: boolean;
  isDragging?: boolean;
  methods?: string[];
}

// Helper function to get method names from tool
const getToolMethodNames = (tool: ToolInChain): string[] => {
  const config = tool.config as Record<string, unknown> | undefined;
  const methods: string[] = Array.isArray(config?.methods)
    ? (config.methods as string[])
    : config?.method
      ? [config.method as string]
      : tool.method
        ? [tool.method]
        : [];

  return methods;
};

// Helper function to format method names for display
const formatMethodName = (method: string): string => {
  return method
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export const EnhancedToolCard: React.FC<EnhancedToolCardProps> = ({
  tool,
  index,
  onClick,
  onRemove,
  draggable = false,
  readOnly = false,
  isDragging = false,
  methods: propMethods,
}) => {
  const metadata = INTEGRATION_METADATA[tool.type];
  const methods = propMethods || getToolMethodNames(tool);
  const isConfigured = methods.length > 0;

  // Role-based colors (matching CSS variables with fallbacks)
  const roleColors: Record<string, { border: string; bg: string; icon: string; text: string }> = {
    communication: { border: "border-blue-200 dark:border-blue-800", bg: "from-blue-50/50 to-transparent", icon: "bg-blue-500", text: "text-blue-600" },
    knowledge: { border: "border-purple-200 dark:border-purple-800", bg: "from-purple-50/50 to-transparent", icon: "bg-purple-500", text: "text-purple-600" },
    scheduling: { border: "border-green-200 dark:border-green-800", bg: "from-green-50/50 to-transparent", icon: "bg-green-600", text: "text-green-600" },
    crm: { border: "border-orange-200 dark:border-orange-800", bg: "from-orange-50/50 to-transparent", icon: "bg-orange-500", text: "text-orange-600" },
    control: { border: "border-slate-200 dark:border-slate-800", bg: "from-slate-50/50 to-transparent", icon: "bg-slate-500", text: "text-slate-600" },
  };

  const style = roleColors[tool.role] || roleColors.control;

  // Get primary method (first method or tool name)
  const primaryMethod = methods.length > 0
    ? formatMethodName(methods[0])
    : tool.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div
      onClick={readOnly ? undefined : onClick}
      className={cn(
        "group relative flex flex-col min-w-[220px]",
        "bg-white dark:bg-slate-900 border-2 rounded-2xl",
        "p-5 transition-all duration-300",
        style.border,
        "bg-gradient-to-br via-transparent to-transparent",
        style.bg,
        !readOnly && "cursor-pointer hover:shadow-[var(--shadow-workflow-lg)] hover:-translate-y-1 hover:border-primary/40",
        isDragging && "opacity-40 scale-95",
        "shadow-[var(--shadow-workflow-md)]"
      )}
    >
      {/* Corner Glow */}
      <div className={cn(
        "absolute top-0 left-0 w-24 h-24 bg-gradient-to-br opacity-20 pointer-events-none rounded-tl-2xl transition-opacity group-hover:opacity-40",
        tool.role === 'communication' ? "from-blue-400" :
          tool.role === 'knowledge' ? "from-purple-400" :
            tool.role === 'scheduling' ? "from-green-400" :
              tool.role === 'crm' ? "from-orange-400" : "from-slate-400"
      )} />

      {/* Header: Icon + Name + Actions */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          {/* Integration Badge */}
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "text-sm font-semibold text-white shadow-sm ring-4 ring-white dark:ring-slate-900",
              metadata?.iconBg || style.icon
            )}
          >
            {metadata?.icon || tool.type.substring(0, 2).toUpperCase()}
          </div>

          {/* Tool Name */}
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
              {metadata?.name || tool.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              {tool.role}
            </div>
          </div>
        </div>

        {/* Actions Menu (hover) */}
        {!readOnly && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 rounded-full p-2"
            type="button"
            title="Delete card"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Primary Method / Action */}
      <div className="relative z-10 mb-4 py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors group-hover:bg-white dark:group-hover:bg-slate-800">
        <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-0.5">Primary Action</div>
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {primaryMethod}
        </div>
      </div>

      {/* Footer: Status + Drag Handle */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/50 relative z-10">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {isConfigured ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-tight">Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Setup</span>
            </div>
          )}
        </div>

        {/* Drag Handle */}
        {!readOnly && draggable && (
          <div className="opacity-40 group-hover:opacity-100 transition-opacity cursor-move p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
            <GripVertical className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </div>

      {/* Active State Sparkle */}
      {isConfigured && !readOnly && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
          <Sparkles className="w-3 h-3 text-primary" />
        </div>
      )}
    </div>
  );
};
