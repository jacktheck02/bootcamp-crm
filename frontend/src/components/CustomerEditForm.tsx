import { useState, type FormEvent } from "react";

import type {
  Customer,
  CustomerStatus,
  UpdateCustomerRequest,
} from "../types/crm";

import { validateCustomerDraft } from "../utils/validateCustomerDraft";

interface CustomerEditFormProps {
  customer: Customer;
  saving: boolean;
  onCancel: () => void;
  onSaved: (input: UpdateCustomerRequest) => Promise<unknown>;
}

export function CustomerEditForm({
  customer,
  saving,
  onCancel,
  onSaved,
}: CustomerEditFormProps) {
  const [fullName, setFullName] = useState(customer.fullName);

  const [email, setEmail] = useState(customer.email);

  const [phone, setPhone] = useState(customer.phone ?? "");

  const [status, setStatus] = useState<CustomerStatus>(customer.status);

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateCustomerDraft({
      fullName,
      email,
      phone,
      status,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    await onSaved({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      status,
    });
  }

  function handleCancel() {
    setError(null);
    onCancel();
  }

  return (
    <form
      className="panel customer-form"
      aria-labelledby="edit-customer-heading"
      aria-describedby={error ? "edit-customer-form-error" : undefined}
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Customer management</p>

          <h2 id="edit-customer-heading">Edit customer</h2>
        </div>
      </div>

      <p className="customer-id">{customer.id}</p>

      {error && (
        <div id="edit-customer-form-error" className="form-error" role="alert">
          {error}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="edit-customer-full-name">Full name</label>

        <input
          id="edit-customer-full-name"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
          required
          disabled={saving}
        />
      </div>

      <div className="form-field">
        <label htmlFor="edit-customer-email">Email</label>

        <input
          id="edit-customer-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          disabled={saving}
        />
      </div>

      <div className="form-field">
        <label htmlFor="edit-customer-phone">Phone</label>

        <input
          id="edit-customer-phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          autoComplete="tel"
          disabled={saving}
        />
      </div>

      <div className="form-field">
        <label htmlFor="edit-customer-status">Status</label>

        <select
          id="edit-customer-status"
          value={status}
          onChange={(event) => setStatus(event.target.value as CustomerStatus)}
          disabled={saving}
        >
          <option value="PROSPECT">Prospect</option>

          <option value="ACTIVE">Active</option>

          <option value="SUSPENDED">Suspended</option>

          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="secondary"
          onClick={handleCancel}
          disabled={saving}
        >
          Cancel
        </button>

        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
