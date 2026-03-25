export interface AIDetails {
  model_type?: string;
  training_data_description?: string;
  automated_decisions?: boolean;
  decision_description?: string;
  model_transparency?: string;
}

export interface Assessment {
  id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  status: string;
  project_name: string;
  project_description?: string;
  project_team?: string;
  project_timeline?: string;
  data_types: string[];
  data_types_custom?: string;
  data_subjects: string[];
  data_volume?: string;
  data_retention?: string;
  ai_involved: boolean;
  ai_details?: AIDetails;
  regulatory_frameworks: string[];
  existing_safeguards: string[];
  privacy_analysis?: PrivacyAnalysis;
  pet_recommendations?: PETRecommendations;
  bias_analysis?: BiasAnalysis;
  stakeholder_map?: StakeholderMap;
  premortem_analysis?: PreMortemAnalysis;
  governance_map?: GovernanceMap;
}

export interface AssessmentCreate {
  project_name: string;
  project_description?: string;
  project_team?: string;
  project_timeline?: string;
  data_types: string[];
  data_types_custom?: string;
  data_subjects: string[];
  data_volume?: string;
  data_retention?: string;
  ai_involved: boolean;
  ai_details?: AIDetails;
  regulatory_frameworks: string[];
  existing_safeguards: string[];
}

export interface PrivacyAnalysis {
  risk_scores: Record<string, number>;
  risk_heatmap: Array<Record<string, number | string>>;
  technical_debt: Array<{ issue: string; severity: string }>;
  regulatory_gaps: string[];
  summary: string;
}

export interface PETRecommendation {
  name: string;
  suitability_score: number;
  rationale: string;
  use_case: string;
  risk_mitigated: string;
  architecture_pattern: string;
  tradeoffs: string;
  implementation_guidance: string;
  implementation_guidance_detailed: string;
  deployment_considerations: string;
  human_oversight: string;
  monitoring_metrics: string[];
}

export interface PETRecommendations {
  recommendations: PETRecommendation[];
  summary: string;
}

export interface BiasRiskScenario {
  scenario: string;
  likelihood: string;
  impact: string;
}

export interface HarmScenario {
  category: string;
  description: string;
}

export interface BiasAnalysis {
  bias_risk_scenarios: BiasRiskScenario[];
  data_representation_questions: string[];
  harm_scenarios: HarmScenario[];
  fairness_practices: string[];
  engagement_recommendations: string[];
  summary: string;
}

export interface StakeholderMap {
  primary_users: string[];
  affected_groups: string[];
  indirectly_affected_groups: string[];
}

export interface FailureScenario {
  title: string;
  narrative: string;
  likelihood: number;
  impact: number;
  category: string;
  preventative_suggestions: string[];
  human_oversight_recommendations: string[];
  early_warning_indicators: string[];
}

export interface PreMortemAnalysis {
  failure_scenarios: FailureScenario[];
  analytical_summary: string;
  top_priorities: string[];
}

export interface RACIMatrix {
  roles: string[];
  responsibilities: Record<string, Record<string, string>>;
}

export interface DecisionRight {
  decision: string;
  owner: string;
  escalation: string;
}

export interface AccountabilityItem {
  item: string;
  owner: string;
  done: boolean;
}

export interface GovernanceMap {
  raci_matrix: RACIMatrix;
  decision_rights: DecisionRight[];
  accountability_checklist: AccountabilityItem[];
  summary: string;
}

export interface DashboardData {
  overall_risk_score: number;
  module_scores: {
    privacy: number;
    bias: number;
    premortem: number;
  };
  completion_status: Record<string, boolean>;
  privacy_analysis?: PrivacyAnalysis;
  pet_recommendations?: PETRecommendations;
  bias_analysis?: BiasAnalysis;
  stakeholder_map?: StakeholderMap;
  premortem_analysis?: PreMortemAnalysis;
  governance_map?: GovernanceMap;
}

export interface FullReport {
  project_info: {
    name: string;
    description?: string;
    team?: string;
    timeline?: string;
    data_types: string[];
    data_subjects: string[];
    ai_involved: boolean;
  };
  executive_summary: {
    executive_summary: string;
    key_findings: string[];
    priority_actions: string[];
    overall_risk_level: string;
  };
  privacy_analysis?: PrivacyAnalysis;
  pet_recommendations?: PETRecommendations;
  bias_analysis?: BiasAnalysis;
  stakeholder_map?: StakeholderMap;
  premortem_analysis?: PreMortemAnalysis;
  governance_map?: GovernanceMap;
}

// Wizard step tracking
export type WizardStep =
  | 'project-details'
  | 'data-types'
  | 'data-subjects'
  | 'ai-involvement'
  | 'regulations'
  | 'safeguards'
  | 'review';

export type NavSection =
  | 'intake'
  | 'privacy-lab'
  | 'bias-lab'
  | 'governance'
  | 'dashboard'
  | 'report';

// Auth types
export interface UserCreate {
  email: string;
  password: string;
  full_name?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}
