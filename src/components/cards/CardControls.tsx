import { useState, useEffect } from 'react';
import { Card } from '@/services/cardService';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Lock, Unlock, Globe, KeyRound, Ban, CreditCard as CardIcon } from 'lucide-react';
import ChangePinModal from './ChangePinModal';
import { toast } from 'sonner';

interface Props {
    card: Card;
    onUpdateCard: (updatedCard: Card) => void;
    onRequestReplacement: () => void;
    onReportLost: () => void;
}

export default function CardControls({ card, onUpdateCard, onRequestReplacement, onReportLost }: Props) {
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [limits, setLimits] = useState({
        daily: card.dailyLimit || 5000,
        online: card.onlineLimit || 2000,
        atm: card.atmLimit || 1000,
    });

    // Reset local state if card changes
    useEffect(() => {
        setLimits({
            daily: card.dailyLimit || 5000,
            online: card.onlineLimit || 2000,
            atm: card.atmLimit || 1000,
        });
    }, [card]);

    const handleToggleFreeze = () => {
        const newStatus = card.status === 'frozen' ? 'active' : 'frozen';
        onUpdateCard({ ...card, status: newStatus });
    };

    const handleToggleInternational = (checked: boolean) => {
        onUpdateCard({ ...card, internationalEnabled: checked });
        toast.success(`International usage ${checked ? 'enabled' : 'disabled'}`);
    };

    const handleLimitChange = (key: keyof typeof limits, value: number[]) => {
        setLimits(prev => ({ ...prev, [key]: value[0] }));
    };

    const handleLimitCommit = (key: keyof typeof limits) => {
        onUpdateCard({
            ...card,
            [`${key}Limit`]: limits[key]
        });
        toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} limit updated to $${limits[key]}`);
    };

    const isFrozen = card.status === 'frozen';

    return (
        <div className="space-y-6">
            {/* Primary Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassCard className={`p-4 flex items-center justify-between transition-colors ${isFrozen ? 'bg-destructive/10 border-destructive/30' : ''}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isFrozen ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary'}`}>
                            {isFrozen ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="font-semibold">{isFrozen ? 'Card Frozen' : 'Freeze Card'}</p>
                            <p className="text-xs text-muted-foreground">Temporarily block transactions</p>
                        </div>
                    </div>
                    <Switch checked={isFrozen} onCheckedChange={handleToggleFreeze} />
                </GlassCard>

                <GlassCard className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold">International</p>
                            <p className="text-xs text-muted-foreground">Enable foreign transactions</p>
                        </div>
                    </div>
                    <Switch
                        checked={!!card.internationalEnabled}
                        onCheckedChange={handleToggleInternational}
                        disabled={isFrozen}
                    />
                </GlassCard>
            </div>

            {/* Limits Setting */}
            <GlassCard className="p-5 space-y-6">
                <h3 className="font-semibold border-b border-border/50 pb-2 mb-4">Spending Limits</h3>

                <div className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">Daily Spending Limit</Label>
                            <span className="font-bold text-primary">${limits.daily}</span>
                        </div>
                        <Slider
                            min={100} max={10000} step={100}
                            value={[limits.daily]}
                            onValueChange={(v) => handleLimitChange('daily', v)}
                            onValueCommit={() => handleLimitCommit('daily')}
                            disabled={isFrozen}
                        />
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">Online Transactions</Label>
                            <span className="font-bold text-primary">${limits.online}</span>
                        </div>
                        <Slider
                            min={100} max={limits.daily} step={100}
                            value={[limits.online]}
                            onValueChange={(v) => handleLimitChange('online', v)}
                            onValueCommit={() => handleLimitCommit('online')}
                            disabled={isFrozen}
                        />
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">ATM Withdrawals</Label>
                            <span className="font-bold text-primary">${limits.atm}</span>
                        </div>
                        <Slider
                            min={100} max={2000} step={50}
                            value={[limits.atm]}
                            onValueChange={(v) => handleLimitChange('atm', v)}
                            onValueCommit={() => handleLimitCommit('atm')}
                            disabled={isFrozen}
                        />
                    </div>
                </div>
            </GlassCard>

            {/* Security Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center p-6 h-auto gap-2 bg-secondary/20 hover:bg-secondary/40 border-border/50"
                    onClick={() => setIsPinModalOpen(true)}
                    disabled={isFrozen}
                >
                    <KeyRound className="w-5 h-5 text-primary" />
                    <span className="text-sm">Change PIN</span>
                </Button>

                <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center p-6 h-auto gap-2 bg-secondary/20 hover:bg-secondary/40 border-border/50"
                    onClick={onRequestReplacement}
                >
                    <CardIcon className="w-5 h-5 text-orange-500" />
                    <span className="text-sm">Replace Card</span>
                </Button>

                <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center p-6 h-auto gap-2 bg-destructive/10 hover:bg-destructive/20 border-destructive/20 text-destructive hover:text-destructive"
                    onClick={onReportLost}
                >
                    <Ban className="w-5 h-5" />
                    <span className="text-sm">Report Lost</span>
                </Button>
            </div>

            <ChangePinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                cardId={card.id}
            />
        </div>
    );
}
