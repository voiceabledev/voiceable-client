import { CheckCircle2, Calendar, Package, Truck, X, Info, MessageSquare, MapPin, RotateCcw, Wrench, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PrimaryOutcome {
  value: string;
  label: string;
  type: 'support' | 'sales' | 'general';
  icon: LucideIcon;
}

export const PRIMARY_OUTCOMES: PrimaryOutcome[] = [
  // Support outcomes - Order Management (most emphasized on landing page)
  { value: 'order_status_checked', label: 'Order Status Checked', type: 'support', icon: CheckCircle2 },
  { value: 'shipping_info_provided', label: 'Shipping Information Provided', type: 'support', icon: Truck },
  { value: 'tracking_provided', label: 'Tracking Provided', type: 'support', icon: Package },
  { value: 'delivery_rescheduled', label: 'Delivery Rescheduled', type: 'support', icon: Calendar },
  { value: 'return_exchange_processed', label: 'Return/Exchange Processed', type: 'support', icon: RotateCcw },
  { value: 'refund_processed', label: 'Refund Processed', type: 'support', icon: RotateCcw },
  { value: 'issue_resolved', label: 'Issue Resolved', type: 'support', icon: Wrench },
  { value: 'order_cancelled', label: 'Order Cancelled', type: 'support', icon: X },
  { value: 'special_request_handled', label: 'Special Request Handled', type: 'support', icon: CheckCircle2 },
  // Sales outcomes
  { value: 'lead_converted', label: 'Lead Converted', type: 'sales', icon: TrendingUp },
  // General outcomes
  { value: 'product_inquiry_answered', label: 'Product Inquiry Answered', type: 'general', icon: Info },
  { value: 'inventory_checked', label: 'Inventory Checked', type: 'general', icon: Package },
  { value: 'location_hours_provided', label: 'Location & Hours Provided', type: 'general', icon: MapPin },
  { value: 'feedback_collected', label: 'Feedback Collected', type: 'general', icon: MessageSquare },
];
