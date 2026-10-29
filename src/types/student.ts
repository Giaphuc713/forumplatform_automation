export interface Student {
    id: number;
    studentCode: string;
    fullName: string;
    dob?: string;
    placeOfBirth?: string;
    phone?: string;
    email: string;
    industry?: string;
    trainingLevel?: string;
    typeOfTraining?: string;
    currentPosition?: string;
    startDate?: string;
    avatarUrl?: string;
    updatedAt?: string;
}

export interface StudentUpdateRequest {
    fullName: string;
    dob?: string;
    placeOfBirth?: string;
    phone?: string;
    email: string;
    industry?: string;
    trainingLevel?: string;
    typeOfTraining?: string;
    currentPosition?: string;
    startDate?: string;
    avatarUrl?: string;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}
