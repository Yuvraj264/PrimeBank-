import api from '@/lib/api';
import { Beneficiary } from '@/types';

export const beneficiaryService = {
    getBeneficiaries: async () => {
        const response = await api.get<{ status: string; data: Beneficiary[] }>('/beneficiaries');
        return response.data.data;
    },

    addBeneficiary: async (data: { name: string; accountNumber: string; bankName: string; ifscCode: string; nickname?: string; isFavorite?: boolean; dailyLimit?: number }) => {
        const response = await api.post<{ status: string; data: Beneficiary }>('/beneficiaries', data);
        return response.data.data;
    },

    updateBeneficiary: async (id: string, data: Partial<Beneficiary>) => {
        const response = await api.patch<{ status: string; data: Beneficiary }>(`/beneficiaries/${id}`, data);
        return response.data.data;
    },

    deleteBeneficiary: async (id: string) => {
        await api.delete(`/beneficiaries/${id}`);
    }
};
