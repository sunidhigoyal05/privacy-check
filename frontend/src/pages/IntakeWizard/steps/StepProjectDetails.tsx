import { Input } from '@nextui-org/react';
import { useAssessmentStore } from '../../../store/assessmentStore';
import SpeechTextarea from '../../../components/common/SpeechTextarea';
import SpeechInput from '../../../components/common/SpeechInput';

export default function StepProjectDetails() {
  const { draft, updateDraft } = useAssessmentStore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
        <p className="text-sm text-gray-500 mt-1">Provide basic information about your project.</p>
      </div>

      <div className="space-y-5">
        <SpeechInput
          label="Project Name"
          placeholder="e.g., Beneficiary Identification System"
          value={draft.project_name || ''}
          onValueChange={(val) => updateDraft({ project_name: val })}
          variant="bordered"
          isRequired
          classNames={{ inputWrapper: 'border-gray-200' }}
        />

        <SpeechTextarea
          label="Project Description"
          placeholder="Describe the project's objectives, scope, and what data it will handle..."
          value={draft.project_description || ''}
          onValueChange={(val) => updateDraft({ project_description: val })}
          variant="bordered"
          minRows={3}
          classNames={{ inputWrapper: 'border-gray-200' }}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Team / Department"
            placeholder="e.g., Poverty & Equity GP"
            value={draft.project_team || ''}
            onValueChange={(val) => updateDraft({ project_team: val })}
            variant="bordered"
            classNames={{ inputWrapper: 'border-gray-200' }}
          />
          <Input
            label="Timeline"
            placeholder="e.g., Q1 2026 – Q4 2027"
            value={draft.project_timeline || ''}
            onValueChange={(val) => updateDraft({ project_timeline: val })}
            variant="bordered"
            classNames={{ inputWrapper: 'border-gray-200' }}
          />
        </div>
      </div>
    </div>
  );
}
