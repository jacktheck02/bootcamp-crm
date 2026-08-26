import { useState, type FormEvent } from "react";

import type { CreateCustomerRequest, CustomerStatus } from "../types/crm";

import { validateCustomerDraft } from "../utils/validateCustomerDraft";

interface CustomerFormProps {
  saving: boolean;
  onCancel: () => void;
  onSaved: (input: CreateCustomerRequest) => Promise<unknown>;
}

export function CustomerForm({ saving, onCancel, onSaved }: CustomerFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<CustomerStatus>("PROSPECT");

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
      aria-labelledby="create-customer-heading"
      aria-describedby={error ? "customer-form-error" : undefined}
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Customer management</p>

          <h2 id="create-customer-heading">Add customer</h2>
        </div>
      </div>

      {error && (
        <div id="customer-form-error" className="form-error" role="alert">
          {error}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="customer-full-name">Full name</label>

        <input
          id="customer-full-name"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
          required
          disabled={saving}
        />
      </div>

      <div className="form-field">
        <label htmlFor="customer-email">Email</label>

        <input
          id="customer-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          disabled={saving}
        />
      </div>

      <div className="form-field">
        <label htmlFor="customer-phone">Phone</label>

        <input
          id="customer-phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          autoComplete="tel"
          disabled={saving}
        />
      </div>

      <div className="form-field">
        <label htmlFor="customer-status">Status</label>

        <select
          id="customer-status"
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
          {saving ? "Saving…" : "Create customer"}
        </button>
      </div>
    </form>
  );
}
