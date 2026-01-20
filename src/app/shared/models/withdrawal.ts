export interface Withdrawal {
    id: string;
    createdDate: string;
    updatedDate: string;
    accountHolder: string;
    accountNumber: string;
    accountType: string;
    branchCode: string;
    bank: string;
    tokens: number;
    status: string;
    userId: string;
}