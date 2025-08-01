// frontend/app/types/error.ts

export interface ApiError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
    errorCode?: string;
}

export interface ErrorState {
    message: string;
    code?: string;
    status?: number;
}