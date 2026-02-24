import { useState } from 'react';
import { Search, Plus, Star, Building2, User } from 'lucide-react';
import { TransferState, Beneficiary } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Props {
    data: TransferState;
    updateData: (data: Partial<TransferState>) => void;
    onNext: () => void;
    onPrev: () => void;
}

const mockFavorites: Beneficiary[] = [
    { id: '1', name: 'Alice Smith', accountNumber: '****5678', bankInfo: 'JPMorgan Chase', isFavorite: true },
    { id: '2', name: 'Bob Jones', accountNumber: '****1234', bankInfo: 'Bank of America', isFavorite: true },
    { id: '3', name: 'John Doe', upiId: 'john@ybl', isFavorite: true },
];

export default function Step2Beneficiary({ data, updateData, onNext, onPrev }: Props) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelect = (beneficiary: Beneficiary) => {
        updateData({ beneficiary });
        onNext();
    };

    const filteredFavs = mockFavorites.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Select Beneficiary</h2>
                    <p className="text-muted-foreground text-sm">Who are you sending money to?</p>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Plus className="w-4 h-4" /> Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Beneficiary</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input placeholder="e.g. Jane Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label>Account Number / UPI ID</Label>
                                <Input placeholder="Enter details" />
                            </div>
                            {data.type === 'bank' && (
                                <div className="space-y-2">
                                    <Label>Bank Routing Number / IFSC</Label>
                                    <Input placeholder="Enter routing code" />
                                </div>
                            )}
                            <Button className="w-full mt-4" onClick={() => {
                                setIsModalOpen(false);
                                handleSelect({ id: 'new', name: 'New Beneficiary', accountNumber: '****0000', bankInfo: 'New Bank' });
                            }}>
                                Save and Select
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search name, account, or UPI..."
                    className="pl-9 bg-secondary/30"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Favorites
                </h3>
                {filteredFavs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredFavs.map(fav => (
                            <div
                                key={fav.id}
                                onClick={() => handleSelect(fav)}
                                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-primary/5 hover:border-primary/50 cursor-pointer transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    {fav.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">{fav.name}</h4>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                                        {fav.bankInfo ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                        <span>{fav.accountNumber || fav.upiId}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">No favorites found.</p>
                )}
            </div>

            <div className="pt-6 mt-6 border-t border-border flex justify-between items-center">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Remaining Daily Limit</p>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm">$8,500.00</span>
                        <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[35%] rounded-full" />
                        </div>
                    </div>
                </div>
                <Button variant="ghost" onClick={onPrev}>Back</Button>
            </div>
        </div>
    );
}
