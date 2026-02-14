import api from '@/lib/api';

export const kycService = {
    submitKYC: async (data: any) => {
        const response = await api.post('/kyc', data);
        return response.data;
    },

    getKYCStatus: async () => {
        const response = await api.get('/kyc/status');
        return response.data.data;
    }
};
