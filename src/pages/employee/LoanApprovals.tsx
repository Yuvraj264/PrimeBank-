import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { loanService } from '@/services/loanService';
import { Loan } from '@/types';
import { Check, X, FileText, User as UserIcon, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoanApprovals() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLoans();
        const interval = setInterval(loadLoans, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadLoans = async () => {
        try {
            const data = await loanService.getAllLoans();
            setLoans(data);
        } catch (error) {
            console.error('Failed to load loans:', error);
            toast.error('Failed to load loan applications');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approved' | 'rejected') => {
        try {
            await loanService.updateLoanStatus(id, action, `Application ${action} by employee`);
            toast.success(`Loan application ${action}`);
            loadLoans();
        } catch (error) {
            toast.error('Failed to update loan status');
        }
    };

    const getRiskScoreColor = (score: number) => {
        if (score < 30) return 'bg-success';
        if (score < 70) return 'bg-warning';
        return 'bg-destructive';
    };

    const pendingLoans = loans.filter(l => l.status === 'pending');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Loan Approvals</h1>
                    <p className="text-muted-foreground text-sm mt-1">Review credit applications and risk assessments</p>
                </div>

                {loading ? (
                    <div className="flex justify-center p-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {pendingLoans.map((loan) => {
                            // userId is populated by backend
                            const user = loan.userId as any;
                            const riskScore = loan.creditScore ? Math.min(100, Math.max(0, 100 - Math.floor((loan.creditScore - 300) / 5.5))) : 50;
                            const scoreColor = riskScore > 50 ? 'text-destructive' : 'text-success';

                            return (
                                <GlassCard key={loan.id} className="flex flex-col h-full justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                    <UserIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">{user?.name || 'Unknown User'}</h3>
                                                    <p className="text-sm text-muted-foreground capitalize">{loan.type.replace('_', ' ')} Loan Application</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-bold">${loan.amount.toLocaleString()}</span>
                                                <p className="text-xs text-muted-foreground">{loan.interestRate}% APR • {loan.tenure} Months</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div className="space-y-4 p-4 rounded-lg bg-secondary/20">
                                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                                    <Info className="w-4 h-4 text-primary" /> Application Details
                                                </h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Monthly Income</span>
                                                        <span className="font-medium">${(loan as any).monthlyIncome?.toLocaleString() || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Credit Score</span>
                                                        <span className="font-medium">{loan.creditScore || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Employment</span>
                                                        <span className="font-medium capitalize">{(loan as any).employmentStatus || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 p-4 rounded-lg bg-secondary/20">
                                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-warning" /> Risk Assessment
                                                </h4>
                                                <div>
                                                    <div className="flex justify-between text-xs mb-2">
                                                        <span>Risk Level</span>
                                                        <span className={scoreColor}>
                                                            {riskScore > 50 ? 'High Risk' : 'Low Risk'}
                                                        </span>
                                                    </div>
                                                    <Progress value={riskScore} className={`h-2 ${getRiskScoreColor(riskScore)}`} />
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-2">
                                                    AI-generated risk assessment based on credit history.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => handleAction(loan.id, 'rejected')}
                                        >
                                            <X className="w-4 h-4 mr-2" /> Reject Application
                                        </Button>
                                        <Button
                                            className="flex-1 bg-success hover:bg-success/90 text-white"
                                            onClick={() => handleAction(loan.id, 'approved')}
                                        >
                                            <Check className="w-4 h-4 mr-2" /> Approve Loan
                                        </Button>
                                    </div>
                                </GlassCard>
                            );
                        })}
                        {pendingLoans.length === 0 && (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mb-6">
                                    <FileText className="w-10 h-10 opacity-40" />
                                </div>
                                <h3 className="text-xl font-bold">No Pending Applications</h3>
                                <p className="text-muted-foreground mt-2">Good job! You've processed all loan requests.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
