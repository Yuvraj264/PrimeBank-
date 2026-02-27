import api from './api';

export const merchantService = {
    // API Banking
    getApiConfig: () => api.get('/business/api/config'),
    generateApiKey: () => api.post('/business/api/generate-key', {}),
    updateWebhook: (webhookUrl: string) => api.patch('/business/api/webhook', { webhookUrl }),

    // Vendor Management
    getVendors: (isActive?: boolean) => {
        const params = isActive !== undefined ? { isActive } : {};
        return api.get('/business/vendors', { params });
    },
    createVendor: (vendorData: any) => api.post('/business/vendors', vendorData),
    updateVendor: (id: string, vendorData: any) => api.patch(`/business/vendors/${id}`, vendorData),
    toggleVendorStatus: (id: string, isActive: boolean) => api.patch(`/business/vendors/${id}/status`, { isActive }),

    // Bulk Processing
    getProcessingJobs: () => api.get('/business/bulk/jobs'),
    uploadPayrollCSV: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/business/bulk/payroll', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // GST & Tax Reporting
    getGSTSummary: (startDate?: string, endDate?: string) => {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        return api.get('/business/gst/summary', { params });
    }
};
