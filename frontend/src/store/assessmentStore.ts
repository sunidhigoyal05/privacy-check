import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Assessment, AssessmentCreate, NavSection, WizardStep } from '../types';

interface AssessmentStore {
  // Current assessment
  currentAssessment: Assessment | null;
  setCurrentAssessment: (assessment: Assessment | null) => void;

  // Wizard draft (before submission)
  draft: Partial<AssessmentCreate>;
  updateDraft: (data: Partial<AssessmentCreate>) => void;
  resetDraft: () => void;

  // Wizard navigation
  wizardStep: WizardStep;
  setWizardStep: (step: WizardStep) => void;

  // App navigation
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;

  // Loading states
  loading: Record<string, boolean>;
  setLoading: (key: string, value: boolean) => void;

  // Saved assessments list
  savedAssessments: Assessment[];
  setSavedAssessments: (assessments: Assessment[]) => void;
}

const initialDraft: Partial<AssessmentCreate> = {
  project_name: '',
  project_description: '',
  project_team: '',
  project_timeline: '',
  data_types: [],
  data_types_custom: '',
  data_subjects: [],
  data_volume: '',
  data_retention: '',
  ai_involved: false,
  ai_details: undefined,
  regulatory_frameworks: [],
  existing_safeguards: [],
};

export const useAssessmentStore = create<AssessmentStore>()(
  persist(
    (set) => ({
      currentAssessment: null,
      setCurrentAssessment: (assessment) => set({ currentAssessment: assessment }),

      draft: { ...initialDraft },
      updateDraft: (data) => set((state) => ({ draft: { ...state.draft, ...data } })),
      resetDraft: () => set({ draft: { ...initialDraft }, wizardStep: 'project-details' }),

      wizardStep: 'project-details',
      setWizardStep: (step) => set({ wizardStep: step }),

      activeSection: 'intake',
      setActiveSection: (section) => set({ activeSection: section }),

      loading: {},
      setLoading: (key, value) => set((state) => ({ loading: { ...state.loading, [key]: value } })),

      savedAssessments: [],
      setSavedAssessments: (assessments) => set({ savedAssessments: assessments }),
    }),
    {
      name: 'privacycheck-storage',
      partialize: (state) => ({
        draft: state.draft,
        wizardStep: state.wizardStep,
        currentAssessment: state.currentAssessment,
      }),
    }
  )
);
