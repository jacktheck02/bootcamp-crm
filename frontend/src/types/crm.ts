export type CustomerStatus =
    | "PROSPECT"
    | "ACTIVE"
    | "SUSPENDED"
    | "CLOSED"

export interface Customer {
    customerId: string
    fullName: string
    email: string
    phone?: string
    status: CustomerStatus
}

export interface CreateCustomerRequest {
    fullName: string
    email: string
    phone?: string
    status: CustomerStatus
}

export interface UpdateCustomerRequest {
    fullName: string
    email: string
    phone?: string
    status: CustomerStatus
}

export type InteractionType =
    | "CALL"
    | "EMAIL"
    | "MEETING"
    | "NOTE"

export interface Interaction {
    interactionId: string
    customerId: string
    type: InteractionType
    summary: string
    createdAt: string
}

export interface CreateInteractionRequest {
    type: InteractionType
    summary: string
}