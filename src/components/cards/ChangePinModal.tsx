import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    cardId: string;
}

export default function ChangePinModal({ isOpen, onClose, cardId }: Props) {
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPin !== confirmPin) {
            toast.error("New PINs do not match");
            return;
        }
        if (newPin.length !== 4) {
            toast.error("PIN must be exactly 4 digits");
            return;
        }

        setLoading(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("PIN changed successfully!");
            handleClose();
        } catch {
            toast.error("Failed to change PIN. Verify old PIN.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOldPin('');
        setNewPin('');
        setConfirmPin('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Change Card PIN</DialogTitle>
                    <DialogDescription>
                        Enter your current 4-digit PIN followed by your new PIN.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Current PIN</Label>
                        <Input
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            value={oldPin}
                            onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••"
                            required
                            className="text-center tracking-widest text-lg font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>New PIN</Label>
                        <Input
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••"
                            required
                            className="text-center tracking-widest text-lg font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Confirm New PIN</Label>
                        <Input
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••"
                            required
                            className="text-center tracking-widest text-lg font-mono"
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !oldPin || !newPin || !confirmPin}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save New PIN
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
