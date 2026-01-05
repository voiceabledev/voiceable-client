import { Calendar, Info, MessageSquare, MapPin, Wrench, TrendingUp, UserPlus, PhoneForwarded, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PrimaryOutcome {
  value: string;
  label: string;
  type: 'support' | 'sales' | 'general';
  icon: LucideIcon;
  category?: 'retail' | 'scheduling' | 'recruitment'; // Optional category for filtering
}

export const PRIMARY_OUTCOMES: PrimaryOutcome[] = [
  // Sales outcomes
  { value: 'lead_converted', label: 'Lead Converted', type: 'sales', icon: TrendingUp },
  // General outcomes (used across all categories)
  { value: 'location_hours_provided', label: 'Location & Hours Provided', type: 'general', icon: MapPin },
  { value: 'feedback_collected', label: 'Feedback Collected', type: 'general', icon: MessageSquare },
  { value: 'issue_resolved', label: 'Issue Resolved', type: 'support', icon: Wrench },
  // Scheduling/Q&A/CRM outcomes (for Landing2)
  { value: 'appointment_booked', label: 'Appointment Booked', type: 'sales', icon: Calendar, category: 'scheduling' },
  { value: 'appointment_rescheduled', label: 'Appointment Rescheduled', type: 'sales', icon: Calendar, category: 'scheduling' },
  { value: 'lead_qualified', label: 'Lead Qualified', type: 'sales', icon: UserPlus, category: 'scheduling' },
  { value: 'lead_captured', label: 'Lead Captured', type: 'sales', icon: UserPlus, category: 'scheduling' },
  { value: 'information_provided', label: 'Information Provided', type: 'general', icon: Info, category: 'scheduling' },
  { value: 'question_answered', label: 'Question Answered', type: 'general', icon: MessageSquare, category: 'scheduling' },
  { value: 'follow_up_completed', label: 'Follow-up Completed', type: 'sales', icon: RefreshCw, category: 'scheduling' },
  { value: 'call_transferred', label: 'Call Transferred', type: 'support', icon: PhoneForwarded, category: 'scheduling' },
];
