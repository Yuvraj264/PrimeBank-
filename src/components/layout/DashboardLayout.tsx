import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <div className="flex-1 lg:ml-[260px] min-w-0 max-w-full lg:max-w-[calc(100vw-260px)]">
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="min-h-screen p-4 md:p-6 lg:p-8 pt-20 lg:pt-8 w-full max-w-[1600px] mx-auto overflow-x-hidden"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
