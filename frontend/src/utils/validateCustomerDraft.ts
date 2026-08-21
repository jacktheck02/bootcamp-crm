import type {
    CustomerStatus,
} from "../types/crm"

export interface CustomerDraft {
    fullName: string
    email: string
    phone: string
    status: CustomerStatus
}

export function validateCustomerDraft(
    draft: CustomerDraft,
): string | null {
    if (!draft.fullName.trim()) {
        return "Full name is required."
    }

    if (!draft.email.trim()) {
        return "Email is required."
    }

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
        !emailPattern.test(
            draft.email.trim(),
        )
    ) {
        return "Enter a valid email address."
    }

    if (!draft.status) {
        return "Status is required."
    }

    return null
}