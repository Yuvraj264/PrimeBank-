import { TransferState } from '../types';
import { Button } from '@/components/ui/button';
import { Clock, Edit2, ShieldAlert } from 'lucide-react';

interface Props {
    data: TransferState;
    onNext: () => void;
    onPrev: () => void;
    onEdit: (step: number) => void;
}

export default function Step4Review({ data, onNext, onPrev, onEdit }: Props) {
    const amountVal = Number(data.amount) || 0;
    const transactionFee = data.type === 'international' ? 15 : (data.type === 'bank' ? 2.5 : 0);
    const gst = transactionFee * 0.18;
    const totalDeduction = amountVal + transactionFee + gst;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Review Transfer</h2>
                <p className="text-muted-foreground text-sm">Please verify the details before confirming.</p>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-primary/5 p-4 border-b border-border flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Clock className="w-4 h-4" />
                        Estimated time: {data.type === 'upi' ? 'Instant' : data.type === 'international' ? '2-3 Business Days' : 'Within 2 hours'}
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    {/* Amount Section */}
                    <div className="flex justify-between items-end pb-4 border-b border-border/50">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                            <p className="text-4xl font-bold tracking-tight text-foreground">${amountVal.toFixed(2)}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(3)} className="h-8 text-xs px-2 text-muted-foreground">
                            <Edit2 className="w-3 h-3 mr-1" /> Edit
                        </Button>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">To Beneficiary</p>
                            <div className="font-medium flex justify-between items-center group cursor-pointer" onClick={() => onEdit(2)}>
                                <span className="truncate pr-2">{data.beneficiary?.name}</span>
                                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{data.beneficiary?.accountNumber || data.beneficiary?.upiId}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Transfer Type</p>
                            <p className="font-medium capitalize">{data.type?.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">From Account</p>
                            <div className="font-medium flex justify-between items-center group cursor-pointer" onClick={() => onEdit(3)}>
                                <span>****{data.fromAccountId?.slice(-4) || '0000'}</span>
                                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Description</p>
                            <p className="font-medium truncate">{data.description || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Fee Breakdown */}
                    <div className="pt-4 border-t border-border/50 space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Transfer Amount</span>
                            <span>${amountVal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Fees & Taxes</span>
                            <span>${(transactionFee + gst).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold pt-2">
                            <span>Total Deduction</span>
                            <span className="text-primary">${totalDeduction.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-lg border border-amber-500/20 text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Please ensure all details are correct. Transfers cannot be reversed once processed.</p>
            </div>

            <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" onClick={onPrev}>Back</Button>
                <Button onClick={onNext} className="min-w-[140px]">
                    Confirm & Proceed
                </Button>
            </div>
        </div>
    );
}
