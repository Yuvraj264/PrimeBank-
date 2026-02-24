import { Building2, Globe, Smartphone, ArrowRightLeft, CalendarClock } from "lucide-react";
import { TransferState, TransferType } from "../types";
import { cn } from "@/lib/utils";

interface Props {
    data: TransferState;
    updateData: (data: Partial<TransferState>) => void;
    onNext: () => void;
}

const types: { id: TransferType; label: string; description: string; icon: any }[] = [
    { id: 'internal', label: 'Internal Transfer', description: 'Between your own accounts', icon: ArrowRightLeft },
    { id: 'bank', label: 'Bank Transfer', description: 'NEFT / IMPS / RTGS', icon: Building2 },
    { id: 'upi', label: 'UPI Transfer', description: 'Instant transfer via UPI ID', icon: Smartphone },
    { id: 'international', label: 'International', description: 'Cross-border payments', icon: Globe },
    { id: 'scheduled', label: 'Scheduled', description: 'Set up future standing instructions', icon: CalendarClock },
];

export default function Step1TypeSelect({ data, updateData, onNext }: Props) {
    const handleSelect = (id: TransferType) => {
        updateData({ type: id, beneficiary: null });
        onNext();
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Select Transfer Type</h2>
                <p className="text-muted-foreground text-sm">Choose how you want to send money today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {types.map((t) => {
                    const Icon = t.icon;
                    const isSelected = data.type === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => handleSelect(t.id)}
                            className={cn(
                                "flex items-start gap-4 p-5 rounded-xl border text-left transition-all duration-300",
                                "hover:border-primary/50 hover:bg-primary/5 group",
                                isSelected ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border bg-card/30",
                                ((t.id === 'international' || t.id === 'scheduled') && !isSelected) && "opacity-60"
                            )}
                        >
                            <div className={cn(
                                "p-3 rounded-lg bg-secondary transition-colors group-hover:bg-primary group-hover:text-primary-foreground",
                                isSelected && "bg-primary text-primary-foreground"
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">{t.label}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
}
