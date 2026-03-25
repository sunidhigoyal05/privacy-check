import { useState } from 'react';
import { Button, Card, CardBody, Input } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { HiOutlineShieldCheck } from 'react-icons/hi2';

export default function AuthPage() {
  const { login, register, loading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setLocalError(null);
    clearError();
  };

  const validate = (): boolean => {
    if (!email.trim() || !password.trim()) {
      setLocalError('Email and password are required.');
      return false;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return false;
    }
    setLocalError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, password, full_name: fullName || undefined });
      }
    } catch {
      // error is set in the store
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
            <HiOutlineShieldCheck className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">PrivacyCheck</h1>
            <p className="text-[10px] text-gray-400 tracking-wide uppercase">World Bank</p>
          </div>
        </div>

        <Card className="border border-gray-100 shadow-sm">
          <CardBody className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {mode === 'login'
                  ? 'Welcome back to PrivacyCheck'
                  : 'Get started with your privacy assessments'}
              </p>
            </div>

            <div className="space-y-4">
              {mode === 'register' && (
                <Input
                  label="Full Name"
                  placeholder="Enter your name"
                  value={fullName}
                  onValueChange={setFullName}
                  variant="bordered"
                  size="sm"
                />
              )}
              <Input
                label="Email"
                placeholder="you@worldbank.org"
                type="email"
                value={email}
                onValueChange={setEmail}
                variant="bordered"
                size="sm"
              />
              <Input
                label="Password"
                placeholder="Min. 8 characters"
                type="password"
                value={password}
                onValueChange={setPassword}
                variant="bordered"
                size="sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {displayError && (
              <div className="bg-danger-50 text-danger-600 px-4 py-2 rounded-lg text-sm">
                {displayError}
              </div>
            )}

            <Button
              color="primary"
              className="w-full font-medium"
              onPress={handleSubmit}
              isLoading={loading}
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-gray-500">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={switchMode}
                className="text-primary-600 font-medium hover:underline"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
