import React, { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Key } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { workflowsApi } from "@/lib/api";
import type { ConditionalConfig, ToolInChain } from "@/types/functions";

interface ConditionConfigurationProps {
    config: ConditionalConfig;
    onChange: (config: ConditionalConfig) => void;
    agentId: string;
    stepIndex: number;
}

export const ConditionConfiguration: React.FC<ConditionConfigurationProps> = ({
    config,
    onChange,
    agentId,
    stepIndex,
}) => {
    const [availableVariables, setAvailableVariables] = useState<
        Array<{ label: string; value: string; group: string }>
    >([]);

    useEffect(() => {
        const fetchVariables = async () => {
            const vars: Array<{ label: string; value: string; group: string }> = [];

            // 1. Previous Steps
            if (stepIndex > 0) {
                vars.push({
                    label: "Previous Step Result",
                    value: "result",
                    group: "Context",
                });
            }

            // 2. Conversation Context
            try {
                const contextResponse = await workflowsApi.getConversationContext(agentId);
                if (contextResponse.data?.available_fields) {
                    contextResponse.data.available_fields.forEach((field: any) => {
                        vars.push({
                            label: field.label,
                            value: field.path, // e.g., caller.name
                            group: "Conversation",
                        });
                    });
                }
            } catch (e) {
                console.error("Failed to fetch context variables", e);
            }

            setAvailableVariables(vars);
        };
        fetchVariables();
    }, [agentId, stepIndex]);

    const insertVariable = (variable: string) => {
        const textarea = document.getElementById("expression") as HTMLTextAreaElement;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = config.expression || "";
            const before = text.substring(0, start);
            const after = text.substring(end, text.length);
            const newExpression = before + variable + after;

            onChange({ ...config, expression: newExpression });

            // Restore focus and cursor position (approximate)
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(
                    start + variable.length,
                    start + variable.length
                );
            }, 0);
        } else {
            // Fallback if ref/id not working
            onChange({
                ...config,
                expression: (config.expression || "") + variable,
            });
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="description">Rule Name / Description</Label>
                <Input
                    id="description"
                    value={config.description || ""}
                    onChange={(e) => onChange({ ...config, description: e.target.value })}
                    className="mt-1"
                    placeholder="e.g., Check if user exists"
                />
            </div>

            <div>
                <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="expression">Condition Expression *</Label>

                    {/* Variable Picker */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                                <Key className="w-3 h-3" /> Insert Variable
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
                            {availableVariables.length === 0 ? (
                                <div className="p-2 text-xs text-muted-foreground">
                                    No variables available
                                </div>
                            ) : (
                                <>
                                    {/* Group variables by group name */}
                                    {Array.from(
                                        new Set(availableVariables.map((v) => v.group))
                                    ).map((group) => (
                                        <React.Fragment key={group}>
                                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                {group}
                                            </div>
                                            {availableVariables
                                                .filter((v) => v.group === group)
                                                .map((v) => (
                                                    <DropdownMenuItem
                                                        key={v.value}
                                                        onClick={() => insertVariable(v.value)}
                                                    >
                                                        {v.label}{" "}
                                                        <span className="ml-2 text-xs opacity-50 font-mono">
                                                            ({v.value})
                                                        </span>
                                                    </DropdownMenuItem>
                                                ))}
                                            <DropdownMenuSeparator />
                                        </React.Fragment>
                                    ))}
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Textarea
                    id="expression"
                    value={config.expression || ""}
                    onChange={(e) => onChange({ ...config, expression: e.target.value })}
                    className="mt-1 font-mono text-sm"
                    placeholder="result.length === 0"
                    rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                    JavaScript expression that evaluates to true/false.
                </p>
            </div>
        </div>
    );
};
