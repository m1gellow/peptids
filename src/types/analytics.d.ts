/**
 * Типы данных для аналитики
 */

export interface VisitorData {
  visitor_id: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  landing_page?: string;
  country?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  user_id?: string;
  is_registered?: boolean;
  first_visit?: string;
  last_visit?: string;
  total_sessions?: number;
  total_page_views?: number;
}

export interface PageViewData {
  visitor_id: string;
  session_id: string;
  page_url: string;
  page_title?: string;
  referrer?: string;
  time_on_page?: number;
  is_bounce?: boolean;
  user_id?: string;
}

export interface BrowserInfo {
  browser: string;
  os: string;
  deviceType: string;
}