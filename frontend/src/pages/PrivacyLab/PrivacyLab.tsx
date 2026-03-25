import { useState } from 'react';
import { Button, Card, CardBody, Chip, Spinner, Accordion, AccordionItem, Tabs, Tab } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useAssessmentStore } from '../../store/assessmentStore';
import { runPrivacyAnalysis, getPETRecommendations } from '../../services/api';
import RiskHeatmap from '../../components/charts/RiskHeatmap';
import RiskGauge from '../../components/charts/RiskGauge';
import type { PETRecommendation } from '../../types';
import { HiOutlineShieldCheck, HiOutlineCpuChip, HiOutlineExclamationTriangle, HiOutlineChevronDown } from 'react-icons/hi2';

export default function PrivacyLab() {
  const { currentAssessment, setCurrentAssessment, loading, setLoading } = useAssessmentStore();
  const [showDetailedGuidance, setShowDetailedGuidance] = useState<Record<string, boolean>>({});

  if (!currentAssessment) {
    return (
      <div className="text-center py-20">
        <HiOutlineShieldCheck className="mx-auto text-gray-300" size={48} />
        <p className="text-gray-500 mt-4">Complete the assessment intake first.</p>
      </div>
    );
  }

  const analysis = currentAssessment.privacy_analysis;
  const pets = currentAssessment.pet_recommendations;

  const handleAnalyze = async () => {
    setLoading('privacy', true);
    try {
      const result = await runPrivacyAnalysis(currentAssessment.id);
      setCurrentAssessment({ ...currentAssessment, privacy_analysis: result });
    } catch (err) {
      console.error('Privacy analysis failed:', err);
    } finally {
      setLoading('privacy', false);
    }
  };

  const handlePETRecs = async () => {
    setLoading('pets', true);
    try {
      const result = await getPETRecommendations(currentAssessment.id);
      setCurrentAssessment({ ...currentAssessment, pet_recommendations: result });
    } catch (err) {
      console.error('PET recommendations failed:', err);
    } finally {
      setLoading('pets', false);
    }
  };

  const toggleDetailedGuidance = (name: string) => {
    setShowDetailedGuidance(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Privacy Engineering Lab</h2>
        <p className="text-gray-500 mt-1">Analyze privacy risks and get technology recommendations.</p>
      </div>

      {/* Action buttons */}
      {!analysis && (
        <Card className="border border-primary-100 bg-primary-50/30 shadow-none">
          <CardBody className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Ready to analyze</p>
              <p className="text-sm text-gray-500 mt-1">Run a comprehensive privacy risk analysis on your project data.</p>
            </div>
            <Button color="primary" onPress={handleAnalyze} isLoading={loading['privacy']} className="px-6">
              Run Analysis
            </Button>
          </CardBody>
        </Card>
      )}

      {loading['privacy'] && (
        <div className="flex items-center gap-3 text-primary-600 py-8 justify-center">
          <Spinner size="sm" color="primary" />
          <span className="text-sm streaming-cursor">Analyzing privacy risks</span>
        </div>
      )}

      {/* Risk Analysis Dashboard */}
      {analysis && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Data Risk Analysis</h3>

          {/* Risk Scores */}
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(analysis.risk_scores).map(([stage, score]) => (
              <Card key={stage} className="border border-gray-100 shadow-none">
                <CardBody className="p-4 text-center">
                  <RiskGauge value={score as number} size={80} />
                  <p className="text-xs font-medium text-gray-600 mt-2 capitalize">{stage}</p>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Heatmap */}
          {analysis.risk_heatmap.length > 0 && (
            <Card className="border border-gray-100 shadow-none">
              <CardBody className="p-6">
                <p className="text-sm font-medium text-gray-700 mb-4">Risk Heatmap — Data Type × Lifecycle Stage</p>
                <RiskHeatmap data={analysis.risk_heatmap} />
              </CardBody>
            </Card>
          )}

          {/* Technical Debt & Regulatory Gaps */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-gray-100 shadow-none">
              <CardBody className="p-5 space-y-3">
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <HiOutlineExclamationTriangle className="text-warning" size={16} />
                  Technical Debt
                </p>
                {analysis.technical_debt.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Chip size="sm" color={item.severity === 'high' ? 'danger' : item.severity === 'medium' ? 'warning' : 'default'} variant="flat" className="text-[10px]">
                      {item.severity}
                    </Chip>
                    <span className="text-sm text-gray-700">{item.issue}</span>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card className="border border-gray-100 shadow-none">
              <CardBody className="p-5 space-y-3">
                <p className="text-sm font-semibold text-gray-800">Regulatory Gaps</p>
                {analysis.regulatory_gaps.map((gap, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-danger mt-0.5">•</span>
                    {gap}
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* PET Recommendations */}
          {!pets && (
            <Card className="border border-secondary-100 bg-secondary-50/30 shadow-none">
              <CardBody className="p-6 flex flex-row items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Get PET Recommendations</p>
                  <p className="text-sm text-gray-500 mt-1">Based on the risk analysis, get Privacy Enhancing Technology recommendations.</p>
                </div>
                <Button color="secondary" onPress={handlePETRecs} isLoading={loading['pets']} className="px-6">
                  Get Recommendations
                </Button>
              </CardBody>
            </Card>
          )}

          {loading['pets'] && (
            <div className="flex items-center gap-3 text-secondary-600 py-4 justify-center">
              <Spinner size="sm" color="secondary" />
              <span className="text-sm streaming-cursor">Generating PET recommendations</span>
            </div>
          )}

          {pets && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center gap-2">
                <HiOutlineCpuChip className="text-secondary" size={20} />
                <h3 className="text-lg font-medium text-gray-900">PET Recommendations</h3>
              </div>
              <p className="text-sm text-gray-500">{pets.summary}</p>

              <Accordion variant="splitted" selectionMode="multiple">
                {pets.recommendations.map((pet: PETRecommendation, idx: number) => (
                  <AccordionItem
                    key={idx}
                    aria-label={pet.name}
                    title={
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">{pet.name}</span>
                          <Chip size="sm" color="primary" variant="flat">
                            {Math.round(pet.suitability_score * 100)}% match
                          </Chip>
                        </div>
                      </div>
                    }
                    subtitle={pet.rationale}
                    classNames={{
                      base: 'border border-gray-100 shadow-none',
                      title: 'text-sm',
                      subtitle: 'text-xs text-gray-500',
                    }}
                  >
                    <div className="space-y-4 pt-2 pb-4">
                      <Tabs variant="underlined" color="primary" size="sm">
                        <Tab key="overview" title="Overview">
                          <div className="space-y-3 pt-3">
                            <InfoRow label="Use Case" value={pet.use_case} />
                            <InfoRow label="Risk Mitigated" value={pet.risk_mitigated} />
                            <InfoRow label="Architecture Pattern" value={pet.architecture_pattern} />
                            <InfoRow label="Tradeoffs" value={pet.tradeoffs} />
                          </div>
                        </Tab>
                        <Tab key="implementation" title="Implementation">
                          <div className="space-y-3 pt-3">
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">Implementation Guidance</p>
                              <p className="text-sm text-gray-700">{pet.implementation_guidance}</p>
                              <button
                                onClick={() => toggleDetailedGuidance(pet.name)}
                                className="text-xs text-primary-600 mt-2 flex items-center gap-1 hover:underline"
                              >
                                {showDetailedGuidance[pet.name] ? 'Hide' : 'Show'} Technical Details
                                <HiOutlineChevronDown className={`transition-transform ${showDetailedGuidance[pet.name] ? 'rotate-180' : ''}`} size={12} />
                              </button>
                              {showDetailedGuidance[pet.name] && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-3 bg-gray-50 rounded-lg p-4"
                                >
                                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">{pet.implementation_guidance_detailed}</pre>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </Tab>
                        <Tab key="deployment" title="Deployment & Oversight">
                          <div className="space-y-3 pt-3">
                            <InfoRow label="Deployment Considerations" value={pet.deployment_considerations} />
                            <InfoRow label="Human Oversight" value={pet.human_oversight} />
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">Monitoring Metrics</p>
                              <div className="flex flex-wrap gap-2">
                                {pet.monitoring_metrics.map((m, i) => (
                                  <Chip key={i} size="sm" variant="flat" color="default">{m}</Chip>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Tab>
                      </Tabs>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-0.5">{label}</p>
      <p className="text-sm text-gray-700">{value}</p>
    </div>
  );
}
