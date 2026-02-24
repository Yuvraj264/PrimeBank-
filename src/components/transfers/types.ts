export type TransferType = 'internal' | 'bank' | 'upi' | 'international' | 'scheduled' | null;

export interface Beneficiary {
  id: string;
  name: string;
  accountNumber?: string;
  upiId?: string;
  bankInfo?: string;
  isFavorite?: boolean;
}

export interface TransferState {
  type: TransferType;
  beneficiary: Beneficiary | null;
  fromAccountId: string;
  amount: string;
  description: string;
  saveTemplate: boolean;
  pin?: string;
  otp?: string;
}

export const initialTransferState: TransferState = {
  type: null,
  beneficiary: null,
  fromAccountId: '',
  amount: '',
  description: '',
  saveTemplate: false,
};
