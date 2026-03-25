import { useState } from 'react';
import { Button, Card, CardBody, Chip, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useAssessmentStore } from '../../store/assessmentStore';
import { runPreMortem } from '../../services/api';
import RiskGauge from '../../components/charts/RiskGauge';
import { HiOutlineEye, HiOutlineExclamationTriangle, HiOutlineShieldExclamation } from 'react-icons/hi2';

export default function PreMortemLab() {
  const { currentAssessment, setCurrentAssessment, loading, setLoading } = useAssessmentStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const premortem = currentAssessment?.premortem_analysis;
  const missingDeps = !currentAssessment?.privacy_analysis;

  const handleRunPreMortem = async () => {
    if (!currentAssessment) return;
    setLoading('premortem', true);
    try {
      const result = await runPreMortem(currentAssessment.id);
      setCurrentAssessment({ ...currentAssessment, premortem_analysis: result });
    } catch (err) {
      console.error('Pre-mortem failed:', err);
    } finally {
      setLoading('premortem', false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <HiOutlineEye size={20} className="text-primary" />
          Pre-Mortem Lab
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Imagine it's 2 years from now. What could go wrong? This forward-looking risk exercise helps identify failures before they happen.
        </p>
      </div>

      {!premortem && (
        <Card className={`border shadow-none ${missingDeps ? 'border-gray-200 bg-gray-50' : 'border-warning-100 bg-warning-50/30'}`}>
          <CardBody className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Run Pre-Mortem Analysis</p>
              <p className="text-sm text-gray-500 mt-1">
                {missingDeps
                  ? 'Complete the Privacy Lab analysis first to enable pre-mortem.'
                  : 'Generate plausible failure scenarios and preventative recommendations.'}
              </p>
            </div>
            <Button
              color="warning"
              onPress={handleRunPreMortem}
              isLoading={loading['premortem']}
              isDisabled={missingDeps}
              className="px-6 text-white"
            >
              Imagine the Future
            </Button>
          </CardBody>
        </Card>
      )}

      {loading['premortem'] && (
        <div className="flex items-center gap-3 text-warning-600 py-4 justify-center">
          <Spinner size="sm" color="warning" />
          <span className="text-sm streaming-cursor">Imagining possible futures</span>
        </div>
      )}

      {premortem && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Summary */}
          <Card className="border border-gray-100 shadow-none bg-gray-50">
            <CardBody className="p-5">
              <p className="text-sm font-medium text-gray-700 mb-2">Analytical Summary</p>
              <p className="text-sm text-gray-600">{premortem.analytical_summary}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {premortem.top_priorities.map((p, i) => (
                  <Chip key={i} size="sm" color="danger" variant="flat">{p}</Chip>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Scenario Cards */}
          <div className="grid grid-cols-2 gap-4">
            {premortem.failure_scenarios.map((scenario, i) => (
              <Card key={i} className="border border-gray-100 shadow-none hover:shadow-md transition-shadow">
                <CardBody className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <HiOutlineExclamationTriangle className="text-warning" size={16} />
                      <p className="text-sm font-semibold text-gray-900">{scenario.title}</p>
                    </div>
                    <Chip size="sm" variant="flat" color={
                      scenario.category === 'Security' ? 'danger' :
                      scenario.category === 'Bias' ? 'warning' :
                      scenario.category === 'Privacy' ? 'primary' : 'default'
                    }>
                      {scenario.category}
                    </Chip>
                  </div>

                  <p className="text-xs text-gray-600">{scenario.narrative}</p>

                  <div className="flex gap-4">
                    <div className="text-center">
                      <RiskGauge value={scenario.likelihood} size={50} />
                      <p className="text-[10px] text-gray-500 mt-1">Likelihood</p>
                    </div>
                    <div className="text-center">
                      <RiskGauge value={scenario.impact} size={50} />
                      <p className="text-[10px] text-gray-500 mt-1">Impact</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-semibold text-gray-500">Preventative Steps</p>
                    {scenario.preventative_suggestions.map((s, j) => (
                      <p key={j} className="text-xs text-gray-600">• {s}</p>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* View Full Dashboard Button */}
          <Button
            color="primary"
            variant="flat"
            onPress={onOpen}
            startContent={<HiOutlineShieldExclamation size={16} />}
            className="w-full"
          >
            View Risk Scenario Dashboard
          </Button>

          {/* Full Dashboard Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
            <ModalContent>
              <ModalHeader className="text-lg font-semibold">Risk Scenario Dashboard</ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  <p className="text-sm text-gray-600">{premortem.analytical_summary}</p>

                  {premortem.failure_scenarios.map((scenario, i) => (
                    <Card key={i} className="border border-gray-100 shadow-none">
                      <CardBody className="p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-semibold text-gray-900">{scenario.title}</h4>
                          <div className="flex gap-2">
                            <Chip size="sm" variant="flat" color="warning">
                              Likelihood: {Math.round(scenario.likelihood * 100)}%
                            </Chip>
                            <Chip size="sm" variant="flat" color="danger">
                              Impact: {Math.round(scenario.impact * 100)}%
                            </Chip>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{scenario.narrative}</p>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Preventative Suggestions</p>
                            {scenario.preventative_suggestions.map((s, j) => (
                              <p key={j} className="text-xs text-gray-600 mb-1">• {s}</p>
                            ))}
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Human Oversight</p>
                            {scenario.human_oversight_recommendations.map((s, j) => (
                              <p key={j} className="text-xs text-gray-600 mb-1">• {s}</p>
                            ))}
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Early Warning Signs</p>
                            {scenario.early_warning_indicators.map((s, j) => (
                              <p key={j} className="text-xs text-gray-600 mb-1">• {s}</p>
                            ))}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="flat" onPress={onClose}>Close</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </motion.div>
      )}
    </div>
  );
}
