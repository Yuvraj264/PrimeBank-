import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockUsers } from '@/data/mockData';
import { Search, Mail, Phone, MoreHorizontal, User, Shield, CreditCard } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Customers() {
    const [searchTerm, setSearchTerm] = useState('');
    const customers = mockUsers.filter(u => u.role === 'customer');

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
                    <Button>Add Customer</Button>
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
                        {filteredCustomers.map((customer) => (
                            <div key={customer.id} className="p-4 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                            <DropdownMenuItem className="gap-2">
                                                <User className="w-4 h-4" /> View Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2">
                                                <CreditCard className="w-4 h-4" /> View Accounts
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2">
                                                <Shield className="w-4 h-4" /> Security Settings
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="gap-2 text-destructive">
                                                Freeze Account
                                            </DropdownMenuItem>
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
