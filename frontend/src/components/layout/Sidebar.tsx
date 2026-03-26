import { useEffect } from 'react';
import { NavSection } from '../../types';
import { useAssessmentStore } from '../../store/assessmentStore';
import { listAssessments } from '../../services/api';
import { motion } from 'framer-motion';
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineScale,
  HiOutlineChartBarSquare,
  HiOutlineDocumentArrowDown,
  HiOutlineFolderOpen,
  HiOutlinePlusCircle,
} from 'react-icons/hi2';

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'intake', label: 'Start Your Assessment', icon: <HiOutlineClipboardDocumentCheck size={20} /> },
  { id: 'privacy-lab', label: 'Privacy Engineering Lab', icon: <HiOutlineShieldCheck size={20} /> },
  { id: 'bias-lab', label: 'Bias & Inclusion Lab', icon: <HiOutlineUserGroup size={20} /> },
  { id: 'governance', label: 'Governance & Accountability', icon: <HiOutlineScale size={20} /> },
  { id: 'dashboard', label: 'Joint Dashboard', icon: <HiOutlineChartBarSquare size={20} /> },
  { id: 'report', label: 'Report', icon: <HiOutlineDocumentArrowDown size={20} /> },
];

export default function Sidebar() {
  const { activeSection, setActiveSection, currentAssessment, savedAssessments, setSavedAssessments, setCurrentAssessment, newAssessment } = useAssessmentStore();

  // Load saved assessments on mount
  useEffect(() => {
    listAssessments()
      .then(setSavedAssessments)
      .catch(() => {}); // silently fail — toast handles it
  }, [setSavedAssessments]);

  const handleLoadAssessment = (assessment: typeof savedAssessments[number]) => {
    setCurrentAssessment(assessment);
    // Navigate to the furthest completed section
    if (assessment.governance_map) setActiveSection('dashboard');
    else if (assessment.bias_analysis) setActiveSection('governance');
    else if (assessment.privacy_analysis) setActiveSection('bias-lab');
    else setActiveSection('privacy-lab');
  };

  const getCompletionStatus = (id: NavSection): 'completed' | 'available' | 'locked' => {
    if (id === 'intake') return currentAssessment ? 'completed' : 'available';
    if (!currentAssessment) return 'locked';

    const a = currentAssessment;
    switch (id) {
      case 'privacy-lab': return a.privacy_analysis ? 'completed' : 'available';
      case 'bias-lab': return a.bias_analysis ? 'completed' : 'available';
      case 'governance': return a.governance_map ? 'completed' : 'available';
      case 'dashboard': return 'available';
      case 'report': return 'available';
      default: return 'available';
    }
  };

  return (
    <aside className="w-72 bg-[#0A0A14] border-r border-[#1C1C2C] min-h-screen flex flex-col">
      {/* Logo / Title */}
      <div className="px-6 py-6 border-b border-[#1C1C2C]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#5AA8E8] to-[#2DD4BF] flex items-center justify-center shadow-lg shadow-[#5AA8E8]/20">
            <HiOutlineShieldCheck className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#E8E8FA]">PrivacyCheck</h1>
            <p className="text-[10px] text-[#4F4F80] tracking-wide uppercase">World Bank</p>
          </div>
        </div>
      </div>

      {/* New Assessment Button */}
      <div className="px-3 py-3 border-b border-[#1C1C2C]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={newAssessment}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5AA8E8]/20 to-[#2DD4BF]/20 border border-[#5AA8E8]/30 text-[#5AA8E8] text-sm font-medium hover:from-[#5AA8E8]/30 hover:to-[#2DD4BF]/30 transition-all duration-200"
        >
          <HiOutlinePlusCircle size={17} />
          New Assessment
        </motion.button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const status = getCompletionStatus(item.id);
          const isActive = activeSection === item.id;
          const isLocked = status === 'locked';

          return (
            <motion.button
              key={item.id}
              whileHover={!isLocked ? { x: 2 } : undefined}
              whileTap={!isLocked ? { scale: 0.98 } : undefined}
              onClick={() => !isLocked && setActiveSection(item.id)}
              disabled={isLocked}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-[#5AA8E8]/10 text-[#5AA8E8] shadow-none'
                  : isLocked
                    ? 'text-[#2C2C44] cursor-not-allowed'
                    : 'text-[#8888B4] hover:bg-[#141420] hover:text-[#E8E8FA]'
                }
              `}
            >
              <span className={isActive ? 'text-primary-500' : ''}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>

              {/* Status dot */}
              {status === 'completed' && (
                <span className="w-2 h-2 rounded-full bg-[#17C964] shadow-sm shadow-[#17C964]/50" />
              )}
              {status === 'available' && !isActive && (
                <span className="w-2 h-2 rounded-full bg-[#2C2C44]" />
              )}
            </motion.button>
          );
        })}

        {/* Saved Assessments */}
        {savedAssessments.length > 0 && (
          <div className="pt-4 mt-4 border-t border-[#1C1C2C]">
            <p className="px-4 text-[10px] uppercase font-semibold text-[#4F4F80] tracking-wider mb-2">Saved Assessments</p>
            {savedAssessments.slice(0, 5).map((a) => (
              <button
                key={a.id}
                onClick={() => handleLoadAssessment(a)}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-colors
                  ${
                    currentAssessment?.id === a.id
                      ? 'bg-[#5AA8E8]/10 text-[#5AA8E8]'
                      : 'text-[#6666A0] hover:bg-[#141420] hover:text-[#AAAACE]'
                  }
                `}
              >
                <HiOutlineFolderOpen size={14} />
                <span className="truncate flex-1 text-left">{a.project_name}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#1C1C2C]">
        <p className="text-[10px] text-[#4F4F80] text-center">
          PrivacyCheck v1.0 — Privacy Risk Assessment Toolkit
        </p>
      </div>
    </aside>
  );
}
