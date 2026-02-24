import DashboardLayout from '@/components/layout/DashboardLayout';
import TransferWizard from '@/components/transfers/TransferWizard';
import GlassCard from '@/components/shared/GlassCard';
import { User as UserIcon } from 'lucide-react';

export default function Transfers() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transfers & Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">Move money securely to anyone, anywhere.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 relative z-10">
            <TransferWizard />
          </div>

          <div className="space-y-6 lg:sticky lg:top-6">
            <GlassCard className="border border-border/50 bg-card/40 backdrop-blur-md shadow-sm">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-primary" /> Quick Send
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { name: 'Sarah', cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
                  { name: 'Mike', cls: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
                  { name: 'Alex', cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
                  { name: 'Mom', cls: 'bg-purple-500/10 text-purple-500 border-purple-500/20' }
                ].map((user, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 min-w-[64px] cursor-pointer group">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${user.cls}`}>
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{user.name}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-2 min-w-[64px] cursor-pointer group">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground transition-all duration-300 group-hover:border-primary group-hover:text-primary group-hover:scale-105">
                    +
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Add</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="bg-gradient-to-br from-primary/5 via-card/50 to-transparent border border-primary/10 shadow-sm relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
              <h3 className="text-sm font-semibold mb-5 relative z-10">Your Limits</h3>
              <div className="space-y-5 relative z-10">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-medium">Daily Transfer Limit</span>
                    <span className="text-muted-foreground font-medium">$5,000.00</span>
                  </div>
                  <div className="h-2 w-full bg-secondary/60 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[35%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 text-right">$1,750.00 used</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-medium">Monthly Limit</span>
                    <span className="text-muted-foreground font-medium">$50,000.00</span>
                  </div>
                  <div className="h-2 w-full bg-secondary/60 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[15%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 text-right">$7,500.00 used</p>
                </div>
              </div>
            </GlassCard>

            <div className="bg-card/30 rounded-xl p-4 border border-border text-xs text-muted-foreground flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <p>For large transfers exceeding your daily limit, please contact your account manager or use our secure scheduled transfer feature.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
