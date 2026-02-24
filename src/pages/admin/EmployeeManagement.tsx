import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { adminService } from '@/services/adminService';
import { Search, Mail, MoreHorizontal, Briefcase, UserX, Loader2, Unlock } from 'lucide-react';
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
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

export default function EmployeeManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    const [newRole, setNewRole] = useState('');

    const fetchEmployees = async () => {
        try {
            const data = await adminService.getUsers('employee');
            setEmployees(data.data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            toast.error('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter(e =>
        e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRoleUpdate = async () => {
        if (!editingEmployee) return;
        try {
            await adminService.updateEmployeeRole(editingEmployee.id || editingEmployee._id, newRole);
            setEmployees(employees.map(e => (e.id === editingEmployee.id || e._id === editingEmployee._id) ? { ...e, role: newRole } : e));
            toast.success('Employee role updated successfully');
            setEditingEmployee(null);
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const handleAction = async (id: string, action: 'active' | 'blocked') => {
        try {
            await adminService.updateUserStatus(id, action);
            toast.success(`Employee ${action === 'blocked' ? 'deactivated' : 'activated'} successfully`);
            setEmployees(employees.map(e => e.id === id || e._id === id ? { ...e, status: action } : e));
        } catch (error) {
            console.error('Action failed:', error);
            toast.error('Failed to update employee status');
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
                        {loading ? (
                            <div className="col-span-full flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                {filteredEmployees.map((employee) => (
                                    <div key={employee.id || employee._id} className="p-5 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-all flex flex-col items-center text-center relative group">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                                        onClick={() => {
                                                            setEditingEmployee(employee);
                                                            setNewRole(employee.role || 'employee');
                                                        }}
                                                    >
                                                        <Briefcase className="w-4 h-4" /> Edit Role
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {employee.status === 'blocked' ? (
                                                        <DropdownMenuItem
                                                            className="gap-2 text-success"
                                                            onClick={() => handleAction(employee.id || employee._id, 'active')}
                                                        >
                                                            <Unlock className="w-4 h-4" /> Activate
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            className="gap-2 text-destructive"
                                                            onClick={() => handleAction(employee.id || employee._id, 'blocked')}
                                                        >
                                                            <UserX className="w-4 h-4" /> Deactivate
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-2xl mb-4 shadow-inner">
                                            {employee.name?.split(' ').map((n: string) => n[0]).join('')}
                                        </div>

                                        <h3 className="font-semibold text-lg">{employee.name}</h3>
                                        <p className="text-sm text-primary mb-1 flex items-center gap-1">
                                            <Briefcase className="w-3 h-3" /> {employee.role || 'Employee'}
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
                            </>
                        )}
                    </div>
                </GlassCard>

                <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Employee Role</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Select New Role</label>
                                <Select value={newRole} onValueChange={setNewRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="employee">Employee</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="support">Support</SelectItem>
                                        <SelectItem value="compliance">Compliance Officer</SelectItem>
                                        <SelectItem value="admin">Administrator</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingEmployee(null)}>Cancel</Button>
                            <Button onClick={handleRoleUpdate}>Update Role</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
