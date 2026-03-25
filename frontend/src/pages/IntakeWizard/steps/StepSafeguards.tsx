import { Checkbox, CheckboxGroup } from '@nextui-org/react';
import { useAssessmentStore } from '../../../store/assessmentStore';

const SAFEGUARDS = [
  { value: 'encryption-transit', label: 'Encryption in Transit (TLS/HTTPS)' },
  { value: 'encryption-rest', label: 'Encryption at Rest' },
  { value: 'access-controls', label: 'Role-Based Access Controls (RBAC)' },
  { value: 'audit-trail', label: 'Audit Trail / Logging' },
  { value: 'consent-management', label: 'Consent Management System' },
  { value: 'anonymization', label: 'Data Anonymization / Pseudonymization' },
  { value: 'dpia', label: 'Data Protection Impact Assessment (DPIA)' },
  { value: 'retention-policy', label: 'Data Retention & Deletion Policy' },
  { value: 'incident-response', label: 'Incident Response Plan' },
  { value: 'training', label: 'Staff Privacy Training' },
  { value: 'dpo', label: 'Data Protection Officer / Privacy Lead Assigned' },
  { value: 'vendor-assessment', label: 'Third-Party Vendor Assessments' },
];

export default function StepSafeguards() {
  const { draft, updateDraft } = useAssessmentStore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Existing Safeguards</h3>
        <p className="text-sm text-gray-500 mt-1">What privacy and security safeguards are already in place or planned?</p>
      </div>

      <CheckboxGroup
        value={draft.existing_safeguards || []}
        onValueChange={(val) => updateDraft({ existing_safeguards: val })}
        classNames={{ wrapper: 'gap-2' }}
      >
        <div className="grid grid-cols-2 gap-2">
          {SAFEGUARDS.map((sg) => (
            <Checkbox
              key={sg.value}
              value={sg.value}
              classNames={{
                base: 'inline-flex w-full max-w-full bg-gray-50 hover:bg-primary-50 rounded-lg px-4 py-2.5 border-2 border-transparent data-[selected=true]:border-primary-400 transition-all m-0',
              }}
            >
              <span className="text-sm">{sg.label}</span>
            </Checkbox>
          ))}
        </div>
      </CheckboxGroup>
    </div>
  );
}
