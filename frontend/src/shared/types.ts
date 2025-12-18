export interface DashboardStats {
  total_emails_sent: number;
  total_responses: number;
  response_rate: number;
  interest_count: number;
  decline_count: number;
  faq_count: number;
  other_count: number;
  escalations: number;
  recent_responses: number;
  top_companies: string[];
}

export interface ReplyIn {
  company: string;
  reply_text: string;
}

export interface ReplyOut {
  company: string;
  reply_text: string;
  predicted_intent: string;
  confidence: number;
  human_involved: boolean;
}

export interface OutreachLog {
  company: string;
  email: string;
  status: string;
  delivery_status: boolean;
  opened: boolean;
  opened_at?: string;
  email_sent_at?: string;
  followup_scheduled?: string;
}

export interface ProjectCatalogItem {
  id: number;
  company: string;
  title: string;
  description: string;
  duration_weeks: number;
  roles: Array<{ role: string; skills: string[] }>;
  competencies: string[];
}

export interface DailyStat {
  date: string;
  responses: number;
  interest: number;
  decline: number;
  faq: number;
}

export interface DashboardDetails {
  period_days: number;
  total_responses: number;
  total_emails_sent: number;
  escalation_rate: number;
  avg_confidence: number;
  daily_stats: DailyStat[];
}
