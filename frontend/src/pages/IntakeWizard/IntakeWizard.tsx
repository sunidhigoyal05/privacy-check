import { useState } from 'react';
import { Button, Progress } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssessmentStore } from '../../store/assessmentStore';
import { createAssessment } from '../../services/api';
import type { WizardStep, AssessmentCreate } from '../../types';
import StepProjectDetails from './steps/StepProjectDetails';
import StepDataTypes from './steps/StepDataTypes';
import StepDataSubjects from './steps/StepDataSubjects';
import StepAIInvolvement from './steps/StepAIInvolvement';
import StepRegulations from './steps/StepRegulations';
import StepSafeguards from './steps/StepSafeguards';
import StepReview from './steps/StepReview';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'project-details', label: 'Project Details' },
  { id: 'data-types', label: 'Data Types' },
  { id: 'data-subjects', label: 'Data Subjects' },
  { id: 'ai-involvement', label: 'AI Involvement' },
  { id: 'regulations', label: 'Regulations' },
  { id: 'safeguards', label: 'Safeguards' },
  { id: 'review', label: 'Review & Submit' },
];

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function IntakeWizard() {
  const { draft, wizardStep, setWizardStep, setCurrentAssessment, setActiveSection, setLoading, loading } = useAssessmentStore();
  const [error, setError] = useState<string | null>(null);

  const currentIndex = STEPS.findIndex(s => s.id === wizardStep);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  const goNext = () => {
    if (currentIndex < STEPS.length - 1) {
      setWizardStep(STEPS[currentIndex + 1].id);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setWizardStep(STEPS[currentIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    setLoading('submit', true);
    setError(null);
    try {
      const assessment = await createAssessment(draft as AssessmentCreate);
      setCurrentAssessment(assessment);
      setActiveSection('privacy-lab');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create assessment. Make sure the backend is running.');
    } finally {
      setLoading('submit', false);
    }
  };

  const canContinue = (): boolean => {
    switch (wizardStep) {
      case 'project-details': return !!draft.project_name?.trim();
      case 'data-types': return (draft.data_types?.length ?? 0) > 0;
      case 'data-subjects': return (draft.data_subjects?.length ?? 0) > 0;
      default: return true;
    }
  };

  const renderStep = () => {
    switch (wizardStep) {
      case 'project-details': return <StepProjectDetails />;
      case 'data-types': return <StepDataTypes />;
      case 'data-subjects': return <StepDataSubjects />;
      case 'ai-involvement': return <StepAIInvolvement />;
      case 'regulations': return <StepRegulations />;
      case 'safeguards': return <StepSafeguards />;
      case 'review': return <StepReview />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Start Your Assessment</h2>
        <p className="text-gray-500 mt-1">Tell us about your project so we can assess its privacy risks.</p>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs text-gray-400">
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              onClick={() => setWizardStep(step.id)}
              className={`transition-colors ${i <= currentIndex ? 'text-primary-600 font-medium' : 'text-gray-400'}`}
            >
              {step.label}
            </button>
          ))}
        </div>
        <Progress
          value={progress}
          color="primary"
          size="sm"
          className="max-w-full"
        />
      </div>

      {/* Step Content */}
      <div className="bg-[#0E0E1A] rounded-2xl border border-[#1E1E2E] p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={wizardStep}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-danger-50 text-danger-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="flat"
          onPress={goBack}
          isDisabled={currentIndex === 0}
          className="text-gray-600"
        >
          Back
        </Button>

        {wizardStep === 'review' ? (
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={loading['submit']}
            className="px-8 font-medium"
          >
            Submit Assessment
          </Button>
        ) : (
          <Button
            color="primary"
            onPress={goNext}
            isDisabled={!canContinue()}
            className="px-8 font-medium"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
