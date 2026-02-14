import api from '@/lib/api';
import { Beneficiary } from '@/types';

export const beneficiaryService = {
    getBeneficiaries: async () => {
        const response = await api.get<{ status: string; data: Beneficiary[] }>('/beneficiaries');
        return response.data.data;
    },

    addBeneficiary: async (data: { name: string; accountNumber: string; bankName: string; ifscCode: string }) => {
        const response = await api.post<{ status: string; data: Beneficiary }>('/beneficiaries', data);
        return response.data.data;
    },

    deleteBeneficiary: async (id: string) => {
        await api.delete(`/beneficiaries/${id}`);
    }
};
