interface LoadingStateProps {
    message: string
}

export function LoadingState({ message }: LoadingStateProps) {
    return (
        <p className="state-message" role="status" aria-live="polite">
            {message}
        </p>
    )
}