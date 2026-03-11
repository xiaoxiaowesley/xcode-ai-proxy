export declare function withRetry<T>(operation: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
export declare function getCurrentTimestamp(): string;
export declare function logRequest(method: string, path: string): void;
//# sourceMappingURL=retry.d.ts.map