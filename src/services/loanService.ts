import api from '@/lib/api';
import { Loan } from '@/types';

export const loanService = {
    applyLoan: async (data: Partial<Loan>) => {
        const response = await api.post<{ status: string; data: Loan }>('/loans', data);
        return response.data.data;
    },

    getMyLoans: async () => {
        const response = await api.get<{ status: string; data: Loan[] }>('/loans/me');
        return response.data.data;
    },

    getAllLoans: async () => {
        const response = await api.get<{ status: string; data: Loan[] }>('/loans');
        return response.data.data;
    },

    updateLoanStatus: async (id: string, status: 'approved' | 'rejected', adminComment?: string) => {
        const response = await api.patch<{ status: string; data: Loan }>(`/loans/${id}`, { status, adminComment });
        return response.data.data;
    }
};
