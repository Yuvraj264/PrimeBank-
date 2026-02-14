import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { mockKYCDocuments, mockUsers } from '@/data/mockData';
import { Check, X, FileText, ExternalLink, Calendar, MapPin, Briefcase, User } from 'lucide-react';
import { toast } from 'sonner';

export default function KYCVerification() {
    const [documents, setDocuments] = useState(mockKYCDocuments.filter(d => d.status === 'pending'));

    const handleAction = (id: string, action: 'verified' | 'rejected') => {
        // In a real app, API call here
        toast.success(`Document ${action} successfully`);
        setDocuments(documents.filter(d => d.id !== id));
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">KYC Verification</h1>
                    <p className="text-muted-foreground text-sm mt-1">Review and approve customer identity documents</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {documents.length > 0 ? (
                        documents.map((doc) => {
                            const user = mockUsers.find(u => u.id === doc.userId);
                            return (
                                <GlassCard key={doc.id} className="flex flex-col lg:flex-row gap-6">
                                    {/* Document Preview Section */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-primary" />
                                                    {doc.type.toUpperCase().replace('_', ' ')}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">Submitted: {new Date(doc.submittedAt).toLocaleDateString()}</p>
                                            </div>
                                            <StatusBadge status={doc.status} />
                                        </div>

                                        <div className="aspect-video bg-black/50 rounded-lg border border-border/50 flex items-center justify-center relative group overflow-hidden">
                                            <div className="absolute inset-0 bg-cover bg-center opacity-50 block" style={{ backgroundImage: 'url(https://placehold.co/600x400/1a1a1a/666666?text=Document+Preview)' }}></div>
                                            <Button variant="secondary" className="relative z-10 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ExternalLink className="w-4 h-4" /> View Full Size
                                            </Button>
                                        </div>
                                    </div>

                                    {/* User Profile Details Section */}
                                    <div className="w-full lg:w-96 space-y-4 border-t lg:border-t-0 lg:border-l border-border/30 pt-4 lg:pt-0 lg:pl-6">
                                        <h4 className="font-medium text-muted-foreground uppercase text-xs tracking-wider mb-3">Applicant Details</h4>

                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                                                {user?.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{user?.name}</p>
                                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-sm">
                                            <div className="flex gap-3">
                                                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Personal</p>
                                                    <p>{user?.personalDetails?.gender || 'N/A'}, {user?.personalDetails?.dob || 'N/A'}</p>
                                                    <p className="text-xs text-muted-foreground">{user?.personalDetails?.maritalStatus}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground shrink-0 flex items-center justify-center text-[10px] font-bold">ID</div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Identity</p>
                                                    <p className="font-mono text-xs">PAN: {user?.identityDetails?.panNumber || 'N/A'}</p>
                                                    <p className="font-mono text-xs">Aadhaar: {user?.identityDetails?.aadhaarNumber || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Address</p>
                                                    <p>{user?.address?.street || 'N/A'}</p>
                                                    <p>{user?.address?.city}, {user?.address?.state} {user?.address?.zip}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Professional</p>
                                                    <p>{user?.professionalDetails?.occupation || 'N/A'}</p>
                                                    <p className="text-xs text-muted-foreground">Income: {user?.professionalDetails?.annualIncome ? `$${user?.professionalDetails.annualIncome.toLocaleString()}` : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-4">
                                            <Button
                                                variant="destructive"
                                                className="gap-2 w-full"
                                                onClick={() => handleAction(doc.id, 'rejected')}
                                            >
                                                <X className="w-4 h-4" /> Reject
                                            </Button>
                                            <Button
                                                className="gap-2 w-full bg-success hover:bg-success/90 text-white"
                                                onClick={() => handleAction(doc.id, 'verified')}
                                            >
                                                <Check className="w-4 h-4" /> Approve
                                            </Button>
                                        </div>
                                    </div>
                                </GlassCard>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Check className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No pending KYC documents</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
