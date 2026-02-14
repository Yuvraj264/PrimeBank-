import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Trash2, Edit2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { beneficiaryService } from '@/services/beneficiaryService';
import { useAppSelector } from '@/store';

export default function Beneficiaries() {
    const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newBen, setNewBen] = useState({ name: '', accountNumber: '', bankName: '', ifscCode: '' });
    const { user } = useAppSelector((s) => s.auth);

    useEffect(() => {
        const fetchBeneficiaries = async () => {
            try {
                const data = await beneficiaryService.getBeneficiaries();
                setBeneficiaries(data);
            } catch (error) {
                toast.error('Failed to load beneficiaries');
            }
        };
        if (user) fetchBeneficiaries();
    }, [user]);

    const filteredBeneficiaries = beneficiaries.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.bankName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddBeneficiary = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const addedBen = await beneficiaryService.addBeneficiary(newBen as any);
            setBeneficiaries([...beneficiaries, addedBen]);
            toast.success('Beneficiary added successfully');
            setIsDialogOpen(false);
            setNewBen({ name: '', accountNumber: '', bankName: '', ifscCode: '' });
        } catch (error) {
            toast.error('Failed to add beneficiary');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await beneficiaryService.deleteBeneficiary(id);
            setBeneficiaries(beneficiaries.filter(b => b._id !== id));
            toast.success('Beneficiary removed');
        } catch (error) {
            toast.error('Failed to remove beneficiary');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Beneficiaries</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage your saved contacts</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <UserPlus className="w-4 h-4" /> Add New
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Beneficiary</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddBeneficiary} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        placeholder="John Doe"
                                        value={newBen.name}
                                        onChange={e => setNewBen({ ...newBen, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bank Name</Label>
                                    <Input
                                        placeholder="Bank of America"
                                        value={newBen.bankName}
                                        onChange={e => setNewBen({ ...newBen, bankName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>IFSC Code</Label>
                                    <Input
                                        placeholder="BANK0001234"
                                        value={newBen.ifscCode}
                                        onChange={e => setNewBen({ ...newBen, ifscCode: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Account Number</Label>
                                    <Input
                                        placeholder="1234567890"
                                        value={newBen.accountNumber}
                                        onChange={e => setNewBen({ ...newBen, accountNumber: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full">Save Beneficiary</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <GlassCard>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search beneficiaries..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredBeneficiaries.map((ben) => (
                            <div key={ben._id} className="p-4 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-all group relative">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                                        {ben.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{ben.name}</h3>
                                        <p className="text-xs text-muted-foreground">{ben.bankName}</p>
                                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{ben.accountNumber}</p>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 rounded-md hover:bg-background/50 text-muted-foreground hover:text-foreground">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ben._id)}
                                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
