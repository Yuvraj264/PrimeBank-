import api from '@/lib/api';
import { Account } from '@/types';

export const accountService = {
    getMyAccounts: async () => {
        const response = await api.get<{ status: string; data: Account[] }>('/accounts');
        return response.data.data;
    },

    createAccount: async (type: 'savings' | 'current', currency: string = 'USD') => {
        const response = await api.post<{ status: string; data: Account }>('/accounts', { type, currency });
        return response.data.data;
    },

    getAccountById: async (id: string) => {
        const response = await api.get<{ status: string; data: Account }>(`/accounts/${id}`);
        return response.data.data;
    },

    getStatements: async () => {
        const response = await api.get<{ status: string; data: any[] }>('/accounts/statements');
        return response.data.data;
    }
};
