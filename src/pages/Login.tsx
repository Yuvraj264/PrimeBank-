import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store';
import { login, loginFailure } from '@/store/authSlice';
import { UserRole } from '@/types';
import { Landmark, Shield, Users, UserCheck, Fingerprint, ArrowRight, Lock, Mail } from 'lucide-react';

const roles: { role: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  { role: 'admin', label: 'Administrator', icon: Shield, description: 'System management & monitoring' },
  { role: 'employee', label: 'Employee', icon: UserCheck, description: 'Customer operations & approvals' },
  { role: 'customer', label: 'Customer', icon: Users, description: 'Banking & account services' },
  { role: 'merchant', label: 'Merchant', icon: Landmark, description: 'Business & API Banking Hub' },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Set default credentials for demo purposes
  useEffect(() => {
    switch (selectedRole) {
      case 'employee':
        setEmail('employee@ibank.com');
        break;
      case 'admin':
        setEmail('admin@ibank.com');
        break;
      case 'merchant':
        setEmail('merchant@ibank.com');
        break;
      case 'customer':
        setEmail('customer@ibank.com');
        break;
      default:
        setEmail('');
    }
  }, [selectedRole]);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      dispatch(loginFailure('Please enter both email and password'));
      return;
    }

    try {
      const result = await dispatch(login({ email, password })).unwrap();
      navigate(`/${result.data.role}`);
      toast.success('Login successful!');
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = typeof err === 'string' ? err : (err?.message || 'Login failed. Please check your credentials.');
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 mb-4 glow-primary">
            <Landmark className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">iBank</h1>
          <p className="text-muted-foreground mt-1">Enterprise Banking Platform</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Sign in as</label>
            <div className="grid grid-cols-2 gap-2"> {/* Changed to 2 columns for better layout with 4 roles */}
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => setSelectedRole(r.role)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-center transition-all duration-200 ${selectedRole === r.role
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border/30 hover:border-border/50 text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <r.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{r.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {roles.find((r) => r.role === selectedRole)?.description}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`${selectedRole}@ibank.com`}
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border/30 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border/30 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors glow-primary"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-primary hover:underline font-medium"
              >
                Sign Up
              </button>
            </div>
          </form>

          {/* Biometric */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/30" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground">or</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/biometric-login')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border/30 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
          >
            <Fingerprint className="w-4 h-4" />
            Biometric Login
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Enter your credentials to sign in
        </p>
      </motion.div>
    </div>
  );
}
