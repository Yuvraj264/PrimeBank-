import { useState } from 'react';
import { TransferState } from '../types';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { transactionService } from '@/services/transactionService';
import { toast } from 'sonner';

interface Props {
    data: TransferState;
    updateData: (data: Partial<TransferState>) => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function Step5Confirm({ data, updateData, onNext, onPrev }: Props) {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (pin.length !== 4) {
            toast.error('Please enter a 4-digit PIN');
            return;
        }

        setLoading(true);
        try {
            // API call to perform the transfer
            await transactionService.transfer({
                receiverAccountNumber: data.beneficiary?.accountNumber || data.beneficiary?.upiId || '',
                amount: Number(data.amount),
                description: data.description || 'Transfer via Wizard',
                fromAccountId: data.fromAccountId
            });

            updateData({ pin });
            toast.success('Transfer Successful');
            onNext();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Transfer failed. Check your PIN or balance.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-sm mx-auto pt-6">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Enter Secure PIN</h2>
                <p className="text-muted-foreground text-sm">
                    Please enter your 4-digit transaction PIN to authorize the payment of
                    <span className="font-semibold text-foreground ml-1">${Number(data.amount).toFixed(2)}</span>.
                </p>
            </div>

            <div className="flex justify-center py-6">
                <InputOTP
                    maxLength={4}
                    value={pin}
                    onChange={setPin}
                    autoFocus
                    disabled={loading}
                >
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                    </InputOTPGroup>
                </InputOTP>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
                <Lock className="w-3.5 h-3.5" />
                <span>Your connection is 256-bit encrypted</span>
            </div>

            <div className="space-y-3 pt-4">
                <Button
                    className="w-full"
                    onClick={handleConfirm}
                    disabled={pin.length !== 4 || loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                        </>
                    ) : (
                        'Authorize & Transfer'
                    )}
                </Button>
                <Button variant="ghost" className="w-full" onClick={onPrev} disabled={loading}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
