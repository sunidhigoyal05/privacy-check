import { Checkbox, CheckboxGroup } from '@nextui-org/react';
import { useAssessmentStore } from '../../../store/assessmentStore';
import SpeechTextarea from '../../../components/common/SpeechTextarea';

const DATA_TYPES = [
  { value: 'pii', label: 'Personally Identifiable Information (PII)', desc: 'Names, addresses, phone numbers, ID numbers' },
  { value: 'financial', label: 'Financial Data', desc: 'Income, bank accounts, transaction records' },
  { value: 'health', label: 'Health Data', desc: 'Medical records, health status, disability info' },
  { value: 'biometric', label: 'Biometric Data', desc: 'Fingerprints, facial recognition, iris scans' },
  { value: 'location', label: 'Location Data', desc: 'GPS, addresses, movement patterns' },
  { value: 'behavioral', label: 'Behavioral Data', desc: 'Usage patterns, preferences, activity logs' },
  { value: 'demographic', label: 'Demographic Data', desc: 'Age, gender, ethnicity, religion, language' },
  { value: 'education', label: 'Education Data', desc: 'School records, literacy, qualifications' },
  { value: 'employment', label: 'Employment Data', desc: 'Job history, salary, employer details' },
  { value: 'communications', label: 'Communications Data', desc: 'Emails, messages, call records' },
  { value: 'not-sure', label: "Not Sure Yet / Don't Know", desc: 'Skip for now — you can update this later' },
];

export default function StepDataTypes() {
  const { draft, updateDraft } = useAssessmentStore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Data Types</h3>
        <p className="text-sm text-gray-500 mt-1">What types of data will this project collect or process?</p>
      </div>

      <CheckboxGroup
        value={draft.data_types || []}
        onValueChange={(val) => updateDraft({ data_types: val })}
        classNames={{ wrapper: 'gap-3' }}
      >
        <div className="grid grid-cols-2 gap-3">
          {DATA_TYPES.map((dt) => (
            <Checkbox
              key={dt.value}
              value={dt.value}
              classNames={{
                base: 'inline-flex w-full max-w-full bg-[#141420] hover:bg-[#1A1A28] rounded-xl px-4 py-3 border-2 border-transparent data-[selected=true]:border-primary-500 transition-all m-0',
                label: 'w-full',
              }}
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{dt.label}</p>
                <p className="text-xs text-gray-500">{dt.desc}</p>
              </div>
            </Checkbox>
          ))}
        </div>
      </CheckboxGroup>

      <SpeechTextarea
        label="Other Data Types"
        placeholder="Describe any additional data types not listed above..."
        value={draft.data_types_custom || ''}
        onValueChange={(val) => updateDraft({ data_types_custom: val })}
        variant="bordered"
        minRows={2}
        classNames={{ inputWrapper: 'border-gray-200' }}
      />
    </div>
  );
}
