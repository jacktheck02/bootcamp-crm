import type { Customer } from "../types/crm";
import { StatusBadge } from "./StatusBadge";

interface CustomerListProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelect: (customerId: string) => void;
}

export function CustomerList({
  customers,
  selectedCustomerId,
  onSelect,
}: CustomerListProps) {
  return (
    <ul className="customer-list" aria-label="Customers">
      {customers.map((customer) => {
        const selected = customer.customerId === selectedCustomerId;

        return (
          <li key={customer.customerId}>
            <button
              type="button"
              className={`customer-row${selected ? " selected" : ""}`}
              onClick={() => onSelect(customer.customerId)}
              aria-current={selected ? "true" : undefined}
            >
              <span className="customer-row-main">
                <strong>{customer.fullName}</strong>
                <span className="muted">{customer.customerId}</span>
              </span>
              <StatusBadge status={customer.status} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
