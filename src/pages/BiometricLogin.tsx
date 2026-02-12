import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '@/store';
import { loginSuccess, simulateLogin } from '@/store/authSlice';
import { Fingerprint, CheckCircle2, XCircle, RotateCcw, ArrowLeft } from 'lucide-react';

type ScanState = 'idle' | 'scanning' | 'success' | 'failure';

export default function BiometricLogin() {
  const [state, setState] = useState<ScanState>('idle');
  const [progress, setProgress] = useState(0);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const startScan = () => {
    setState('scanning');
    setProgress(0);
  };

  useEffect(() => {
    if (state !== 'scanning') return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          const success = Math.random() > 0.3;
          if (success) {
            setState('success');
            const result = simulateLogin('customer');
            if (result) {
              setTimeout(() => {
                dispatch(loginSuccess(result));
                navigate('/customer');
              }, 1500);
            }
          } else {
            setState('failure');
          }
          return 100;
        }
        return p + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [state, dispatch, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center space-y-8"
      >
        <button
          onClick={() => navigate('/login')}
          className="absolute top-0 left-0 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div>
          <h1 className="text-2xl font-bold mb-2">Biometric Authentication</h1>
          <p className="text-muted-foreground text-sm">Place your finger on the scanner</p>
        </div>

        {/* Scanner */}
        <div className="relative w-48 h-48 mx-auto">
          {/* Outer ring */}
          <motion.div
            animate={state === 'scanning' ? { rotate: 360 } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
          />

          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="96" cy="96" r="88"
              fill="none"
              stroke="hsl(var(--primary) / 0.15)"
              strokeWidth="4"
            />
            <motion.circle
              cx="96" cy="96" r="88"
              fill="none"
              stroke={state === 'failure' ? 'hsl(var(--destructive))' : state === 'success' ? 'hsl(var(--success))' : 'hsl(var(--primary))'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={553}
              strokeDashoffset={553 - (553 * progress) / 100}
              transition={{ duration: 0.1 }}
            />
          </svg>

          {/* Center icon */}
          <div className="absolute inset-4 rounded-full bg-card/60 backdrop-blur-sm border border-border/30 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {state === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-success" />
                </motion.div>
              ) : state === 'failure' ? (
                <motion.div
                  key="failure"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                >
                  <XCircle className="w-16 h-16 text-destructive" />
                </motion.div>
              ) : (
                <motion.div
                  key="fingerprint"
                  animate={state === 'scanning' ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Fingerprint className="w-16 h-16 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scan line */}
          {state === 'scanning' && (
            <div className="absolute inset-4 rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          )}
        </div>

        {/* Status */}
        <AnimatePresence mode="wait">
          <motion.p
            key={state}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm font-medium"
          >
            {state === 'idle' && <span className="text-muted-foreground">Tap the button to begin</span>}
            {state === 'scanning' && <span className="text-primary">Verifying identity… {progress}%</span>}
            {state === 'success' && <span className="text-success">Identity verified! Redirecting…</span>}
            {state === 'failure' && <span className="text-destructive">Verification failed. Please retry.</span>}
          </motion.p>
        </AnimatePresence>

        {/* Action buttons */}
        {state === 'idle' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startScan}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium glow-primary transition-colors hover:bg-primary/90"
          >
            Start Scan
          </motion.button>
        )}
        {state === 'failure' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setState('idle'); setProgress(0); }}
            className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl border border-border/30 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
