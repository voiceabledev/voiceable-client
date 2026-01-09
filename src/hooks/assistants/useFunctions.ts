import { useState, useCallback, useEffect } from "react";
import type { Function, AgentFunction, FunctionsByIntegration } from "@/types/functions";
import { functionsApi, agentFunctionsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useFunctions(agentId: string | undefined) {
  const [functions, setFunctions] = useState<Function[]>([]);
  const [agentFunctions, setAgentFunctions] = useState<FunctionsByIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadFunctions = useCallback(async (integrationType?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await functionsApi.list(integrationType);
      if (response.data) {
        setFunctions(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load functions";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadAgentFunctions = useCallback(async () => {
    if (!agentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await agentFunctionsApi.list(agentId);
      if (response.data) {
        setAgentFunctions(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load agent functions";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [agentId, toast]);

  const enableFunction = useCallback(async (functionId: number, enabled: boolean = true) => {
    if (!agentId) return;

    try {
      setError(null);
      const response = await agentFunctionsApi.enable(agentId, functionId, enabled);
      if (response.data) {
        // Reload agent functions to get updated state
        await loadAgentFunctions();
        toast({
          title: "Success",
          description: enabled ? "Function enabled successfully" : "Function disabled successfully",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update function";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [agentId, loadAgentFunctions, toast]);

  const disableFunction = useCallback(async (agentFunctionId: number) => {
    if (!agentId) return;

    try {
      setError(null);
      await agentFunctionsApi.disable(agentId, agentFunctionId);
      // Reload agent functions to get updated state
      await loadAgentFunctions();
      toast({
        title: "Success",
        description: "Function disabled successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to disable function";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [agentId, loadAgentFunctions, toast]);

  const getFunctionsForIntegration = useCallback((integrationType: string): AgentFunction[] => {
    const integrationGroup = agentFunctions.find(
      (group) => group.integration_type === integrationType
    );
    return integrationGroup?.functions || [];
  }, [agentFunctions]);

  const isFunctionEnabled = useCallback((functionId: number): boolean => {
    return agentFunctions.some((group) =>
      group.functions.some((af) => af.function_id === functionId && af.enabled)
    );
  }, [agentFunctions]);

  useEffect(() => {
    if (agentId) {
      loadAgentFunctions();
    }
  }, [agentId, loadAgentFunctions]);

  return {
    functions,
    agentFunctions,
    loading,
    error,
    loadFunctions,
    loadAgentFunctions,
    enableFunction,
    disableFunction,
    getFunctionsForIntegration,
    isFunctionEnabled,
  };
}
