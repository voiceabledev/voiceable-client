// Outcome-driven features type definitions

export interface OutcomeDefinition {
  id: number;
  agent_id: number;
  primary_outcome: string;
  secondary_outcomes: string[];
  success_conditions: {
    keywords?: string[];
    patterns?: string[];
    min_duration?: number;
    max_duration?: number;
    required_tools?: string[];
  };
  failure_conditions: {
    failure_keywords?: string[];
    failure_patterns?: string[];
    max_attempts?: number;
  };
  escalation_rules: {
    escalation_keywords?: string[];
    frustration_threshold?: number;
    auto_escalate_after_failures?: number;
    name?: string;
    description?: string;
    disableInterruptions?: boolean;
    humanTransferRules?: Array<{
      id: string;
      phoneNumber: string;
      condition: string;
      destinationType?: string;
    }>;
  };
  outcome_type?: 'support' | 'sales' | 'general';
  created_at: string;
  updated_at: string;
}

export interface ConversationOutcome {
  id: number;
  conversation_id: string;
  agent_id: number | null;
  outcome_definition_id: number;
  outcome: 'success' | 'failure' | 'escalated';
  reason_code: string | null;
  confidence_score: number;
  cost_cents: number;
  cost_dollars?: number;
  duration_seconds: number | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  metadata: Record<string, unknown>;
  classified_at: string;
  expected_outcome?: string | null;
  actual_outcome?: string | null;
  annotated_by?: number | null;
  annotated_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  outcome_definition?: OutcomeDefinition;
  failure_reasons?: FailureReason[];
  human_handoff_event?: HumanHandoffEvent | null;
}

export interface EscalationPolicy {
  id: number;
  outcome_definition_id: number;
  trigger_type: 'failed_attempts' | 'frustration_detected' | 'keyword_trigger' | 'manual';
  trigger_config: {
    max_failed_attempts?: number;
    keywords?: string[];
    frustration_threshold?: number;
  };
  action: 'create_ticket' | 'notify_human' | 'transfer_call';
  action_config: {
    ticket_system?: string;
    notification_channel?: string;
    transfer_number?: string;
  };
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HumanHandoffEvent {
  id: number;
  conversation_outcome_id: number;
  escalation_policy_id: number | null;
  trigger_reason: string | null;
  handoff_status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  context_summary: string | null;
  intent: string | null;
  transcript_excerpt: string | null;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string;
  updated_at: string;
  conversation_outcome?: ConversationOutcome;
  escalation_policy?: EscalationPolicy | null;
}

export interface FailureReason {
  id: number;
  conversation_outcome_id: number;
  reason_code: string;
  reason_category: 'agent_limitation' | 'user_issue' | 'integration_failure' | 'system_error';
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  conversation_outcome?: ConversationOutcome;
}

export interface SupportDashboardData {
  resolution_rate: number;
  avg_handle_time: string;
  escalation_rate: number;
  top_unresolved_topics: Array<{
    reason_code: string;
    count: number;
    description: string;
  }>;
  cost_avoided: number;
  trends: {
    daily: Array<{
      date: string;
      total: number;
      successful: number;
      failed: number;
      escalated: number;
    }>;
    resolution_rate_trend: {
      change_percent: number;
      direction: 'up' | 'down' | 'stable';
    };
    escalation_rate_trend: {
      change_percent: number;
      direction: 'up' | 'down' | 'stable';
    };
  };
  total_conversations: number;
  successful_conversations: number;
  failed_conversations: number;
  escalated_conversations: number;
}

export interface SalesDashboardData {
  meetings_booked: number;
  qualification_rate: number;
  objection_breakdown: Array<{
    reason_code: string;
    count: number;
    description: string;
  }>;
  cost_per_meeting: number;
  pipeline_influenced: {
    qualified_leads: number;
    booked_meetings: number;
    conversion_rate: number;
  };
  trends: {
    daily: Array<{
      date: string;
      total: number;
      meetings_booked: number;
      qualified: number;
      failed: number;
    }>;
    meetings_trend: {
      change_percent: number;
      direction: 'up' | 'down' | 'stable';
    };
    qualification_trend: {
      change_percent: number;
      direction: 'up' | 'down' | 'stable';
    };
  };
  total_conversations: number;
  successful_conversations: number;
  failed_conversations: number;
}

export interface FailureBreakdownData {
  reason_code: string;
  reason_category: string;
  count: number;
}

export interface OutcomeAnalysisData {
  success_rate_by_version: Array<{
    version_date: string;
    total: number;
    successful: number;
    failed: number;
    escalated: number;
    success_rate: number;
  }>;
  prompt_correlation: {
    total_conversations: number;
    success_rate: number;
    avg_confidence: number;
    top_failure_reasons: Array<{
      reason_code: string;
      count: number;
    }>;
  };
  improvement_suggestions: Array<{
    type: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  overall_metrics: {
    total_conversations: number;
    success_rate: number;
    escalation_rate: number;
    avg_cost: number;
    avg_duration: string;
  };
}
