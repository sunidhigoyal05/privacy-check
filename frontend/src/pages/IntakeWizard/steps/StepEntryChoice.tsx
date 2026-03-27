import { useState, useRef } from 'react';
import { Button, Card, CardBody, Textarea, Chip, Checkbox, CheckboxGroup, Tooltip } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineDocumentText, HiOutlineBeaker, HiOutlineShieldCheck, HiOutlineExclamationTriangle, HiOutlineCheckCircle, HiOutlineArrowPath, HiOutlineArrowUpTray } from 'react-icons/hi2';
import { analyzeData, mapToWizardFields, DetectionResult } from '../../../utils/dataDetection';
import { useAssessmentStore } from '../../../store/assessmentStore';
import { createAssessment } from '../../../services/api';
import SpeechInput from '../../../components/common/SpeechInput';

// Labels for display
const DATA_TYPE_LABELS: Record<string, string> = {
  pii: 'Personally Identifiable Information (PII)',
  financial: 'Financial Data',
  health: 'Health Data',
  biometric: 'Biometric Data',
  location: 'Location Data',
  behavioral: 'Behavioral Data',
  demographic: 'Demographic Data',
  education: 'Education Data',
  employment: 'Employment Data',
  communications: 'Communications Data',
};

const DATA_SUBJECT_LABELS: Record<string, string> = {
  employees: 'Employees / Staff',
  citizens: 'Citizens / General Population',
  beneficiaries: 'Program Beneficiaries',
  minors: 'Children / Minors',
  refugees: 'Refugees / Displaced Persons',
  indigenous: 'Indigenous Peoples',
  vulnerable: 'Vulnerable Populations',
  government: 'Government Officials',
  partners: 'Partner Organizations',
  contractors: 'Contractors / Vendors',
};

const REGULATION_LABELS: Record<string, string> = {
  gdpr: 'GDPR (EU)',
  'wbg-policy': 'World Bank Group Data Privacy Policy',
  ccpa: 'CCPA / CPRA (California)',
  lgpd: 'LGPD (Brazil)',
  popia: 'POPIA (South Africa)',
  pdpa: 'PDPA (ASEAN)',
  hipaa: 'HIPAA (US Health)',
  'local-laws': 'Local Data Protection Laws',
  'ai-act': 'EU AI Act',
};

const SAFEGUARD_LABELS: Record<string, string> = {
  'encryption-transit': 'Encryption in Transit',
  'encryption-rest': 'Encryption at Rest',
  'access-controls': 'Access Controls (RBAC)',
  'audit-trail': 'Audit Trail / Logging',
  'consent-management': 'Consent Management',
  anonymization: 'Anonymization / Pseudonymization',
  dpia: 'DPIA',
  'retention-policy': 'Retention Policy',
  'incident-response': 'Incident Response Plan',
  training: 'Staff Privacy Training',
  dpo: 'Data Protection Officer',
  'vendor-assessment': 'Vendor Assessments',
};

type EntryMode = 'choice' | 'analyze' | 'results';

interface Props {
  onContinueManual: () => void;
}

