import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import ToastContainer from './ToastContainer';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useAuthStore } from '../../store/authStore';
import IntakeWizard from '../../pages/IntakeWizard/IntakeWizard';
import PrivacyLab from '../../pages/PrivacyLab/PrivacyLab';
import BiasLab from '../../pages/BiasLab/BiasLab';
import GovernanceMap from '../../pages/GovernanceMap/GovernanceMap';
import JointDashboard from '../../pages/JointDashboard/JointDashboard';
import Report from '../../pages/Report/Report';
import AuthPage from '../../pages/Auth/AuthPage';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function AppShell() {
  const { activeSection } = useAssessmentStore();
  const { isAuthenticated, logout } = useAuthStore();

  // Listen for auth-expired events from the axios interceptor
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('auth-expired', handler);
    return () => window.removeEventListener('auth-expired', handler);
  }, [logout]);

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage />
        <ToastContainer />
      </>
    );
  }

  const renderPage = () => {
    switch (activeSection) {
      case 'intake': return <IntakeWizard />;
      case 'privacy-lab': return <PrivacyLab />;
      case 'bias-lab': return <BiasLab />;
      case 'governance': return <GovernanceMap />;
      case 'dashboard': return <JointDashboard />;
      case 'report': return <Report />;
      default: return <IntakeWizard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="p-8 max-w-6xl mx-auto"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <ToastContainer />
    </div>
  );
}
