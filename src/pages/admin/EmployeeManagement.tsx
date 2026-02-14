import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockUsers } from '@/data/mockData';
import { Search, Mail, MoreHorizontal, UserCheck, Briefcase, Plus, UserX, Shield } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export default function EmployeeManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState(mockUsers.filter(u => u.role === 'employee'));

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAction = (id: string, action: string) => {
        toast.success(`Employee ${action} successfully`);
        if (action === 'deactivated') {
            setEmployees(employees.map(e => e.id === id ? { ...e, status: 'blocked' } : e));
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Employee Management</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage staff access and roles</p>
                    </div>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Plus className="w-4 h-4" /> Add Employee
                    </Button>
                </div>

                <GlassCard>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search employees..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEmployees.map((employee) => (
                            <div key={employee.id} className="p-5 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-all flex flex-col items-center text-center relative group">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem className="gap-2">
                                                <Briefcase className="w-4 h-4" /> Edit Role
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2">
                                                <Shield className="w-4 h-4" /> Permissions
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="gap-2 text-destructive"
                                                onClick={() => handleAction(employee.id, 'deactivated')}
                                            >
                                                <UserX className="w-4 h-4" /> Deactivate
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-2xl mb-4 shadow-inner">
                                    {employee.name.split(' ').map(n => n[0]).join('')}
                                </div>

                                <h3 className="font-semibold text-lg">{employee.name}</h3>
                                <p className="text-sm text-primary mb-1 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" /> Operations Manager
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                                    <Mail className="w-3 h-3" /> {employee.email}
                                </p>

                                <div className="w-full pt-4 border-t border-border/20 flex items-center justify-between">
                                    <div className="text-left">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
                                        <StatusBadge status={employee.status} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Joined</p>
                                        <p className="text-xs font-medium">{new Date(employee.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add New Card */}
                        <button className="p-5 rounded-xl border-2 border-dashed border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center text-center gap-3 min-h-[280px]">
                            <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center">
                                <Plus className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Add New Employee</h3>
                                <p className="text-sm text-muted-foreground mt-1">Onboard new staff member</p>
                            </div>
                        </button>
                    </div>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
