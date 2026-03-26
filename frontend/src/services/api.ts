import axios from 'axios';
import type {
  Assessment, AssessmentCreate, PrivacyAnalysis, PETRecommendations,
  BiasAnalysis, PreMortemAnalysis, GovernanceMap, DashboardData, FullReport,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// — Response interceptor: global error handling —
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    // Dispatch a custom event that the toast system listens to
    window.dispatchEvent(new CustomEvent('api-error', { detail: message }));

    return Promise.reject(error);
  }
);

// Assessment CRUD
export const createAssessment = (data: AssessmentCreate) =>
  api.post<Assessment>('/assessments/', data).then(r => r.data);

export const getAssessment = (id: string) =>
  api.get<Assessment>(`/assessments/${id}`).then(r => r.data);

export const updateAssessment = (id: string, data: Partial<AssessmentCreate>) =>
  api.patch<Assessment>(`/assessments/${id}`, data).then(r => r.data);

export const listAssessments = () =>
  api.get<Assessment[]>('/assessments/').then(r => r.data);

// Privacy Lab
export const runPrivacyAnalysis = (assessment_id: string) =>
  api.post<PrivacyAnalysis>('/privacy-lab/analyze', { assessment_id }).then(r => r.data);

export const getPETRecommendations = (assessment_id: string) =>
  api.post<PETRecommendations>('/privacy-lab/pet-recommendations', { assessment_id }).then(r => r.data);

// Bias Lab
export const runBiasAnalysis = (assessment_id: string, primary_users: string[], affected_groups: string[], indirectly_affected_groups: string[]) =>
  api.post<BiasAnalysis>('/bias-lab/analyze', { assessment_id, primary_users, affected_groups, indirectly_affected_groups }).then(r => r.data);

export const suggestStakeholders = (assessment_id: string, primary_users: string[], affected_groups: string[]) =>
  api.post('/bias-lab/suggest-stakeholders', { assessment_id, primary_users, affected_groups }).then(r => r.data);

export const runPreMortem = (assessment_id: string, scenario_responses?: Record<string, string>) =>
  api.post<PreMortemAnalysis>('/bias-lab/premortem', { assessment_id, scenario_responses }).then(r => r.data);

// Governance
export const generateGovernance = (assessment_id: string, roles: string[], responsibilities: string[]) =>
  api.post<GovernanceMap>('/governance/generate', { assessment_id, roles, responsibilities }).then(r => r.data);

// Dashboard & Report
export const getDashboardData = (assessment_id: string) =>
  api.get<DashboardData>(`/reports/${assessment_id}/dashboard`).then(r => r.data);

export const generateReport = (assessment_id: string) =>
  api.post<FullReport>(`/reports/${assessment_id}/generate`).then(r => r.data);
