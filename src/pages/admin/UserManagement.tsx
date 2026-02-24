import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { adminService } from '@/services/adminService';
import { Search, Mail, Phone, MoreHorizontal, User, Trash2, Ban, Unlock, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const fetchUsers = async () => {
        try {
            const data = await adminService.getUsers('customer');
            setUsers(data.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAction = async (userId: string, action: 'active' | 'blocked' | 'delete') => {
        try {
            if (action === 'delete') {
                await adminService.deleteUser(userId);
                toast.success('User deleted successfully');
                setUsers(users.filter(u => u.id !== userId && u._id !== userId));
            } else {
                await adminService.updateUserStatus(userId, action);
                toast.success(`User status updated to ${action}`);
                setUsers(users.map(u => u.id === userId || u._id === userId ? { ...u, status: action } : u));
            }
        } catch (error) {
            console.error('Action failed:', error);
            toast.error('Failed to update user');
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
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <div key={user.id || user._id} className="p-4 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                                            {user.name?.split(' ').map((n: string) => n[0]).join('')}
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
                                                <DropdownMenuItem
                                                    className="gap-2"
                                                    onClick={() => setSelectedUser(user)}
                                                >
                                                    <User className="w-4 h-4" /> View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {user.status === 'blocked' ? (
                                                    <DropdownMenuItem
                                                        className="gap-2 text-success"
                                                        onClick={() => handleAction(user.id || user._id, 'active')}
                                                    >
                                                        <Unlock className="w-4 h-4" /> Unfreeze Account
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        className="gap-2 text-destructive"
                                                        onClick={() => handleAction(user.id || user._id, 'blocked')}
                                                    >
                                                        <Ban className="w-4 h-4" /> Freeze Account
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    className="gap-2 text-destructive"
                                                    onClick={() => handleAction(user.id || user._id, 'delete')}
                                                >
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

                <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>User Profile</DialogTitle>
                        </DialogHeader>
                        {selectedUser && (
                            <div className="space-y-6 py-4">
                                <div className="flex items-center gap-6 pb-6 border-b border-border/50">
                                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-3xl">
                                        {selectedUser.name?.split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                                        <p className="text-muted-foreground">{selectedUser.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            <StatusBadge status={selectedUser.status} />
                                            <span className="text-xs bg-secondary/50 px-2 py-1 rounded inline-block">Member since {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 text-sm">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-muted-foreground">Phone</p>
                                            <p className="font-medium">{selectedUser.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Address</p>
                                            <p className="font-medium">{selectedUser.address || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-muted-foreground">Occupation</p>
                                            <p className="font-medium">{selectedUser.occupation || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Account Status</p>
                                            <p className="font-medium capitalize">{selectedUser.status}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-secondary/10 border border-border/50">
                                    <h4 className="font-semibold mb-2">Internal Notes</h4>
                                    <p className="text-sm text-muted-foreground italic">No internal notes for this user.</p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
