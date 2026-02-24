import { useEffect, useState } from 'react';
import { TransferState } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { accountService } from '@/services/accountService';

interface Props {
    data: TransferState;
    updateData: (data: Partial<TransferState>) => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function Step3Details({ data, updateData, onNext, onPrev }: Props) {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const fetchedAccounts = await accountService.getMyAccounts();
                setAccounts(fetchedAccounts);
                if (fetchedAccounts.length > 0 && !data.fromAccountId) {
                    updateData({ fromAccountId: fetchedAccounts[0].id });
                }
            } catch (error) {
                console.error('Failed to load accounts for transfer step');
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, [updateData]);

    const handleNext = () => {
        if (!data.fromAccountId || !data.amount || isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
            return; // Basic validation, can add toast here
        }
        updateData({ amount: data.amount });
        onNext();
    };

    const amountVal = Number(data.amount) || 0;
    const transactionFee = data.type === 'international' ? 15 : (data.type === 'bank' ? 2.5 : 0);
    const gst = transactionFee * 0.18; // 18% GST on fee
    const totalDeduction = amountVal + transactionFee + gst;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Transfer Details</h2>
                <p className="text-muted-foreground text-sm">Enter the amount and configure transfer settings.</p>
            </div>

            <div className="space-y-4 p-5 rounded-xl border border-border bg-card/30">
                <div className="space-y-2">
                    <Label>From Account</Label>
                    <Select value={data.fromAccountId} onValueChange={(val) => updateData({ fromAccountId: val })} disabled={loading}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder={loading ? "Loading accounts..." : "Select account"} />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id}>
                                    <div className="flex justify-between w-full pr-4">
                                        <span>{acc.type.replace('_', ' ')} (**** {acc.accountNumber.slice(-4)})</span>
                                        <span className="font-medium text-primary">${acc.balance.toFixed(2)}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg">$</span>
                        <Input
                            type="number"
                            placeholder="0.00"
                            className="pl-8 text-lg font-medium h-12 bg-background border-primary/20 focus-visible:ring-primary/30"
                            value={data.amount}
                            onChange={(e) => updateData({ amount: e.target.value })}
                        />
                    </div>
                </div>

                {amountVal > 0 && (
                    <div className="p-4 bg-secondary/20 rounded-lg space-y-2 text-sm border border-secondary">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Transfer Amount</span>
                            <span className="text-foreground">${amountVal.toFixed(2)}</span>
                        </div>
                        {transactionFee > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                                <span>Transaction Fee</span>
                                <span className="text-red-400 font-medium">+ ${transactionFee.toFixed(2)}</span>
                            </div>
                        )}
                        {gst > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                                <span>GST (18% on fee)</span>
                                <span className="text-red-400 font-medium">+ ${gst.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                            <span>Total Deduction</span>
                            <span className="text-primary">${totalDeduction.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Input
                        placeholder="What is this for?"
                        className="bg-background"
                        value={data.description}
                        onChange={(e) => updateData({ description: e.target.value })}
                    />
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                        <Label className="text-base">Save as Template</Label>
                        <p className="text-xs text-muted-foreground">Make future transfers faster</p>
                    </div>
                    <Switch
                        checked={data.saveTemplate}
                        onCheckedChange={(checked) => updateData({ saveTemplate: checked })}
                    />
                </div>
            </div>

            <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" onClick={onPrev}>Back</Button>
                <Button onClick={handleNext} disabled={!data.fromAccountId || !data.amount || Number(data.amount) <= 0}>
                    Continue to Review
                </Button>
            </div>
        </div>
    );
}
