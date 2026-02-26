import { Search, Star, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import GlassCard from '@/components/shared/GlassCard';
import { Beneficiary } from '@/types';
import { EmptyState } from '@/components/shared/FeedbackStates';
import { Skeleton } from '@/components/ui/skeleton';

interface BeneficiaryListProps {
    beneficiaries: Beneficiary[];
    searchTerm: string;
    onSearchChange: (val: string) => void;
    selectedId: string | null;
    onSelect: (id: string) => void;
    onToggleFavorite: (e: React.MouseEvent, ben: Beneficiary) => void;
    loading: boolean;
}

export default function BeneficiaryList({
    beneficiaries,
    searchTerm,
    onSearchChange,
    selectedId,
    onSelect,
    onToggleFavorite,
    loading
}: BeneficiaryListProps) {
    return (
        <GlassCard className="p-4 flex-1 flex flex-col min-h-0 border-border/50">
            <div className="relative mb-4 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search contacts..."
                    className="pl-9 h-10 bg-background/50"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/10 bg-secondary/10">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-[60%]" />
                                    <Skeleton className="h-3 w-[40%]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : beneficiaries.length > 0 ? (
                    beneficiaries.map((ben) => (
                        <div
                            key={ben._id}
                            onClick={() => onSelect(ben._id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 relative
                                ${selectedId === ben._id
                                    ? 'border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(0,255,255,0.05)]'
                                    : 'border-border/50 bg-background/30 hover:bg-secondary/20'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                {ben.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0 pr-6">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-sm truncate">{ben.nickname || ben.name}</h3>
                                    {ben.nickname && <span className="text-[10px] text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-secondary/50 border border-border/50">{ben.name.split(' ')[0]}</span>}
                                </div>
                                <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">{ben.accountNumber}</p>
                            </div>
                            <button
                                onClick={(e) => onToggleFavorite(e, ben)}
                                className="absolute right-3 p-1 rounded hover:bg-background/50 transition-colors"
                            >
                                <Star className={`w-4 h-4 ${ben.isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/50'}`} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="mt-4">
                        <EmptyState
                            icon={Users}
                            title="No contacts found"
                            description={searchTerm ? "Try a different search term." : "You haven't saved any beneficiaries yet."}
                        />
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
