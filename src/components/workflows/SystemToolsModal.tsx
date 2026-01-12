
import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PhoneOff, Languages, Voicemail, Settings2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SystemToolKey, SystemToolsState, SystemToolSetting } from "@/types/assistant";

type SystemToolsModalProps = {
    open: boolean;
    onClose: () => void;
    systemTools: SystemToolsState;
    systemToolSettings: Record<string, SystemToolSetting>;
    onToggleSystemTool: (key: SystemToolKey, enabled: boolean) => void;
    onOpenSettings: (key: SystemToolKey) => void;
};

const SYSTEM_TOOLS_CONFIG: {
    key: SystemToolKey;
    label: string;
    description: string;
    icon: React.ElementType;
}[] = [
        {
            key: "end_call",
            label: "End Call",
            description: "Allow the AI to end calls gracefully when the conversation is finished.",
            icon: PhoneOff,
        },
        {
            key: "detect_language",
            label: "Detect Language",
            description: "Automatically detect and switch languages based on user input.",
            icon: Languages,
        },
        {
            key: "voicemail_detection",
            label: "Voicemail Detection",
            description: "Detect if a voicemail system answers and leave a message.",
            icon: Voicemail,
        },
    ];

export const SystemToolsModal: React.FC<SystemToolsModalProps> = ({
    open,
    onClose,
    systemTools,
    onToggleSystemTool,
    onOpenSettings,
}) => {
    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-950">
                <DialogHeader className="p-6 pb-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <DialogTitle className="text-xl">System Tools</DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1.5">
                        Configure built-in capabilities available to your agent throughout the entire call.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-2">
                    {SYSTEM_TOOLS_CONFIG.map((tool) => {
                        const isEnabled = systemTools[tool.key as SystemToolKey] || false;

                        return (
                            <div
                                key={tool.key}
                                className={cn(
                                    "group flex items-start gap-4 p-4 rounded-xl transition-all duration-200",
                                    "hover:bg-slate-50 dark:hover:bg-slate-900/50",
                                    isEnabled && "bg-slate-50/50 dark:bg-slate-900/30"
                                )}
                            >
                                <div className={cn(
                                    "mt-1 w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                    isEnabled
                                        ? "bg-primary/10 text-primary"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                                )}>
                                    <tool.icon className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-1">
                                        <span className={cn(
                                            "font-medium text-sm transition-colors",
                                            isEnabled
                                                ? "text-slate-900 dark:text-slate-100"
                                                : "text-slate-700 dark:text-slate-300"
                                        )}>
                                            {tool.label}
                                        </span>
                                        <Switch
                                            checked={isEnabled}
                                            onCheckedChange={(checked) => onToggleSystemTool(tool.key, checked)}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </div>

                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-8">
                                        {tool.description}
                                    </p>

                                    {isEnabled && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onOpenSettings(tool.key)}
                                            className="mt-3 h-8 px-3 text-xs font-medium text-primary hover:text-primary hover:bg-primary/5 -ml-2"
                                        >
                                            <Settings2 className="w-3.5 h-3.5 mr-1.5" />
                                            Configure Settings
                                            <ChevronRight className="w-3 h-3 ml-1 opacity-50" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <DialogFooter className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                    <Button onClick={onClose} className="w-full sm:w-auto">
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