export default function StepEntryChoice({ onContinueManual }: Props) {
  const { updateDraft, setCurrentAssessment, setActiveSection } = useAssessmentStore();
  const [mode, setMode] = useState<EntryMode>('choice');
  const [sampleData, setSampleData] = useState('');
  const [analysisResult, setAnalysisResult] = useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Editable selections from analysis
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedRegulations, setSelectedRegulations] = useState<string[]>([]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Small delay to show loading state
    setTimeout(() => {
      const result = analyzeData(sampleData);
      setAnalysisResult(result);
      
      // Pre-select detected items
      const mapped = mapToWizardFields(result);
      setSelectedTypes(mapped.data_types);
      setSelectedSubjects(mapped.data_subjects);
      setSelectedRegulations(mapped.regulatory_frameworks);
      
      setIsAnalyzing(false);
      setMode('results');
    }, 500);
  };

  const handleApplyAndContinue = async () => {
    if (!projectName.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create assessment directly with detected values
      const assessment = await createAssessment({
        project_name: projectName.trim(),
        project_description: `Auto-generated from sample data analysis. ${analysisResult?.summary || ''}`,
        data_types: selectedTypes,
        data_subjects: selectedSubjects,
        regulatory_frameworks: selectedRegulations,
        existing_safeguards: [],
        ai_involved: false,
      });
      
      setCurrentAssessment(assessment);
      setActiveSection('privacy-lab');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create assessment. Make sure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReanalyze = () => {
    setMode('analyze');
    setAnalysisResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSampleData(content);
    };
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Choice view
  if (mode === 'choice') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">How would you like to begin?</h3>
          <p className="text-sm text-gray-500 mt-1">Choose your preferred way to start the assessment.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card
            isPressable
            onPress={onContinueManual}
            className="bg-[#141420] border-2 border-transparent hover:border-primary-500/50 transition-all"
          >
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                <HiOutlineDocumentText className="text-primary-500" size={24} />
              </div>
              <h4 className="font-semibold text-gray-200 mb-2">Manual Entry</h4>
              <p className="text-sm text-gray-500">
                I know what data types, subjects, and regulations apply to my project
              </p>
            </CardBody>
          </Card>

          <Card
            isPressable
            onPress={() => setMode('analyze')}
            className="bg-[#141420] border-2 border-transparent hover:border-secondary-500/50 transition-all"
          >
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary-500/10 flex items-center justify-center mx-auto mb-4">
                <HiOutlineBeaker className="text-secondary-500" size={24} />
              </div>
              <h4 className="font-semibold text-gray-200 mb-2">Analyze Data</h4>
              <p className="text-sm text-gray-500">
                Paste sample data to auto-detect data types, subjects & regulations
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // Analyze view
  if (mode === 'analyze') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Analyze Data</h3>
          <p className="text-sm text-gray-500 mt-1">Paste sample data to auto-detect data types and privacy requirements.</p>
        </div>

        {/* Isolation Warning */}
        <div className="flex items-start gap-3 bg-warning-500/10 border border-warning-500/30 rounded-xl p-4">
          <HiOutlineShieldCheck className="text-warning-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm">
            <p className="font-medium text-warning-400">Isolated & Secure Processing</p>
            <p className="text-gray-400 mt-1">
              Your data is analyzed <strong className="text-warning-300">entirely in your browser</strong> — nothing is sent to any server or external service. 
              For maximum safety, use synthetic or anonymized sample data rather than real production data.
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-400">Paste your sample data or upload a file</label>
            <div className="flex items-center gap-2">
              {fileName && (
                <Chip size="sm" variant="flat" color="success" onClose={() => { setFileName(null); setSampleData(''); }}>
                  {fileName}
                </Chip>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                size="sm"
                variant="flat"
                startContent={<HiOutlineArrowUpTray size={14} />}
                onPress={triggerFileUpload}
              >
                Upload File
              </Button>
            </div>
          </div>
          <Textarea
            value={sampleData}
            onValueChange={setSampleData}
            placeholder={`Example CSV:
name,email,salary,department,dob
John Doe,john@example.com,75000,Engineering,1990-05-15
Jane Smith,jane@example.com,82000,Marketing,1985-12-20

Or JSON:
[{"name": "John", "email": "john@example.com", "salary": 75000}]`}
            minRows={10}
            maxRows={15}
            classNames={{
              input: 'font-mono text-xs',
              inputWrapper: 'bg-[#0A0A12] border border-[#1E1E2E]',
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="flat" onPress={() => setMode('choice')}>
            Back
          </Button>
          <Button
            color="primary"
            onPress={handleAnalyze}
            isDisabled={!sampleData.trim()}
            isLoading={isAnalyzing}
          >
            Analyze Data
          </Button>
        </div>
      </div>
    );
  }

  // Results view
  if (mode === 'results' && analysisResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Analysis Results</h3>
            <p className="text-sm text-gray-500 mt-1">Review and adjust the detected data characteristics.</p>
          </div>
          <Button
            size="sm"
            variant="flat"
            startContent={<HiOutlineArrowPath size={14} />}
            onPress={handleReanalyze}
          >
            Re-analyze
          </Button>
        </div>

        {/* Summary */}
        <div className="bg-[#141420] rounded-xl p-4">
          <p className="text-sm text-gray-300">{analysisResult.summary}</p>
        </div>

        {/* Risk Indicators */}
        {analysisResult.riskIndicators.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-warning-400 flex items-center gap-2">
              <HiOutlineExclamationTriangle size={16} />
              Risk Indicators
            </p>
            <div className="flex flex-wrap gap-2">
              {analysisResult.riskIndicators.map((indicator, i) => (
                <Chip key={i} size="sm" variant="flat" color="warning" className="text-xs">
                  {indicator}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Data Types */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-400">Detected Data Types</p>
            <CheckboxGroup
              value={selectedTypes}
              onValueChange={setSelectedTypes}
              classNames={{ wrapper: 'gap-2' }}
            >
              {analysisResult.dataTypes.map((dt) => (
                <Checkbox
                  key={dt.type}
                  value={dt.type}
                  classNames={{
                    base: 'inline-flex w-full bg-[#141420] hover:bg-[#1A1A28] rounded-lg px-3 py-2 border border-transparent data-[selected=true]:border-primary-500/50 m-0',
                  }}
                >
                  <div className="flex-1">
                    <p className="text-sm text-gray-200">{DATA_TYPE_LABELS[dt.type] || dt.type}</p>
                    <p className="text-xs text-gray-500">{dt.evidence.join('; ')}</p>
                  </div>
                </Checkbox>
              ))}
              {analysisResult.dataTypes.length === 0 && (
                <p className="text-sm text-gray-500 italic">No data types detected</p>
              )}
            </CheckboxGroup>
          </div>

          {/* Data Subjects */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-400">Likely Data Subjects</p>
            <CheckboxGroup
              value={selectedSubjects}
              onValueChange={setSelectedSubjects}
              classNames={{ wrapper: 'gap-2' }}
            >
              {analysisResult.dataSubjects.map((ds) => (
                <Checkbox
                  key={ds.subject}
                  value={ds.subject}
                  classNames={{
                    base: 'inline-flex w-full bg-[#141420] hover:bg-[#1A1A28] rounded-lg px-3 py-2 border border-transparent data-[selected=true]:border-primary-500/50 m-0',
                  }}
                >
                  <div className="flex-1">
                    <p className="text-sm text-gray-200">{DATA_SUBJECT_LABELS[ds.subject] || ds.subject}</p>
                    <p className="text-xs text-gray-500">{ds.reason}</p>
                  </div>
                </Checkbox>
              ))}
              {analysisResult.dataSubjects.length === 0 && (
                <p className="text-sm text-gray-500 italic">Could not infer data subjects</p>
              )}
            </CheckboxGroup>
          </div>

          {/* Suggested Regulations */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-400">Suggested Regulations</p>
            <CheckboxGroup
              value={selectedRegulations}
              onValueChange={setSelectedRegulations}
              classNames={{ wrapper: 'gap-2' }}
            >
              {analysisResult.suggestedRegulations.map((reg) => (
                <Tooltip key={reg.regulation} content={reg.reason} placement="right">
                  <Checkbox
                    value={reg.regulation}
                    classNames={{
                      base: 'inline-flex w-full bg-[#141420] hover:bg-[#1A1A28] rounded-lg px-3 py-2 border border-transparent data-[selected=true]:border-primary-500/50 m-0',
                    }}
                  >
                    <span className="text-sm text-gray-200">{REGULATION_LABELS[reg.regulation] || reg.regulation}</span>
                  </Checkbox>
                </Tooltip>
              ))}
              {analysisResult.suggestedRegulations.length === 0 && (
                <p className="text-sm text-gray-500 italic">No specific regulations suggested</p>
              )}
            </CheckboxGroup>
          </div>

          {/* Recommended Safeguards (read-only info) */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <HiOutlineCheckCircle size={14} className="text-success" />
              Recommended Safeguards
            </p>
            <div className="space-y-2">
              {analysisResult.recommendedSafeguards.slice(0, 8).map((sg) => (
                <div key={sg.safeguard} className="flex items-center gap-2 bg-[#141420] rounded-lg px-3 py-2">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={sg.priority === 'high' ? 'danger' : sg.priority === 'medium' ? 'warning' : 'default'}
                    className="text-[10px]"
                  >
                    {sg.priority}
                  </Chip>
                  <span className="text-sm text-gray-300">{SAFEGUARD_LABELS[sg.safeguard] || sg.safeguard}</span>
                </div>
              ))}
              {analysisResult.recommendedSafeguards.length === 0 && (
                <p className="text-sm text-gray-500 italic">No specific safeguards recommended</p>
              )}
            </div>
            <p className="text-xs text-gray-500">These are recommendations — you'll select your existing safeguards later.</p>
          </div>
        </div>

        {/* Project Name Input */}
        <div className="space-y-2 pt-4 border-t border-[#1E1E2E]">
          <label className="text-sm font-medium text-gray-400">Give your assessment a name</label>
          <SpeechInput
            value={projectName}
            onValueChange={setProjectName}
            placeholder="e.g., Customer Data Migration Project"
            classNames={{
              inputWrapper: 'bg-[#141420] border border-[#1E1E2E]',
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-danger-50 text-danger-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="flat" onPress={() => setMode('choice')}>
            Start Over
          </Button>
          <Button 
            color="primary" 
            onPress={handleApplyAndContinue}
            isDisabled={!projectName.trim()}
            isLoading={isSubmitting}
          >
            Create Assessment & Start Analysis
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
