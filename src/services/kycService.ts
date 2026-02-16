import api from '@/lib/api';

export const kycService = {
    submitKYC: async (data: any) => {
        const response = await api.post('/kyc', data);
        return response.data;
    },

    getKYCStatus: async () => {
        const response = await api.get('/kyc/status');
        return response.data;
    },

    getPendingKYCRequests: async () => {
        const response = await api.get('/kyc/pending');
        return response.data.data;
    },

    getAllKYCRequests: async () => {
        const response = await api.get('/kyc/all');
        return response.data.data;
    },

    updateKYCStatus: async (id: string, status: 'approved' | 'rejected', adminComment?: string) => {
        const response = await api.patch(`/kyc/${id}/status`, { status, adminComment });
        return response.data.data;
    }
};
