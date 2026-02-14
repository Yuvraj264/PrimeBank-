import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Calendar } from 'lucide-react';
import { accountService } from '@/services/accountService';
import { toast } from 'sonner';

export default function Statements() {
    const [statements, setStatements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatements = async () => {
            try {
                const data = await accountService.getStatements();
                setStatements(data);
            } catch (error) {
                toast.error('Failed to load statements');
            } finally {
                setLoading(false);
            }
        };
        fetchStatements();
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Statements</h1>
                    <p className="text-muted-foreground text-sm mt-1">Download and view your monthly statements</p>
                </div>

                <GlassCard>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-lg">Available Statements</h3>
                        <div className="w-[180px]">
                            <Select defaultValue="2024">
                                <SelectTrigger>
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2023">2023</SelectItem>
                                    <SelectItem value="2022">2022</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-center text-muted-foreground py-8">Loading statements...</p>
                        ) : statements.length > 0 ? (
                            statements.map((stmt) => (
                                <div key={stmt.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/5 hover:bg-secondary/15 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{stmt.month} {stmt.year}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                <span>Generated on 1st {stmt.month}</span>
                                                <span>•</span>
                                                <span>PDF</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Download className="w-4 h-4" /> Download
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No statements found.</p>
                        )}
                    </div>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
