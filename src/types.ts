export interface Appraisal {
  id: string;
  company_name: string;
  status: 'Draft' | 'Completed' | 'Rejected';
  risk_score: number;
  recommendation: string;
  cam_content: string;
  loan_limit?: string;
  interest_rate?: string;
  risk_categories?: {
    financial: number;
    legal: number;
    sector: number;
    operational: number;
    management: number;
  };
  created_at: string;
  input_data: AppraisalInput;
}

export interface AppraisalInput {
  companyName: string;
  industry: string;
  financialData: string;
  unstructuredDocs: string;
  externalIntelligence: string;
  dueDiligence: string;
}

export enum RiskCategory {
  LOW = "Low Risk",
  MODERATE = "Moderate Risk",
  HIGH = "High Risk",
  REJECT = "Reject"
}

export interface AuditLog {
  id: number;
  user_email: string;
  action: string;
  entity_id: string;
  entity_name: string;
  timestamp: string;
}
