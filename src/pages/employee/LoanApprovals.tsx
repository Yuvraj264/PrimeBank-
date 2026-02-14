import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockLoans, mockUsers } from '@/data/mockData';
import { Check, X, FileText, User, Info, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function LoanApprovals() {
    const [loans, setLoans] = useState(mockLoans);

    const handleAction = (id: number, action: 'approved' | 'rejected') => {
        // In a real app this would call an API
        const updatedLoans = loans.map(l => l.id === id ? { ...l, status: action } : l);

        // For UI demo, remove it from the list or update status
        // Let's filter it out to simulate "processed"
        setLoans(updatedLoans);
        toast.success(`Loan application ${action}`);
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

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {pendingLoans.map((loan) => {
                        const user = mockUsers.find(u => u.id === loan.userId);
                        // Mock risk score calculation
                        const riskScore = Math.floor(Math.random() * 100);
                        const scoreColor = riskScore > 50 ? 'text-destructive' : 'text-success';

                        return (
                            <GlassCard key={loan.id} className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{user?.name}</h3>
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
                                                    <span className="font-medium">$8,500</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Credit Score</span>
                                                    <span className="font-medium">742 (Excellent)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Debt-to-Income</span>
                                                    <span className="font-medium">32%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 p-4 rounded-lg bg-secondary/20">
                                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-warning" /> Risk Assessment
                                            </h4>
                                            <div>
                                                <div className="flex justify-between text-xs mb-2">
                                                    <span>Risk Score: {riskScore}/100</span>
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
            </div>
        </DashboardLayout>
    );
}
