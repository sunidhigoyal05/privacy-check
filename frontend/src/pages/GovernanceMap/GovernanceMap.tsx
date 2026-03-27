import { useState } from 'react';
import { Button, Card, CardBody, Chip, Spinner, Input, Checkbox, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useAssessmentStore } from '../../store/assessmentStore';
import { generateGovernance } from '../../services/api';
import { HiOutlineScale, HiOutlinePlus, HiOutlineArrowPath, HiOutlineDocumentText, HiOutlinePrinter } from 'react-icons/hi2';

const RACI_COLORS: Record<string, string> = {
  R: 'bg-primary-100/20 text-primary-400',
  A: 'bg-danger-100/20 text-danger-400',
  C: 'bg-warning-100/20 text-warning-400',
  I: 'bg-default-200/30 text-default-500',
};

const RACI_LABELS: Record<string, string> = {
  R: 'Responsible',
  A: 'Accountable',
  C: 'Consulted',
  I: 'Informed',
};

export default function GovernanceMap() {
  const { currentAssessment, setCurrentAssessment, loading, setLoading } = useAssessmentStore();
  const [roles, setRoles] = useState<string[]>([]);
  const [newRole, setNewRole] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [newResponsibility, setNewResponsibility] = useState('');
  const [showReport, setShowReport] = useState(false);

  if (!currentAssessment) {
    return (
      <div className="text-center py-20">
        <HiOutlineScale className="mx-auto text-gray-300" size={48} />
        <p className="text-gray-500 mt-4">Complete the assessment intake first.</p>
      </div>
    );
  }

  const governance = currentAssessment.governance_map;

  const handleGenerate = async () => {
    setLoading('governance', true);
    try {
      const result = await generateGovernance(currentAssessment.id, roles, responsibilities);
      setCurrentAssessment({ ...currentAssessment, governance_map: result });
    } catch (err) {
      console.error('Governance generation failed:', err);
    } finally {
      setLoading('governance', false);
    }
  };

  const addRole = () => {
    const val = newRole.trim();
    if (val && !roles.includes(val)) {
      setRoles([...roles, val]);
      setNewRole('');
    }
  };

  const addResponsibility = () => {
    const val = newResponsibility.trim();
    if (val && !responsibilities.includes(val)) {
      setResponsibilities([...responsibilities, val]);
      setNewResponsibility('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Governance & Accountability Map</h2>
          <p className="text-gray-500 mt-1">Define who is responsible for what in your project.</p>
        </div>
        {governance && (
          <Button
            variant="flat"
            color="primary"
            startContent={<HiOutlineDocumentText size={16} />}
            onPress={() => setShowReport(true)}
          >
            View Diagnostic Report
          </Button>
        )}
      </div>

      {!governance && (
        <div className="space-y-5">
          <Card className="border border-gray-100 shadow-none">
            <CardBody className="p-5 space-y-4">
              <p className="text-sm font-medium text-gray-800">Add Custom Roles (optional)</p>
              <p className="text-xs text-gray-500">Add any specific roles. Default governance roles will also be included.</p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Regional Privacy Lead..."
                  value={newRole}
                  onValueChange={setNewRole}
                  onKeyDown={(e) => e.key === 'Enter' && addRole()}
                  variant="bordered"
                  size="sm"
                />
                <Button isIconOnly size="sm" color="primary" variant="flat" onPress={addRole}>
                  <HiOutlinePlus size={16} />
                </Button>
              </div>
              {roles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {roles.map(role => (
                    <Chip key={role} onClose={() => setRoles(roles.filter(r => r !== role))} variant="flat" color="primary" size="sm">
                      {role}
                    </Chip>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="border border-gray-100 shadow-none">
            <CardBody className="p-5 space-y-4">
              <p className="text-sm font-medium text-gray-800">Add Custom Responsibilities (optional)</p>
              <p className="text-xs text-gray-500">Specify key responsibilities to map in the RACI matrix. Default responsibilities will also be included.</p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Data Quality Assurance..."
                  value={newResponsibility}
                  onValueChange={setNewResponsibility}
                  onKeyDown={(e) => e.key === 'Enter' && addResponsibility()}
                  variant="bordered"
                  size="sm"
                />
                <Button isIconOnly size="sm" color="primary" variant="flat" onPress={addResponsibility}>
                  <HiOutlinePlus size={16} />
                </Button>
              </div>
              {responsibilities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {responsibilities.map(resp => (
                    <Chip key={resp} onClose={() => setResponsibilities(responsibilities.filter(r => r !== resp))} variant="flat" color="secondary" size="sm">
                      {resp}
                    </Chip>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="border border-primary-100 bg-primary-50/30 shadow-none">
            <CardBody className="p-6 flex flex-row items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Generate Governance Framework</p>
                <p className="text-sm text-gray-500 mt-1">Create RACI matrix, decision rights, and accountability checklist.</p>
              </div>
              <Button color="primary" onPress={handleGenerate} isLoading={loading['governance']} className="px-6">
                Generate
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      {loading['governance'] && (
        <div className="flex items-center gap-3 text-primary-600 py-4 justify-center">
          <Spinner size="sm" color="primary" />
          <span className="text-sm streaming-cursor">Building governance framework</span>
        </div>
      )}

      {governance && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* RACI Matrix */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">RACI Matrix</h3>
              <div className="flex gap-2">
                {Object.entries(RACI_LABELS).map(([key, label]) => (
                  <Chip key={key} size="sm" variant="flat" className={RACI_COLORS[key]}>{key} = {label}</Chip>
                ))}
              </div>
            </div>

            <Card className="border border-gray-100 shadow-none overflow-hidden">
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">Responsibility</th>
                        {governance.raci_matrix.roles.map(role => (
                          <th key={role} className="text-center text-xs font-medium text-gray-600 px-3 py-3">{role}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(governance.raci_matrix.responsibilities).map(([resp, assignments]) => (
                        <tr key={resp} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="text-sm text-gray-800 px-4 py-3 font-medium">{resp}</td>
                          {governance.raci_matrix.roles.map(role => {
                            const val = (assignments as Record<string, string>)[role] || '';
                            return (
                              <td key={role} className="text-center px-3 py-3">
                                {val && (
                                  <Tooltip content={RACI_LABELS[val] || val}>
                                    <span className={`inline-flex w-8 h-8 rounded-lg items-center justify-center text-xs font-bold cursor-default ${RACI_COLORS[val] || ''}`}>
                                      {val}
                                    </span>
                                  </Tooltip>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Decision Rights */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Decision Rights</h3>
            <div className="grid grid-cols-2 gap-3">
              {governance.decision_rights.map((dr, i) => (
                <Card key={i} className="border border-gray-100 shadow-none">
                  <CardBody className="p-4">
                    <p className="text-sm font-medium text-gray-900">{dr.decision}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600">
                      <span>Owner: <strong className="text-primary-600">{dr.owner}</strong></span>
                      <span>Escalation: <strong className="text-warning-600">{dr.escalation}</strong></span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          {/* Accountability Checklist */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Accountability Checklist</h3>
            <Card className="border border-gray-100 shadow-none">
              <CardBody className="p-5 space-y-3">
                {governance.accountability_checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-1">
                    <Checkbox size="sm" isSelected={item.done} isReadOnly />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{item.item}</p>
                    </div>
                    <Chip size="sm" variant="flat" color="primary">{item.owner}</Chip>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Regenerate */}
          <Button
            variant="flat"
            startContent={<HiOutlineArrowPath size={16} />}
            onPress={handleGenerate}
            isLoading={loading['governance']}
          >
            Regenerate Governance Map
          </Button>
        </motion.div>
      )}

      {/* Diagnostic Report Modal */}
      <Modal 
        isOpen={showReport} 
        onClose={() => setShowReport(false)} 
        size="4xl" 
        scrollBehavior="inside"
        classNames={{
          base: 'bg-[#0E0E1A] border border-[#1E1E2E]',
          header: 'border-b border-[#1E1E2E]',
          body: 'py-6',
          footer: 'border-t border-[#1E1E2E]',
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <HiOutlineScale className="text-primary-500" size={20} />
              <span>Governance & Accountability — Diagnostic Report</span>
            </div>
            <p className="text-xs font-normal text-gray-500">{currentAssessment.project_name}</p>
          </ModalHeader>
          <ModalBody>
            {governance && (
              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Summary</h4>
                  <p className="text-sm text-gray-300">{governance.summary}</p>
                </div>

                {/* Decision Rights */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Key Decision Rights</h4>
                  <div className="space-y-2">
                    {governance.decision_rights.map((dr, i) => (
                      <div key={i} className="bg-[#141420] rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-200">{dr.decision}</p>
                        <div className="flex gap-4 mt-1 text-xs">
                          <span className="text-gray-500">Owner: <span className="text-primary-400">{dr.owner}</span></span>
                          <span className="text-gray-500">Escalation: <span className="text-warning-400">{dr.escalation}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accountability Checklist */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Accountability Checklist</h4>
                  <ul className="space-y-2">
                    {governance.accountability_checklist.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 bg-[#141420] rounded-lg p-3">
                        <span className={item.done ? 'text-success' : 'text-gray-600'}>{item.done ? '✓' : '○'}</span>
                        <span className="flex-1 text-sm text-gray-300">{item.item}</span>
                        <Chip size="sm" variant="flat" color="primary">{item.owner}</Chip>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setShowReport(false)}>Close</Button>
            <Button color="primary" startContent={<HiOutlinePrinter size={16} />} onPress={() => window.print()}>
              Print Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
