import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, UserPlus, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Beneficiary } from '@/types';
import { beneficiaryService } from '@/services/beneficiaryService';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    beneficiaryToEdit?: Beneficiary;
    onSuccess: (ben: Beneficiary, isEdit: boolean) => void;
}

export default function BeneficiaryModal({ open, onOpenChange, beneficiaryToEdit, onSuccess }: Props) {
    const isEditing = !!beneficiaryToEdit;

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        nickname: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        dailyLimit: 50000
    });

    // OTP State
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [verifying, setVerifying] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setStep(1);
            setOtp(['', '', '', '', '', '']);
            if (beneficiaryToEdit) {
                setFormData({
                    name: beneficiaryToEdit.name,
                    nickname: beneficiaryToEdit.nickname || '',
                    accountNumber: beneficiaryToEdit.accountNumber,
                    bankName: beneficiaryToEdit.bankName,
                    ifscCode: beneficiaryToEdit.ifscCode || '',
                    dailyLimit: beneficiaryToEdit.dailyLimit || 50000
                });
            } else {
                setFormData({
                    name: '',
                    nickname: '',
                    accountNumber: '',
                    bankName: '',
                    ifscCode: '',
                    dailyLimit: 50000
                });
            }
        }
    }, [open, beneficiaryToEdit]);

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
        toast.info("A 6-digit OTP has been sent to your registered mobile number");
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== '' && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const submitAction = async () => {
        const fullOtp = otp.join('');
        if (fullOtp.length < 6) {
            toast.error("Please enter complete OTP");
            return;
        }

        setVerifying(true);
        setLoading(true);

        try {
            // Simulate OTP verification delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock OTP failure on 000000
            if (fullOtp === '000000') {
                throw new Error("Invalid OTP entered");
            }

            let result: Beneficiary;

            if (isEditing && beneficiaryToEdit) {
                // If editing, only update the allowed fields via the new schema
                result = await beneficiaryService.updateBeneficiary(beneficiaryToEdit._id, {
                    nickname: formData.nickname,
                    dailyLimit: formData.dailyLimit
                });
                toast.success('Beneficiary updated successfully');
            } else {
                result = await beneficiaryService.addBeneficiary({
                    name: formData.name,
                    accountNumber: formData.accountNumber,
                    bankName: formData.bankName,
                    ifscCode: formData.ifscCode,
                    nickname: formData.nickname,
                    dailyLimit: formData.dailyLimit
                });
                toast.success('Beneficiary added securely');
            }

            onSuccess(result, isEditing);
            onOpenChange(false);

        } catch (error: any) {
            toast.error(error.message || error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} beneficiary`);
        } finally {
            setVerifying(false);
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {step === 1 ? (
                            isEditing ? <><Edit2 className="w-5 h-5 text-primary" /> Edit Beneficiary</>
                                : <><UserPlus className="w-5 h-5 text-primary" /> Add New Beneficiary</>
                        ) : (
                            <><ShieldCheck className="w-5 h-5 text-primary" /> Security Verification</>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 1 ? 'Enter the details of the recipient.' : 'Enter the 6-digit OTP sent to your phone to confirm this action.'}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    <form onSubmit={handleNextStep} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Full Name / Account Name <span className="text-destructive">*</span></Label>
                            <Input
                                placeholder="E.g., John Doe"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled={isEditing}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Nickname (Optional)</Label>
                            <Input
                                placeholder="E.g., Landlord"
                                value={formData.nickname}
                                onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Account Number <span className="text-destructive">*</span></Label>
                            <Input
                                placeholder="Enter account number"
                                value={formData.accountNumber}
                                onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                                required
                                disabled={isEditing}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bank Name <span className="text-destructive">*</span></Label>
                                <Input
                                    placeholder="Enter bank name"
                                    value={formData.bankName}
                                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                                    required
                                    disabled={isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>IFSC Code <span className="text-destructive">*</span></Label>
                                <Input
                                    placeholder="BANK0001234"
                                    value={formData.ifscCode}
                                    onChange={e => setFormData({ ...formData, ifscCode: e.target.value })}
                                    required
                                    disabled={isEditing}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Daily Transfer Limit ($)</Label>
                            <Input
                                type="number"
                                min="100"
                                max="100000"
                                value={formData.dailyLimit}
                                onChange={e => setFormData({ ...formData, dailyLimit: Number(e.target.value) })}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Maximum allowed per day for this contact.</p>
                        </div>

                        <Button type="submit" className="w-full mt-2">Continue to Verification</Button>
                    </form>
                ) : (
                    <div className="space-y-6 py-4">
                        <div className="flex justify-center gap-2">
                            {otp.map((digit, index) => (
                                <Input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-xl font-bold bg-secondary/50 border-primary/20 focus-visible:ring-primary/50"
                                />
                            ))}
                        </div>

                        <div className="bg-primary/5 p-4 rounded-lg flex items-start gap-3 border border-primary/10">
                            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div className="text-sm text-muted-foreground leading-snug">
                                You are about to <strong className="text-foreground">{isEditing ? 'modify' : 'add'}</strong> a beneficiary
                                named <strong className="text-foreground">{formData.name}</strong>
                                {formData.accountNumber && !isEditing ? ` with account ${formData.accountNumber.slice(-4)}` : ''}.
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={loading}>
                                Back
                            </Button>
                            <Button type="button" className="flex-1" onClick={submitAction} disabled={verifying || loading || otp.join('').length < 6}>
                                {verifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Verify & Save
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
