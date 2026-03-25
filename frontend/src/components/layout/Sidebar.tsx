import { useEffect } from 'react';
import { NavSection } from '../../types';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useAuthStore } from '../../store/authStore';
import { listAssessments } from '../../services/api';
import { motion } from 'framer-motion';
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineScale,
  HiOutlineChartBarSquare,
  HiOutlineDocumentArrowDown,
  HiOutlineArrowRightOnRectangle,
  HiOutlineFolderOpen,
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
  const { activeSection, setActiveSection, currentAssessment, savedAssessments, setSavedAssessments, setCurrentAssessment } = useAssessmentStore();
  const { logout, user } = useAuthStore();

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
    <aside className="w-72 bg-white border-r border-gray-100 min-h-screen flex flex-col shadow-sm">
      {/* Logo / Title */}
      <div className="px-6 py-6 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-wb-sky to-wb-teal flex items-center justify-center">
            <HiOutlineShieldCheck className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-wb-blue">PrivacyCheck</h1>
            <p className="text-[10px] text-gray-400 tracking-wide uppercase">World Bank</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
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
                  ? 'bg-primary-50 text-primary-600 shadow-sm'
                  : isLocked
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className={isActive ? 'text-primary-500' : ''}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>

              {/* Status dot */}
              {status === 'completed' && (
                <span className="w-2 h-2 rounded-full bg-success" />
              )}
              {status === 'available' && !isActive && (
                <span className="w-2 h-2 rounded-full bg-gray-200" />
              )}
            </motion.button>
          );
        })}

        {/* Saved Assessments */}
        {savedAssessments.length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-100">
            <p className="px-4 text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2">Saved Assessments</p>
            {savedAssessments.slice(0, 5).map((a) => (
              <button
                key={a.id}
                onClick={() => handleLoadAssessment(a)}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-colors
                  ${
                    currentAssessment?.id === a.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
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
      <div className="px-4 py-4 border-t border-gray-50 space-y-2">
        {user?.email && (
          <p className="text-[11px] text-gray-500 text-center truncate px-2">{user.email}</p>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <HiOutlineArrowRightOnRectangle size={16} />
          Sign Out
        </button>
        <p className="text-[10px] text-gray-400 text-center">
          PrivacyCheck v1.0 — Privacy Risk Assessment Toolkit
        </p>
      </div>
    </aside>
  );
}
