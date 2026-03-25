import { useState } from 'react';
import { Button, Card, CardBody, Input, Chip, Spinner, Accordion, AccordionItem, Divider } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useAssessmentStore } from '../../store/assessmentStore';
import { runBiasAnalysis, suggestStakeholders, runPreMortem } from '../../services/api';
import { HiOutlineUserGroup, HiOutlinePlus, HiOutlineXMark, HiOutlineExclamationTriangle, HiOutlineLightBulb } from 'react-icons/hi2';
import PreMortemLab from './PreMortemLab';

export default function BiasLab() {
  const { currentAssessment, setCurrentAssessment, loading, setLoading } = useAssessmentStore();
  const [primaryUsers, setPrimaryUsers] = useState<string[]>([]);
  const [affectedGroups, setAffectedGroups] = useState<string[]>([]);
  const [indirectGroups, setIndirectGroups] = useState<string[]>([]);
  const [inputValues, setInputValues] = useState({ primary: '', affected: '', indirect: '' });
  const [suggestions, setSuggestions] = useState<any>(null);

  if (!currentAssessment) {
    return (
      <div className="text-center py-20">
        <HiOutlineUserGroup className="mx-auto text-gray-300" size={48} />
        <p className="text-gray-500 mt-4">Complete the assessment intake first.</p>
      </div>
    );
  }

  const biasAnalysis = currentAssessment.bias_analysis;

  const addItem = (list: string[], setList: (v: string[]) => void, field: 'primary' | 'affected' | 'indirect') => {
    const val = inputValues[field].trim();
    if (val && !list.includes(val)) {
      setList([...list, val]);
      setInputValues(prev => ({ ...prev, [field]: '' }));
    }
  };

  const removeItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.filter(i => i !== item));
  };

  const handleSuggestStakeholders = async () => {
    setLoading('suggest', true);
    try {
      const result = await suggestStakeholders(currentAssessment.id, primaryUsers, affectedGroups);
      setSuggestions(result);
    } catch (err) {
      console.error('Stakeholder suggestion failed:', err);
    } finally {
      setLoading('suggest', false);
    }
  };

  const handleAnalyze = async () => {
    setLoading('bias', true);
    try {
      const result = await runBiasAnalysis(currentAssessment.id, primaryUsers, affectedGroups, indirectGroups);
      setCurrentAssessment({
        ...currentAssessment,
        bias_analysis: result,
        stakeholder_map: { primary_users: primaryUsers, affected_groups: affectedGroups, indirectly_affected_groups: indirectGroups },
      });
    } catch (err) {
      console.error('Bias analysis failed:', err);
    } finally {
      setLoading('bias', false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Bias & Inclusion Lab</h2>
        <p className="text-gray-500 mt-1">Identify who's affected and assess bias risks.</p>
      </div>

      {/* Stakeholder Mapping */}
      <div className="space-y-5">
        <h3 className="text-lg font-medium text-gray-900">Stakeholder Mapping</h3>

        <StakeholderInput
          label="Primary Users"
          description="Who will directly use this system?"
          items={primaryUsers}
          value={inputValues.primary}
          onChange={(v) => setInputValues(prev => ({ ...prev, primary: v }))}
          onAdd={() => addItem(primaryUsers, setPrimaryUsers, 'primary')}
          onRemove={(item) => removeItem(primaryUsers, setPrimaryUsers, item)}
          color="primary"
        />

        <StakeholderInput
          label="Affected Groups"
          description="Whose data is being processed or who is directly impacted?"
          items={affectedGroups}
          value={inputValues.affected}
          onChange={(v) => setInputValues(prev => ({ ...prev, affected: v }))}
          onAdd={() => addItem(affectedGroups, setAffectedGroups, 'affected')}
          onRemove={(item) => removeItem(affectedGroups, setAffectedGroups, item)}
          color="secondary"
        />

        <StakeholderInput
          label="Indirectly Affected Groups"
          description="Who might be indirectly impacted? (Don't know? Click suggestion below.)"
          items={indirectGroups}
          value={inputValues.indirect}
          onChange={(v) => setInputValues(prev => ({ ...prev, indirect: v }))}
          onAdd={() => addItem(indirectGroups, setIndirectGroups, 'indirect')}
          onRemove={(item) => removeItem(indirectGroups, setIndirectGroups, item)}
          color="warning"
        />

        <Button
          variant="flat"
          color="secondary"
          onPress={handleSuggestStakeholders}
          isLoading={loading['suggest']}
          startContent={<HiOutlineLightBulb size={16} />}
        >
          Suggest Stakeholders with AI
        </Button>

        {/* Suggestions */}
        {suggestions && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <Card className="border border-secondary-100 bg-secondary-50/20 shadow-none">
              <CardBody className="p-4 space-y-3">
                <p className="text-sm font-medium text-secondary-700">AI-Suggested Stakeholders</p>
                {suggestions.suggested_affected_groups?.map((g: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-800">{g.group}</span>
                      <span className="text-xs text-gray-500 ml-2">— {g.rationale}</span>
                    </div>
                    <Button size="sm" variant="flat" color="secondary" onPress={() => {
                      if (!affectedGroups.includes(g.group)) setAffectedGroups([...affectedGroups, g.group]);
                    }}>
                      Add
                    </Button>
                  </div>
                ))}
                {suggestions.suggested_indirect_groups?.map((g: any, i: number) => (
                  <div key={`i-${i}`} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-800">{g.group}</span>
                      <span className="text-xs text-gray-500 ml-2">— {g.rationale}</span>
                    </div>
                    <Button size="sm" variant="flat" color="warning" onPress={() => {
                      if (!indirectGroups.includes(g.group)) setIndirectGroups([...indirectGroups, g.group]);
                    }}>
                      Add
                    </Button>
                  </div>
                ))}
              </CardBody>
            </Card>
          </motion.div>
        )}
      </div>

      <Divider />

      {/* Run Bias Analysis */}
      {!biasAnalysis && (
        <Card className="border border-primary-100 bg-primary-50/30 shadow-none">
          <CardBody className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Run Bias & Inclusion Analysis</p>
              <p className="text-sm text-gray-500 mt-1">Analyze potential bias risks based on your stakeholder mapping.</p>
            </div>
            <Button color="primary" onPress={handleAnalyze} isLoading={loading['bias']} className="px-6">
              Analyze
            </Button>
          </CardBody>
        </Card>
      )}

      {loading['bias'] && (
        <div className="flex items-center gap-3 text-primary-600 py-4 justify-center">
          <Spinner size="sm" color="primary" />
          <span className="text-sm streaming-cursor">Analyzing bias risks</span>
        </div>
      )}

      {/* Analysis Results */}
      {biasAnalysis && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Bias Risk Scenarios */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <HiOutlineExclamationTriangle className="text-warning" size={20} />
              Potential Bias Risk Scenarios
            </h3>
            {biasAnalysis.bias_risk_scenarios.map((scenario, i) => (
              <Card key={i} className="border border-gray-100 shadow-none">
                <CardBody className="p-4">
                  <p className="text-sm text-gray-800">{scenario.scenario}</p>
                  <div className="flex gap-2 mt-2">
                    <Chip size="sm" variant="flat" color={scenario.likelihood === 'high' ? 'danger' : scenario.likelihood === 'medium' ? 'warning' : 'success'}>
                      Likelihood: {scenario.likelihood}
                    </Chip>
                    <Chip size="sm" variant="flat" color={scenario.impact === 'high' ? 'danger' : scenario.impact === 'medium' ? 'warning' : 'success'}>
                      Impact: {scenario.impact}
                    </Chip>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Data Representation Questions */}
          <Card className="border border-gray-100 shadow-none">
            <CardBody className="p-5 space-y-2">
              <p className="text-sm font-semibold text-gray-800">Data Representation Questions</p>
              {biasAnalysis.data_representation_questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-primary-500 mt-0.5 font-bold">{i + 1}.</span>
                  {q}
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Harm Scenarios */}
          <div className="grid grid-cols-2 gap-4">
            {biasAnalysis.harm_scenarios.map((harm, i) => (
              <Card key={i} className="border border-gray-100 shadow-none">
                <CardBody className="p-4">
                  <Chip size="sm" variant="flat" color="danger" className="mb-2">{harm.category}</Chip>
                  <p className="text-sm text-gray-700">{harm.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Fairness Practices */}
          <Card className="border border-gray-100 shadow-none">
            <CardBody className="p-5 space-y-2">
              <p className="text-sm font-semibold text-gray-800">Suggested Fairness Practices</p>
              {biasAnalysis.fairness_practices.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-success mt-0.5">✓</span>
                  {p}
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Engagement Recommendations */}
          <Card className="border border-gray-100 shadow-none">
            <CardBody className="p-5 space-y-2">
              <p className="text-sm font-semibold text-gray-800">Stakeholder Engagement Recommendations</p>
              {biasAnalysis.engagement_recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-primary-500 mt-0.5">→</span>
                  {r}
                </div>
              ))}
            </CardBody>
          </Card>

          <Divider />

          {/* Pre-Mortem Lab */}
          <PreMortemLab />
        </motion.div>
      )}
    </div>
  );
}

function StakeholderInput({
  label, description, items, value, onChange, onAdd, onRemove, color,
}: {
  label: string; description: string; items: string[]; value: string;
  onChange: (v: string) => void; onAdd: () => void; onRemove: (item: string) => void;
  color: 'primary' | 'secondary' | 'warning';
}) {
  return (
    <Card className="border border-gray-100 shadow-none">
      <CardBody className="p-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder={`Add ${label.toLowerCase()}...`}
            value={value}
            onValueChange={onChange}
            onKeyDown={(e) => e.key === 'Enter' && onAdd()}
            variant="bordered"
            size="sm"
            classNames={{ inputWrapper: 'border-gray-200' }}
          />
          <Button isIconOnly size="sm" color={color} variant="flat" onPress={onAdd}>
            <HiOutlinePlus size={16} />
          </Button>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Chip
                key={item}
                onClose={() => onRemove(item)}
                variant="flat"
                color={color}
                size="sm"
              >
                {item}
              </Chip>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
