import api from '@/lib/api';
import { Loan } from '@/types';

export const loanService = {
    applyLoan: async (data: Partial<Loan>) => {
        const response = await api.post<{ status: string; data: Loan }>('/loans/apply', data);
        return response.data.data;
    },

    getMyLoans: async () => {
        const response = await api.get<{ status: string; data: Loan[] }>('/loans');
        return response.data.data;
    },

    getAllLoans: async () => {
        const response = await api.get<{ status: string; data: Loan[] }>('/loans/all');
        return response.data.data;
    },

    updateLoanStatus: async (id: string, status: 'approved' | 'rejected', adminComment?: string) => {
        const response = await api.patch<{ status: string; data: Loan }>(`/loans/${id}/status`, { status, adminComment });
        return response.data.data;
    },

    prepayLoan: async (loanId: string, amount: number) => {
        const response = await api.post<{ status: string; data: Loan }>('/loans/prepay', { loanId, amount });
        return response.data.data;
    }
};
