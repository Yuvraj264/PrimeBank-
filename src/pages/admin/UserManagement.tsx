import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockUsers } from '@/data/mockData';
import { Search, Mail, Phone, MoreHorizontal, User, Shield, Lock, Trash2, Ban } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    // In a real app, this would be state initialized from API
    const [users, setUsers] = useState(mockUsers.filter(u => u.role === 'customer'));

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAction = (userId: string, action: string) => {
        toast.success(`User ${action} successfully`);
        // Mock state update
        if (action === 'frozen') {
            setUsers(users.map(u => u.id === userId ? { ...u, status: 'blocked' } : u));
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">User Management</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage customer accounts and access</p>
                    </div>
                    <Button className="gap-2">
                        <User className="w-4 h-4" /> Add User
                    </Button>
                </div>

                <GlassCard>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search customers by name or email..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <div key={user.id} className="p-4 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                                            {user.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{user.name}</h3>
                                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {user.email}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {user.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 justify-between md:justify-end">
                                        <div className="text-right hidden md:block">
                                            <p className="text-xs text-muted-foreground">Joined</p>
                                            <p className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <StatusBadge status={user.status} />
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
                                                    <Shield className="w-4 h-4" /> Reset 2FA
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2">
                                                    <Lock className="w-4 h-4" /> Reset Password
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="gap-2 text-destructive"
                                                    onClick={() => handleAction(user.id, 'frozen')}
                                                >
                                                    <Ban className="w-4 h-4" /> Freeze Account
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 text-destructive">
                                                    <Trash2 className="w-4 h-4" /> Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No users found matching your search.
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
