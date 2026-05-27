import { CategoryKey, StatusKey } from './constants'

export interface Report {
  id: string
  reporter_clerk_id: string
  reporter_name: string
  reporter_email?: string
  title: string
  description: string
  category: CategoryKey
  latitude: number
  longitude: number
  address_text?: string
  municipality: string
  neighbourhood?: string
  photo_url?: string
  photo_path?: string
  status: StatusKey
  upvotes: number
  views: number
  created_at: string
  updated_at: string
  resolved_at?: string
}

export interface ReportComment {
  id: string
  report_id: string
  clerk_user_id: string
  author_name: string
  content: string
  is_official: boolean
  created_at: string
}

export interface StatusHistory {
  id: string
  report_id: string
  old_status?: string
  new_status: string
  changed_by_clerk_id: string
  note?: string
  created_at: string
}

export interface ReportUpvote {
  id: string
  report_id: string
  clerk_user_id: string
  created_at: string
}
