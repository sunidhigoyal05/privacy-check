import { Card, CardBody, Chip } from '@nextui-org/react';
import { useAssessmentStore } from '../../../store/assessmentStore';
import { HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi2';

export default function StepReview() {
  const { draft } = useAssessmentStore();

  const sections = [
    {
      title: 'Project Details',
      complete: !!draft.project_name,
      items: [
        { label: 'Name', value: draft.project_name },
        { label: 'Description', value: draft.project_description || '—' },
        { label: 'Team', value: draft.project_team || '—' },
        { label: 'Timeline', value: draft.project_timeline || '—' },
      ],
    },
    {
      title: 'Data Types',
      complete: (draft.data_types?.length || 0) > 0,
      items: [
        { label: 'Selected', value: draft.data_types?.join(', ') || 'None' },
        { label: 'Custom', value: draft.data_types_custom || '—' },
      ],
    },
    {
      title: 'Data Subjects',
      complete: (draft.data_subjects?.length || 0) > 0,
      items: [
        { label: 'Subjects', value: draft.data_subjects?.join(', ') || 'None' },
        { label: 'Volume', value: draft.data_volume || '—' },
        { label: 'Retention', value: draft.data_retention || '—' },
      ],
    },
    {
      title: 'AI Involvement',
      complete: true,
      items: [
        { label: 'AI Involved', value: draft.ai_involved ? 'Yes' : 'No' },
        ...(draft.ai_involved ? [
          { label: 'Model Type', value: draft.ai_details?.model_type || '—' },
          { label: 'Automated Decisions', value: draft.ai_details?.automated_decisions ? 'Yes' : 'No' },
        ] : []),
      ],
    },
    {
      title: 'Regulations',
      complete: true,
      items: [
        { label: 'Frameworks', value: draft.regulatory_frameworks?.join(', ') || 'None selected' },
      ],
    },
    {
      title: 'Safeguards',
      complete: true,
      items: [
        { label: 'In Place', value: draft.existing_safeguards?.join(', ') || 'None selected' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Review Your Assessment</h3>
        <p className="text-sm text-gray-500 mt-1">Review the information below before submitting.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sections.map((section) => (
          <Card key={section.title} className="border border-gray-100 shadow-none">
            <CardBody className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                {section.complete ? (
                  <HiOutlineCheckCircle className="text-success" size={18} />
                ) : (
                  <HiOutlineExclamationCircle className="text-warning" size={18} />
                )}
                <p className="text-sm font-semibold text-gray-800">{section.title}</p>
              </div>
              {section.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="text-gray-700 text-right max-w-[200px] truncate">{item.value}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        ))}
      </div>

      {!draft.project_name && (
        <div className="bg-warning-50 text-warning-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <HiOutlineExclamationCircle size={18} />
          Please provide a project name before submitting.
        </div>
      )}
    </div>
  );
}
