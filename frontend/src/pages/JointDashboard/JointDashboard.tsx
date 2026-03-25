import { useEffect, useState } from 'react';
import { Card, CardBody, Chip, Spinner, Progress } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useAssessmentStore } from '../../store/assessmentStore';
import { getDashboardData } from '../../services/api';
import RiskGauge from '../../components/charts/RiskGauge';
import type { DashboardData } from '../../types';
import {
  HiOutlineChartBarSquare,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineEye,
  HiOutlineScale,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from 'react-icons/hi2';

export default function JointDashboard() {
  const { currentAssessment } = useAssessmentStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentAssessment?.id) {
      setLoading(true);
      getDashboardData(currentAssessment.id)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [currentAssessment?.id]);

  if (!currentAssessment) {
    return (
      <div className="text-center py-20">
        <HiOutlineChartBarSquare className="mx-auto text-gray-300" size={48} />
        <p className="text-gray-500 mt-4">Complete the assessment intake first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-primary-600 py-20 justify-center">
        <Spinner size="md" color="primary" />
        <span className="text-sm">Loading dashboard...</span>
      </div>
    );
  }

  if (!data) return null;

  const completionCount = Object.values(data.completion_status).filter(Boolean).length;
  const totalModules = Object.keys(data.completion_status).length;
  const completionPercent = Math.round((completionCount / totalModules) * 100);

  const getRiskLabel = (score: number) => {
    if (score >= 0.8) return { label: 'Critical', color: 'danger' as const };
    if (score >= 0.6) return { label: 'High', color: 'warning' as const };
    if (score >= 0.4) return { label: 'Medium', color: 'warning' as const };
    if (score >= 0.2) return { label: 'Low', color: 'success' as const };
    return { label: 'Minimal', color: 'success' as const };
  };

  const overallRisk = getRiskLabel(data.overall_risk_score);

  const modules = [
    { key: 'privacy_lab', label: 'Privacy Analysis', icon: <HiOutlineShieldCheck size={18} />, score: data.module_scores.privacy, complete: data.completion_status.privacy_lab },
    { key: 'bias_lab', label: 'Bias Analysis', icon: <HiOutlineUserGroup size={18} />, score: data.module_scores.bias, complete: data.completion_status.bias_lab },
    { key: 'premortem', label: 'Pre-Mortem', icon: <HiOutlineEye size={18} />, score: data.module_scores.premortem, complete: data.completion_status.premortem },
    { key: 'governance', label: 'Governance', icon: <HiOutlineScale size={18} />, score: 0, complete: data.completion_status.governance },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Joint Dashboard</h2>
        <p className="text-gray-500 mt-1">Unified view of your assessment — {currentAssessment.project_name}</p>
      </div>

      {/* Top Row: Overall Risk + Completion */}
      <div className="grid grid-cols-3 gap-4">
        {/* Overall Risk */}
        <Card className="border border-gray-100 shadow-none col-span-1">
          <CardBody className="p-6 flex flex-col items-center justify-center">
            <p className="text-xs font-medium text-gray-500 mb-3">Overall Risk Score</p>
            <RiskGauge value={data.overall_risk_score} size={120} />
            <Chip color={overallRisk.color} variant="flat" className="mt-3" size="sm">
              {overallRisk.label} Risk
            </Chip>
          </CardBody>
        </Card>

        {/* Module Scores */}
        <Card className="border border-gray-100 shadow-none col-span-1">
          <CardBody className="p-6 space-y-4">
            <p className="text-xs font-medium text-gray-500">Module Risk Scores</p>
            {modules.map((mod) => (
              <div key={mod.key} className="flex items-center gap-3">
                <span className="text-gray-400">{mod.icon}</span>
                <span className="text-sm text-gray-700 flex-1">{mod.label}</span>
                {mod.complete ? (
                  <Chip size="sm" variant="flat" color={getRiskLabel(mod.score).color}>
                    {Math.round(mod.score * 100)}%
                  </Chip>
                ) : (
                  <Chip size="sm" variant="flat" color="default">Pending</Chip>
                )}
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Completion Status */}
        <Card className="border border-gray-100 shadow-none col-span-1">
          <CardBody className="p-6 space-y-4">
            <p className="text-xs font-medium text-gray-500">Assessment Completion</p>
            <div className="flex items-center gap-3">
              <Progress value={completionPercent} color="primary" size="md" className="flex-1" />
              <span className="text-sm font-semibold text-gray-700">{completionPercent}%</span>
            </div>
            <div className="space-y-2">
              {Object.entries(data.completion_status).map(([key, done]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  {done ? (
                    <HiOutlineCheckCircle className="text-success" size={16} />
                  ) : (
                    <HiOutlineClock className="text-gray-300" size={16} />
                  )}
                  <span className={done ? 'text-gray-700' : 'text-gray-400'}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Key Findings */}
      <div className="grid grid-cols-2 gap-4">
        {/* Technical Debt */}
        {data.privacy_analysis?.technical_debt && (
          <Card className="border border-gray-100 shadow-none">
            <CardBody className="p-5 space-y-2">
              <p className="text-sm font-semibold text-gray-800">Top Technical Debt Items</p>
              {data.privacy_analysis.technical_debt.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Chip size="sm" color={item.severity === 'high' ? 'danger' : 'warning'} variant="dot">{item.severity}</Chip>
                  <span className="text-sm text-gray-700">{item.issue}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        )}

        {/* Bias Risks */}
        {data.bias_analysis?.bias_risk_scenarios && (
          <Card className="border border-gray-100 shadow-none">
            <CardBody className="p-5 space-y-2">
              <p className="text-sm font-semibold text-gray-800">Top Bias Risks</p>
              {data.bias_analysis.bias_risk_scenarios.slice(0, 4).map((scenario, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Chip size="sm" color={scenario.impact === 'high' ? 'danger' : 'warning'} variant="dot">{scenario.impact}</Chip>
                  <span className="text-sm text-gray-700 line-clamp-1">{scenario.scenario}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        )}

        {/* PET Recommendations */}
        {data.pet_recommendations?.recommendations && (
          <Card className="border border-gray-100 shadow-none">
            <CardBody className="p-5 space-y-2">
              <p className="text-sm font-semibold text-gray-800">Top PET Recommendations</p>
              {data.pet_recommendations.recommendations.slice(0, 4).map((pet, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{pet.name}</span>
                  <Chip size="sm" color="primary" variant="flat">{Math.round(pet.suitability_score * 100)}%</Chip>
                </div>
              ))}
            </CardBody>
          </Card>
        )}

        {/* Pre-Mortem Priorities */}
        {data.premortem_analysis?.top_priorities && (
          <Card className="border border-gray-100 shadow-none">
            <CardBody className="p-5 space-y-2">
              <p className="text-sm font-semibold text-gray-800">Pre-Mortem Priorities</p>
              {data.premortem_analysis.top_priorities.map((priority, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-danger mt-0.5 font-bold">{i + 1}.</span>
                  {priority}
                </div>
              ))}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
