import { useState } from "react";
import type { FormEvent } from "react";
import type { CreateInteractionRequest, Interaction } from "../types/crm";

interface InteractionFormProps {
  saving: boolean;
  onCancel: () => void;
  onSaved: (input: CreateInteractionRequest) => Promise<Interaction>;
}

export function InteractionForm({
  saving,
  onCancel,
  onSaved,
}: InteractionFormProps) {
  const [type, setType] = useState<CreateInteractionRequest["type"]>("CALL");
  const [summary, setSummary] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanSummary = summary.trim();

    if (!cleanSummary) {
      setValidationError("Summary is required.");
      return;
    }

    if (cleanSummary.length < 2) {
      setValidationError("Summary must contain at least 2 characters.");
      return;
    }

    setValidationError(null);

    try {
      await onSaved({
        type,
        summary: cleanSummary,
      });

      setSummary("");
      setType("CALL");
    } catch {
      // Parent owns server-error presentation.
    }
  }

  return (
    <form className="interaction-form" onSubmit={submit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">New activity</p>
          <h3>Add interaction</h3>
        </div>
      </div>

      {validationError && (
        <p className="form-error" role="alert">
          {validationError}
        </p>
      )}

      <div className="form-field">
        <label htmlFor="interaction-type">Type</label>
        <select
          id="interaction-type"
          value={type}
          onChange={(event) =>
            setType(event.target.value as CreateInteractionRequest["type"])
          }
          disabled={saving}
        >
          <option value="CALL">Call</option>
          <option value="EMAIL">Email</option>
          <option value="MEETING">Meeting</option>
          <option value="NOTE">Note</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="interaction-summary">Summary</label>
        <textarea
          id="interaction-summary"
          rows={4}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          disabled={saving}
          aria-describedby="summary-help"
        />
        <small id="summary-help">Keep the summary concise and factual.</small>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="secondary"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>

        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save interaction"}
        </button>
      </div>
    </form>
  );
}
