export interface Course {
    id: string;
    branchId: string;
    name: string;
    description: string;
    courseDuration: string;
    createdOn: string;
    price?: number;
}