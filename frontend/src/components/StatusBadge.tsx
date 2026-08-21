import type { CustomerStatus } from "../types/crm"

interface StatusBadgeProps {
    status: CustomerStatus
}

const labels: Record<CustomerStatus, string> = {
    PROSPECT: "Prospect",
    ACTIVE: "Active",
    SUSPENDED: "Suspended",
    CLOSED: "Closed",
}

export function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <span className={`status status-${status.toLowerCase()}`}>
      {labels[status]}
    </span>
    )
}
