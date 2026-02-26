import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { Beneficiary } from '@/types';
import BeneficiaryModal from '@/components/beneficiaries/BeneficiaryModal';
import { useBeneficiaries } from '@/hooks/useBeneficiaries';
import BeneficiaryList from '@/components/beneficiaries/BeneficiaryList';
import BeneficiaryDetails from '@/components/beneficiaries/BeneficiaryDetails';

export default function Beneficiaries() {
    const navigate = useNavigate();

    // Abstracted Logic
    const {
        loading,
        transactions,
        activeBeneficiary,
        filteredBeneficiaries,
        searchTerm,
        setSearchTerm,
        selectedId,
        setSelectedId,
        handleSuccess,
        handleDelete,
        handleToggleFavorite,
    } = useBeneficiaries();

    // Local UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [beneficiaryToEdit, setBeneficiaryToEdit] = useState<Beneficiary | undefined>();

    const openCreateModal = () => {
        setBeneficiaryToEdit(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = () => {
        setBeneficiaryToEdit(activeBeneficiary);
        setIsModalOpen(true);
    };

    const handleQuickTransfer = () => {
        if (activeBeneficiary) {
            navigate(`/customer/transfers?beneficiary=${activeBeneficiary.accountNumber}`);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Beneficiaries</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage saved contacts and transfer limits</p>
                    </div>
                    <Button className="gap-2" onClick={openCreateModal}>
                        <UserPlus className="w-4 h-4" /> Add Contact
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 min-h-0">
                        <BeneficiaryList
                            beneficiaries={filteredBeneficiaries}
                            loading={loading}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            onToggleFavorite={handleToggleFavorite}
                        />
                    </div>

                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0">
                        <BeneficiaryDetails
                            activeBeneficiary={activeBeneficiary}
                            transactions={transactions}
                            onEdit={openEditModal}
                            onDelete={() => activeBeneficiary && handleDelete(activeBeneficiary._id)}
                            onQuickTransfer={handleQuickTransfer}
                        />
                    </div>
                </div>
            </div>

            <BeneficiaryModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                beneficiaryToEdit={beneficiaryToEdit}
                onSuccess={handleSuccess}
            />
        </DashboardLayout>
    );
}
