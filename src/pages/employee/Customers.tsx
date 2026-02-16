import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { customerService } from '@/services/customerService';
import { User } from '@/types';
import { Search, Mail, Phone, MoreHorizontal, User as UserIcon, Shield, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddCustomerDialog from './AddCustomerDialog';

export default function Customers() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCustomers();
        const interval = setInterval(loadCustomers, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadCustomers = async () => {
        try {
            const data = await customerService.getAllCustomers();
            setCustomers(data);
        } catch (error) {
            console.error('Failed to load customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (userId: string, newStatus: 'active' | 'blocked') => {
        try {
            await customerService.updateCustomerStatus(userId, newStatus);
            toast.success(`Customer ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`);
            loadCustomers(); // Reload list
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Customers</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage and view customer profiles</p>
                    </div>
                    <AddCustomerDialog onSuccess={loadCustomers} />
                </div>

                <GlassCard>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search query..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : filteredCustomers.map((customer) => (
                            <div key={customer.id || Math.random()} className="p-4 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                                        {customer.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{customer.name}</h3>
                                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {customer.email}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {customer.phone}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 justify-between md:justify-end">
                                    <StatusBadge status={customer.status} />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem className="gap-2" onClick={() => navigate(`/employee/customers/${customer.id || (customer as any)._id}`)}>
                                                <UserIcon className="w-4 h-4" /> View Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2" onClick={() => navigate(`/employee/customers/${customer.id || (customer as any)._id}`)}>
                                                <CreditCard className="w-4 h-4" /> View Accounts
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2">
                                                <Shield className="w-4 h-4" /> Security Settings
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {customer.status === 'blocked' ? (
                                                <DropdownMenuItem
                                                    className="gap-2 text-green-500"
                                                    onClick={() => handleStatusChange(customer.id || (customer as any)._id, 'active')}
                                                >
                                                    Unblock Account
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    className="gap-2 text-destructive"
                                                    onClick={() => handleStatusChange(customer.id || (customer as any)._id, 'blocked')}
                                                >
                                                    Freeze Account
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
