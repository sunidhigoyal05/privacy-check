import { Checkbox, CheckboxGroup, Select, SelectItem } from '@nextui-org/react';
import { useAssessmentStore } from '../../../store/assessmentStore';

const DATA_SUBJECTS = [
  { value: 'employees', label: 'World Bank Employees / Staff' },
  { value: 'citizens', label: 'Citizens / General Population' },
  { value: 'beneficiaries', label: 'Program Beneficiaries' },
  { value: 'minors', label: 'Children / Minors' },
  { value: 'refugees', label: 'Refugees / Displaced Persons' },
  { value: 'indigenous', label: 'Indigenous Peoples' },
  { value: 'vulnerable', label: 'Vulnerable Populations' },
  { value: 'government', label: 'Government Officials' },
  { value: 'partners', label: 'Partner Organizations' },
  { value: 'contractors', label: 'Contractors / Vendors' },
];

const VOLUME_OPTIONS = [
  { value: 'small', label: 'Small (< 1,000 records)' },
  { value: 'medium', label: 'Medium (1,000 – 100,000 records)' },
  { value: 'large', label: 'Large (100,000 – 1M records)' },
  { value: 'very-large', label: 'Very Large (> 1M records)' },
];

const RETENTION_OPTIONS = [
  { value: '6-months', label: 'Up to 6 months' },
  { value: '1-year', label: '1 year' },
  { value: '3-years', label: '1–3 years' },
  { value: '5-years', label: '3–5 years' },
  { value: '10-years', label: '5–10 years' },
  { value: 'indefinite', label: 'Indefinite / Not determined' },
];

export default function StepDataSubjects() {
  const { draft, updateDraft } = useAssessmentStore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Data Subjects & Volume</h3>
        <p className="text-sm text-gray-500 mt-1">Who does the data relate to, and how much will you handle?</p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Data Subjects (who is the data about?)</p>
        <CheckboxGroup
          value={draft.data_subjects || []}
          onValueChange={(val) => updateDraft({ data_subjects: val })}
          classNames={{ wrapper: 'gap-2' }}
        >
          <div className="grid grid-cols-2 gap-2">
            {DATA_SUBJECTS.map((ds) => (
              <Checkbox
                key={ds.value}
                value={ds.value}
                classNames={{
                  base: 'inline-flex w-full max-w-full bg-gray-50 hover:bg-primary-50 rounded-lg px-4 py-2.5 border-2 border-transparent data-[selected=true]:border-primary-400 transition-all m-0',
                }}
              >
                <span className="text-sm">{ds.label}</span>
              </Checkbox>
            ))}
          </div>
        </CheckboxGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Expected Data Volume"
          placeholder="Select volume"
          selectedKeys={draft.data_volume ? [draft.data_volume] : []}
          onSelectionChange={(keys) => {
            const val = Array.from(keys)[0] as string;
            updateDraft({ data_volume: val });
          }}
          variant="bordered"
          classNames={{ trigger: 'border-gray-200' }}
        >
          {VOLUME_OPTIONS.map((opt) => (
            <SelectItem key={opt.value}>{opt.label}</SelectItem>
          ))}
        </Select>

        <Select
          label="Data Retention Period"
          placeholder="Select retention"
          selectedKeys={draft.data_retention ? [draft.data_retention] : []}
          onSelectionChange={(keys) => {
            const val = Array.from(keys)[0] as string;
            updateDraft({ data_retention: val });
          }}
          variant="bordered"
          classNames={{ trigger: 'border-gray-200' }}
        >
          {RETENTION_OPTIONS.map((opt) => (
            <SelectItem key={opt.value}>{opt.label}</SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
}
