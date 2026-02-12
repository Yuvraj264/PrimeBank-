import { motion } from 'framer-motion';
import AppSidebar from './AppSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="lg:ml-[260px] min-h-screen p-4 md:p-6 lg:p-8 pt-16 lg:pt-8"
      >
        {children}
      </motion.main>
    </div>
  );
}
