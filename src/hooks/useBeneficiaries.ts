import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { beneficiaryService } from '@/services/beneficiaryService';
import { transactionService } from '@/services/transactionService';
import { useAppSelector } from '@/store';
import { Beneficiary, Transaction } from '@/types';

export function useBeneficiaries() {
    const { user } = useAppSelector((s) => s.auth);

    // Data State
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [bens, txns] = await Promise.all([
                beneficiaryService.getBeneficiaries(),
                transactionService.getMyTransactions()
            ]);
            setBeneficiaries(bens);
            setTransactions(txns);
            if (bens.length > 0 && !selectedId) setSelectedId(bens[0]._id);
        } catch (error) {
            toast.error('Failed to load beneficiary data');
        } finally {
            setLoading(false);
        }
    }, [selectedId]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, fetchData]);

    const activeBeneficiary = useMemo(() =>
        beneficiaries.find(b => b._id === selectedId),
        [beneficiaries, selectedId]);

    const filteredBeneficiaries = useMemo(() => {
        return beneficiaries
            .filter(b =>
                b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (b.nickname && b.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                b.bankName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                // Favorites first, then alphabetical
                if (a.isFavorite && !b.isFavorite) return -1;
                if (!a.isFavorite && b.isFavorite) return 1;
                return a.name.localeCompare(b.name);
            });
    }, [beneficiaries, searchTerm]);

    const handleSuccess = useCallback((ben: Beneficiary, isEdit: boolean) => {
        if (isEdit) {
            setBeneficiaries(prev => prev.map(b => b._id === ben._id ? ben : b));
        } else {
            setBeneficiaries(prev => [ben, ...prev]);
        }
        setSelectedId(ben._id);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        try {
            await beneficiaryService.deleteBeneficiary(id);
            setBeneficiaries(prev => {
                const updated = prev.filter(b => b._id !== id);
                if (selectedId === id) {
                    setSelectedId(updated.length > 0 ? updated[0]._id : null);
                }
                return updated;
            });
            toast.success('Beneficiary removed securely');
        } catch (error) {
            toast.error('Failed to remove beneficiary');
        }
    }, [selectedId]);

    const handleToggleFavorite = useCallback(async (e: React.MouseEvent, ben: Beneficiary) => {
        e.stopPropagation();
        try {
            const updated = await beneficiaryService.updateBeneficiary(ben._id, { isFavorite: !ben.isFavorite });
            setBeneficiaries(prev => prev.map(b => b._id === ben._id ? updated : b));
            toast.success(updated.isFavorite ? 'Added to favorites' : 'Removed from favorites');
        } catch (error) {
            toast.error('Failed to update favorite status');
        }
    }, []);

    return {
        // Data
        loading,
        transactions,
        activeBeneficiary,
        filteredBeneficiaries,

        // State
        searchTerm,
        setSearchTerm,
        selectedId,
        setSelectedId,

        // Actions
        handleSuccess,
        handleDelete,
        handleToggleFavorite,
        refreshData: fetchData
    };
}
