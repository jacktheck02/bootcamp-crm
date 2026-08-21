interface ErrorStateProps {
    message: string
    onRetry?: () => void
}

export function ErrorState({
                               message,
                               onRetry,
                           }: ErrorStateProps) {
    return (
        <div className="state-message error" role="alert">
            <strong>We couldn't complete that request.</strong>
            <p>{message}</p>

            {onRetry && (
                <button type="button" className="secondary" onClick={onRetry}>
                    Retry
                </button>
            )}
        </div>
    )
}
