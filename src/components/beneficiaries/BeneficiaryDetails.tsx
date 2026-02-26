import { Star, Edit2, Trash2, ShieldCheck, Send, Banknote, Building2, MapPin, UserPlus } from 'lucide-react';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Beneficiary, Transaction } from '@/types';
import TransferHistory from './TransferHistory';
import { EmptyState } from '@/components/shared/FeedbackStates';

interface BeneficiaryDetailsProps {
    activeBeneficiary?: Beneficiary;
    transactions: Transaction[];
    onEdit: () => void;
    onDelete: () => void;
    onQuickTransfer: () => void;
}

export default function BeneficiaryDetails({
    activeBeneficiary,
    transactions,
    onEdit,
    onDelete,
    onQuickTransfer
}: BeneficiaryDetailsProps) {
    if (!activeBeneficiary) {
        return (
            <GlassCard className="flex-1 flex items-center justify-center p-8 text-center border-dashed border-border/50">
                <EmptyState
                    icon={UserPlus}
                    title="No Contact Selected"
                    description="Select a beneficiary from the list to view their details, limits, and transfer history."
                />
            </GlassCard>
        );
    }

    return (
        <GlassCard className="flex-1 flex flex-col p-6 min-h-0 overflow-y-auto custom-scrollbar border-border/50">
            {/* Header Details */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-border/50 pb-6 shrink-0">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl shadow-lg shadow-primary/5">
                        {activeBeneficiary.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight">{activeBeneficiary.nickname || activeBeneficiary.name}</h2>
                            {activeBeneficiary.isFavorite && <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />}
                        </div>
                        <p className="text-muted-foreground">{activeBeneficiary.nickname ? activeBeneficiary.name : 'Verified Recipient'}</p>

                        <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                            <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/30 px-2 py-1 rounded-md border border-border/30">
                                <Building2 className="w-3.5 h-3.5 text-primary" /> {activeBeneficiary.bankName}
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/30 px-2 py-1 rounded-md border border-border/30">
                                <MapPin className="w-3.5 h-3.5 text-primary" /> {activeBeneficiary.ifscCode}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 hover:bg-secondary/40"
                        onClick={onEdit}
                    >
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                        onClick={onDelete}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Body Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Info & Limits */}
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                            <ShieldCheck className="w-4 h-4 text-primary" /> Configuration
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-background/40 border border-border/50 rounded-xl p-3 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-muted-foreground">Account Number</p>
                                    <p className="font-mono text-sm mt-0.5">{activeBeneficiary.accountNumber}</p>
                                </div>
                            </div>
                            <div className="bg-background/40 border border-border/50 rounded-xl p-3 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-muted-foreground">Daily Transfer Limit</p>
                                    <p className="font-semibold text-sm mt-0.5">${(activeBeneficiary.dailyLimit || 50000).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 text-md shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-shadow"
                        onClick={onQuickTransfer}
                    >
                        <Send className="w-5 h-5 mr-2 -ml-1" /> Quick Transfer
                    </Button>
                </div>

                {/* History */}
                <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                        <Banknote className="w-4 h-4 text-primary" /> Transfer History
                    </h3>
                    <TransferHistory beneficiary={activeBeneficiary} transactions={transactions} />
                </div>
            </div>
        </GlassCard>
    );
}
