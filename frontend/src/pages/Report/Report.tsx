import { useState } from 'react';
import { Button, Card, CardBody, Chip, Spinner, Divider } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useAssessmentStore } from '../../store/assessmentStore';
import { generateReport } from '../../services/api';
import type { FullReport } from '../../types';
import { HiOutlineDocumentArrowDown, HiOutlinePrinter, HiOutlineExclamationTriangle } from 'react-icons/hi2';

export default function Report() {
  const { currentAssessment, loading, setLoading } = useAssessmentStore();
  const [report, setReport] = useState<FullReport | null>(null);

  if (!currentAssessment) {
    return (
      <div className="text-center py-20">
        <HiOutlineDocumentArrowDown className="mx-auto text-gray-300" size={48} />
        <p className="text-gray-500 mt-4">Complete the assessment intake first.</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    setLoading('report', true);
    try {
      const result = await generateReport(currentAssessment.id);
      setReport(result);
    } catch (err) {
      console.error('Report generation failed:', err);
    } finally {
      setLoading('report', false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const riskColors: Record<string, 'success' | 'warning' | 'danger'> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Assessment Report</h2>
          <p className="text-gray-500 mt-1">Generate and download your comprehensive privacy assessment report.</p>
        </div>
        {report && (
          <div className="flex gap-2">
            <Button
              variant="flat"
              startContent={<HiOutlinePrinter size={16} />}
              onPress={handlePrint}
            >
              Print
            </Button>
          </div>
        )}
      </div>

      {!report && (
        <Card className="border border-primary-100 bg-primary-50/30 shadow-none">
          <CardBody className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Generate Final Report</p>
              <p className="text-sm text-gray-500 mt-1">
                Compile all assessment findings into a comprehensive report with executive summary.
              </p>
            </div>
            <Button color="primary" onPress={handleGenerate} isLoading={loading['report']} className="px-6">
              Generate Report
            </Button>
          </CardBody>
        </Card>
      )}

      {loading['report'] && (
        <div className="flex items-center gap-3 text-primary-600 py-8 justify-center">
          <Spinner size="sm" color="primary" />
          <span className="text-sm streaming-cursor">Generating comprehensive report</span>
        </div>
      )}

      {report && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 print:space-y-4"
          id="report-content"
        >
          {/* Report Header */}
          <Card className="border border-[#1E1E2E] shadow-none bg-gradient-to-br from-[#0D1E35] to-[#0E0E1A]">
            <CardBody className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary-600 font-semibold">Privacy Risk Assessment Report</p>
                  <h3 className="text-xl font-bold text-gray-900 mt-2">{report.project_info.name}</h3>
                  {report.project_info.description && (
                    <p className="text-sm text-gray-600 mt-2 max-w-2xl">{report.project_info.description}</p>
                  )}
                  <div className="flex gap-4 mt-4 text-xs text-gray-500">
                    {report.project_info.team && <span>Team: {report.project_info.team}</span>}
                    {report.project_info.timeline && <span>Timeline: {report.project_info.timeline}</span>}
                    <span>AI Involved: {report.project_info.ai_involved ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <Chip
                  color={riskColors[report.executive_summary.overall_risk_level] || 'default'}
                  variant="flat"
                  size="lg"
                  className="font-semibold"
                >
                  {report.executive_summary.overall_risk_level.toUpperCase()} RISK
                </Chip>
              </div>
            </CardBody>
          </Card>

          {/* Executive Summary */}
          <Card className="border border-gray-100 shadow-none">
            <CardBody className="p-6 space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Executive Summary</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {report.executive_summary.executive_summary}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-800">Key Findings</p>
                  {report.executive_summary.key_findings.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-primary-500 mt-0.5">•</span>
                      {f}
                    </div>
                  ))}
                </div>
                <div className="bg-primary-50/50 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-800">Priority Actions</p>
                  {report.executive_summary.priority_actions.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-primary-600 font-bold mt-0.5">{i + 1}.</span>
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Privacy Analysis Section */}
          {report.privacy_analysis && (
            <Card className="border border-gray-100 shadow-none">
              <CardBody className="p-6 space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">Privacy Risk Analysis</h4>
                <p className="text-sm text-gray-600">{report.privacy_analysis.summary}</p>

                <div className="grid grid-cols-5 gap-3 mt-2">
                  {Object.entries(report.privacy_analysis.risk_scores).map(([stage, score]) => (
                    <div key={stage} className="text-center bg-gray-50 rounded-lg p-3">
                      <p className="text-lg font-bold" style={{ color: Number(score) >= 0.7 ? '#F31260' : Number(score) >= 0.5 ? '#F5A524' : '#17C964' }}>
                        {Math.round(Number(score) * 100)}%
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{stage}</p>
                    </div>
                  ))}
                </div>

                {report.privacy_analysis.technical_debt.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Technical Debt</p>
                    {report.privacy_analysis.technical_debt.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Chip size="sm" variant="flat" color={item.severity === 'high' ? 'danger' : 'warning'}>{item.severity}</Chip>
                        {item.issue}
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* PET Recommendations Section */}
          {report.pet_recommendations && (
            <Card className="border border-gray-100 shadow-none">
              <CardBody className="p-6 space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">PET Recommendations</h4>
                <p className="text-sm text-gray-600">{report.pet_recommendations.summary}</p>
                <div className="space-y-3 mt-2">
                  {report.pet_recommendations.recommendations.map((pet, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900">{pet.name}</p>
                        <Chip size="sm" color="primary" variant="flat">{Math.round(pet.suitability_score * 100)}% match</Chip>
                      </div>
                      <p className="text-xs text-gray-600">{pet.rationale}</p>
                      <p className="text-xs text-gray-500 mt-1">Risk mitigated: {pet.risk_mitigated}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Bias Analysis Section */}
          {report.bias_analysis && (
            <Card className="border border-gray-100 shadow-none">
              <CardBody className="p-6 space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">Bias & Inclusion Analysis</h4>
                <p className="text-sm text-gray-600">{report.bias_analysis.summary}</p>

                <div className="space-y-2 mt-2">
                  <p className="text-sm font-medium text-gray-700">Bias Risk Scenarios</p>
                  {report.bias_analysis.bias_risk_scenarios.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <HiOutlineExclamationTriangle className="text-warning shrink-0" size={14} />
                      {s.scenario}
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mt-2">
                  <p className="text-sm font-medium text-gray-700">Suggested Fairness Practices</p>
                  {report.bias_analysis.fairness_practices.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-success mt-0.5">✓</span>
                      {p}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Pre-Mortem Section */}
          {report.premortem_analysis && (
            <Card className="border border-gray-100 shadow-none">
              <CardBody className="p-6 space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">Pre-Mortem Analysis</h4>
                <p className="text-sm text-gray-600">{report.premortem_analysis.analytical_summary}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {report.premortem_analysis.top_priorities.map((p, i) => (
                    <Chip key={i} size="sm" color="danger" variant="flat">{p}</Chip>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Governance Section */}
          {report.governance_map && (
            <Card className="border border-gray-100 shadow-none">
              <CardBody className="p-6 space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">Governance & Accountability</h4>
                <p className="text-sm text-gray-600">{report.governance_map.summary}</p>

                <div className="space-y-2 mt-2">
                  <p className="text-sm font-medium text-gray-700">Decision Rights</p>
                  {report.governance_map.decision_rights.map((dr, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium text-gray-800">{dr.decision}</span>
                      <span>→ Owner: <strong>{dr.owner}</strong></span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 pt-4">
            <p>Generated by PrivacyCheck — World Bank Privacy Risk Assessment Toolkit</p>
            <p>Report generated on {new Date().toLocaleDateString()}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
