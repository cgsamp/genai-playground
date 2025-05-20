export type ID = number;

export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

export type ApiError = {
    status: number;
    message: string;
    details?: Record<string, string[]>;
};
