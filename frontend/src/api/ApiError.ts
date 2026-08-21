export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly correlationId?: string,
    ) {
        super(message)
        this.name = "ApiError"
    }
}