/** Standard API response envelope */
export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    meta?: ApiMeta;
}
export interface ApiMeta {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: unknown;
}
//# sourceMappingURL=api-response.d.ts.map