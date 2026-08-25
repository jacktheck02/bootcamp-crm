import type { Customer, Interaction } from "../types/crm"
import { StatusBadge } from "./StatusBadge"

interface CustomerProfileProps {
    customer: Customer
    interactions: Interaction[]
    onEditCustomer: () => void
    onAddInteraction: () => void
}

export function CustomerProfile({
                                    customer, interactions, onEditCustomer, onAddInteraction,
                                }: CustomerProfileProps) {
    return (
        <article className="panel profile" aria-labelledby="profile-heading">
            <div className="profile-header">
                <div>
                    <p className="eyebrow">Customer profile</p>
                    <h2 id="profile-heading">{customer.fullName}</h2>
                    <p className="muted">{customer.id}</p>
                </div>

                <div className="profile-actions">
                    <StatusBadge status={customer.status}/>

                    <button type="button"
                            className="secondary"
                            onClick={onEditCustomer}
                    >
                        Edit customer
                    </button>
                </div>
            </div>

            <dl className="details">
                <div>
                    <dt>Email</dt>
                    <dd>
                        <a href={`mailto:${customer.email}`}>{customer.email}</a>
                    </dd>
                </div>

                {customer.phone && (
                    <div>
                        <dt>Phone</dt>
                        <dd>
                            <a href={`tel:${customer.phone}`}>{customer.phone}</a>
                        </dd>
                    </div>
                )}
            </dl>

            <section aria-labelledby="interactions-heading">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">Activity</p>
                        <h3 id="interactions-heading">Interactions</h3>
                    </div>

                    <button type="button" onClick={onAddInteraction}>
                        Add interaction
                    </button>
                </div>

                {interactions.length === 0 ? (
                    <div className="empty">
                        <strong>No interactions yet</strong>
                        <p>Record the first customer interaction.</p>
                    </div>
                ) : (
                    <ol className="interaction-list">
                        {interactions.map((interaction) => (
                            <li key={interaction.interactionId}>
                                <div className="interaction-meta">
                                    <strong>{interaction.type}</strong>
                                    <time dateTime={interaction.createdAt}>
                                        {new Date(interaction.createdAt).toLocaleString()}
                                    </time>
                                </div>
                                <p>{interaction.summary}</p>
                            </li>
                        ))}
                    </ol>
                )}
            </section>
        </article>
    )
}