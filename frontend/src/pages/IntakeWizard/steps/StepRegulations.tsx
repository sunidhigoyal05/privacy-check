import { Checkbox, CheckboxGroup } from '@nextui-org/react';
import { useAssessmentStore } from '../../../store/assessmentStore';

const REGULATIONS = [
  { value: 'gdpr', label: 'GDPR (EU General Data Protection Regulation)', desc: 'European data protection law' },
  { value: 'wbg-policy', label: 'World Bank Group Data Privacy Policy', desc: 'Internal WBG privacy guidelines' },
  { value: 'ccpa', label: 'CCPA / CPRA (California)', desc: 'California consumer privacy laws' },
  { value: 'lgpd', label: 'LGPD (Brazil)', desc: 'Brazilian data protection law' },
  { value: 'popia', label: 'POPIA (South Africa)', desc: 'South African privacy law' },
  { value: 'pdpa', label: 'PDPA (various ASEAN countries)', desc: 'Data protection laws in Southeast Asia' },
  { value: 'hipaa', label: 'HIPAA (US Health Data)', desc: 'US health information privacy' },
  { value: 'local-laws', label: 'Local Data Protection Laws', desc: 'Country-specific regulations' },
  { value: 'ai-act', label: 'EU AI Act', desc: 'European AI regulation framework' },
  { value: 'other', label: 'Other / Not Sure', desc: 'Additional or unknown regulations' },
];

export default function StepRegulations() {
  const { draft, updateDraft } = useAssessmentStore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Regulatory Frameworks</h3>
        <p className="text-sm text-gray-500 mt-1">Which data protection regulations may apply to this project?</p>
      </div>

      <CheckboxGroup
        value={draft.regulatory_frameworks || []}
        onValueChange={(val) => updateDraft({ regulatory_frameworks: val })}
        classNames={{ wrapper: 'gap-3' }}
      >
        <div className="grid grid-cols-2 gap-3">
          {REGULATIONS.map((reg) => (
            <Checkbox
              key={reg.value}
              value={reg.value}
              classNames={{
                base: 'inline-flex w-full max-w-full bg-[#141420] hover:bg-[#1A1A28] rounded-xl px-4 py-3 border-2 border-transparent data-[selected=true]:border-primary-500 transition-all m-0',
                label: 'w-full',
              }}
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{reg.label}</p>
                <p className="text-xs text-gray-500">{reg.desc}</p>
              </div>
            </Checkbox>
          ))}
        </div>
      </CheckboxGroup>
    </div>
  );
}
