import api from '@/lib/api';
import { Transaction } from '@/types';
export type { Transaction };

export const transactionService = {
    getMyTransactions: async () => {
        const response = await api.get<{ status: string; data: Transaction[] }>('/transactions/me');
        return response.data.data;
    },

    getAllTransactions: async () => {
        const response = await api.get<{ status: string; data: Transaction[] }>('/transactions');
        return response.data.data;
    },

    transfer: async (data: { receiverAccountNumber: string; amount: number; description?: string; fromAccountId?: string }) => {
        const response = await api.post('/transactions/transfer', data);
        return response.data;
    },

    deposit: async (data: { amount: number }) => {
        const response = await api.post<{ status: string; data: Transaction }>('/transactions/deposit', data);
        return response.data.data;
    },

    withdraw: async (data: { amount: number }) => {
        const response = await api.post<{ status: string; data: Transaction }>('/transactions/withdraw', data);
        return response.data.data;
    },

    payBill: async (data: { billerName: string; amount: number; billType: string; fromAccountId?: string }) => {
        const response = await api.post<{ status: string; data: Transaction }>('/transactions/bill-pay', data);
        return response.data.data;
    }
};
