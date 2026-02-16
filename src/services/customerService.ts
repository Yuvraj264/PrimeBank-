import api from '@/lib/api';
import { User, Account, Transaction } from '@/types';

export const customerService = {
    getAllCustomers: async () => {
        const response = await api.get<{ status: string; data: User[] }>('/customers');
        return response.data.data;
    },

    getCustomerById: async (id: string) => {
        const response = await api.get<{ status: string; data: { customer: User; account: Account; recentTransactions: Transaction[] } }>(`/customers/${id}`);
        return response.data.data;
    },

    updateCustomerStatus: async (id: string, status: 'active' | 'blocked') => {
        const response = await api.patch<{ status: string; data: User }>(`/customers/${id}/status`, { status });
        return response.data.data;
    }
};
