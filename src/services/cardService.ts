import api from '@/lib/api';

export interface Card {
    id: string;
    userId: string;
    accountId: string;
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
    type: 'visa' | 'mastercard';
    status: 'active' | 'frozen' | 'blocked';
}

export const cardService = {
    getMyCards: async () => {
        const response = await api.get<{ status: string; data: Card[] }>('/cards');
        return response.data.data;
    },

    getCardDetails: async (id: string) => {
        const response = await api.get<{ status: string; data: Card }>(`/cards/${id}`);
        return response.data.data;
    },

    createCard: async () => {
        const response = await api.post<{ status: string; data: Card }>('/cards');
        return response.data.data;
    },

    toggleCardFreeze: async (id: string) => {
        const response = await api.patch<{ status: string; data: Card }>(`/cards/${id}/freeze`);
        return response.data.data;
    }
};
