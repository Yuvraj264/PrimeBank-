import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MoreHorizontal, CheckCircle2, XCircle, Edit, Trash, Download } from 'lucide-react';
import { merchantService } from '@/services/merchantService';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';

const VendorDirectory = () => {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<any>(null);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        accountNumber: '',
        ifsc: '',
        bankName: '',
        gstNumber: ''
    });

    const fetchVendors = async () => {
        try {
            const res = await merchantService.getVendors();
            setVendors(res.data.data);
        } catch (err) {
            toast({ title: 'Error fetching vendors', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleOpenModal = (vendor: any = null) => {
        if (vendor) {
            setEditingVendor(vendor);
            setFormData({
                name: vendor.name,
                accountNumber: vendor.accountNumber,
                ifsc: vendor.ifsc,
                bankName: vendor.bankName,
                gstNumber: vendor.gstNumber || ''
            });
        } else {
            setEditingVendor(null);
            setFormData({ name: '', accountNumber: '', ifsc: '', bankName: '', gstNumber: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVendor(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingVendor) {
                await merchantService.updateVendor(editingVendor._id, formData);
                toast({ title: 'Vendor updated successfully' });
            } else {
                await merchantService.createVendor(formData);
                toast({ title: 'Vendor added successfully' });
            }
            fetchVendors();
            handleCloseModal();
        } catch (err: any) {
            toast({
                title: 'Operation failed',
                description: err.response?.data?.message || 'Check network connection',
                variant: 'destructive'
            });
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await merchantService.toggleVendorStatus(id, !currentStatus);
            fetchVendors();
            toast({ title: `Vendor ${!currentStatus ? 'activated' : 'deactivated'}` });
        } catch (err) {
            toast({ title: 'Status update failed', variant: 'destructive' });
        }
    };

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.accountNumber.includes(searchTerm)
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Vendor Management</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manage your suppliers, track their target accounts, and toggle payment statuses.
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Vendor
                    </button>
                </div>

                {/* Global Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 glass-card rounded-xl">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search vendors by name or account..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors w-full sm:w-auto">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>

                {/* Grid Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-accent/30 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Vendor Details</th>
                                    <th className="px-6 py-4 font-medium">Bank Details</th>
                                    <th className="px-6 py-4 font-medium">GST Registry</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-4"></div>
                                                Loading vendor registry...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredVendors.length > 0 ? (
                                    filteredVendors.map((vendor) => (
                                        <tr key={vendor._id} className="hover:bg-accent/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-foreground">{vendor.name}</div>
                                                <div className="text-xs text-muted-foreground">ID: {vendor._id.slice(-6)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-foreground tracking-wide font-mono">{vendor.accountNumber}</div>
                                                <div className="text-xs text-muted-foreground">IFSC: {vendor.ifsc} | {vendor.bankName}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {vendor.gstNumber ? (
                                                    <span className="px-2.5 py-1 bg-accent/50 text-foreground text-xs rounded-md border border-border/50">{vendor.gstNumber}</span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">Unregistered</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${vendor.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {vendor.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                    {vendor.isActive ? 'Active' : 'Suspended'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleToggleStatus(vendor._id, vendor.isActive)}
                                                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                                                        title={vendor.isActive ? "Suspend Vendor" : "Activate Vendor"}
                                                    >
                                                        {vendor.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenModal(vendor)}
                                                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            No vendors found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Editor Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                            onClick={handleCloseModal}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg glass-card rounded-2xl p-6 shadow-2xl border border-border"
                        >
                            <h2 className="text-xl font-bold mb-6">
                                {editingVendor ? 'Edit Vendor Profile' : 'Add New Vendor'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Business Name <span className="text-destructive">*</span></label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Account Number <span className="text-destructive">*</span></label>
                                        <input
                                            required
                                            value={formData.accountNumber}
                                            onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">IFSC Code <span className="text-destructive">*</span></label>
                                        <input
                                            required
                                            value={formData.ifsc}
                                            onChange={e => setFormData({ ...formData, ifsc: e.target.value })}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary/50 uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Bank Name <span className="text-destructive">*</span></label>
                                        <input
                                            required
                                            value={formData.bankName}
                                            onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">GSTIN (Optional)</label>
                                        <input
                                            value={formData.gstNumber}
                                            onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary/50 uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-border/50">
                                    <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium shadow-lg transition-colors">
                                        {editingVendor ? 'Save Changes' : 'Create Vendor'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default VendorDirectory;
