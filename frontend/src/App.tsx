import { useCallback, useEffect, useState } from "react";

import {
  createCustomer,
  createInteraction,
  getCustomer,
  getInteractions,
  searchCustomers,
  updateCustomer,
} from "./api/crmApi";

import { ApiError } from "./api/ApiError";

import { CustomerForm } from "./components/CustomerForm";
import { CustomerEditForm } from "./components/CustomerEditForm";
import { CustomerList } from "./components/CustomerList";
import { CustomerProfile } from "./components/CustomerProfile";
import { EmptyState } from "./components/EmptyState";
import { ErrorState } from "./components/ErrorState";
import { InteractionForm } from "./components/InteractionForm";
import { LoadingState } from "./components/LoadingState";

import type {
  CreateCustomerRequest,
  CreateInteractionRequest,
  Customer,
  Interaction,
  UpdateCustomerRequest,
} from "./types/crm";

export default function App() {
  // Customer search/list state
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Selected customer/profile state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  // Loading state
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Saving state
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [savingCustomerUpdate, setSavingCustomerUpdate] = useState(false);
  const [savingInteraction, setSavingInteraction] = useState(false);

  // Error state
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // UI mode
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showEditCustomerForm, setShowEditCustomerForm] = useState(false);
  const [showInteractionForm, setShowInteractionForm] = useState(false);

  // Load customers
  const loadCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    setCustomerError(null);

    try {
      const result = await searchCustomers(query);
      setCustomers(result);
    } catch (error) {
      setCustomerError(getErrorMessage(error));
    } finally {
      setLoadingCustomers(false);
    }
  }, [query]);

  // Search as the user types.
  // The small delay prevents an API request on every individual keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCustomers();
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadCustomers]);

  // Select customer
  async function selectCustomer(customerId: string) {
    setLoadingProfile(true);
    setProfileError(null);

    // Close creation/interaction forms when changing the active customer.
    setShowCustomerForm(false);
    setShowEditCustomerForm(false);
    setShowInteractionForm(false);

    try {
      const [customer, customerInteractions] = await Promise.all([
        getCustomer(customerId),
        getInteractions(customerId),
      ]);

      setSelectedCustomer(customer);
      setInteractions(customerInteractions);
    } catch (error) {
      setProfileError(getErrorMessage(error));

      setSelectedCustomer(null);
      setInteractions([]);
    } finally {
      setLoadingProfile(false);
    }
  }

  // Create customer
  async function saveCustomer(input: CreateCustomerRequest): Promise<Customer> {
    setSavingCustomer(true);
    setCustomerError(null);

    try {
      const created = await createCustomer(input);

      // Add the newly-created customer to the current UI list immediately.
      setCustomers((current) => [created, ...current]);

      // The newly-created customer becomes the active profile.
      setSelectedCustomer(created);

      // A new customer starts with no interactions.
      setInteractions([]);

      // Close the creation form.
      setShowCustomerForm(false);

      return created;
    } catch (error) {
      setCustomerError(getErrorMessage(error));

      throw error;
    } finally {
      setSavingCustomer(false);
    }
  }

  // Update customer
  async function saveCustomerUpdate(
    input: UpdateCustomerRequest,
  ): Promise<Customer> {
    if (!selectedCustomer) {
      throw new Error("No customer is selected.");
    }

    setSavingCustomerUpdate(true);
    setProfileError(null);

    try {
      const updated = await updateCustomer(selectedCustomer.customerId, input);

      // Update the selected profile immediately.
      setSelectedCustomer(updated);

      // Update the same customer in the
      // search/list state.
      setCustomers((current) =>
        current.map((customer) =>
          customer.customerId === updated.customerId ? updated : customer,
        ),
      );

      // Close the edit form.
      setShowEditCustomerForm(false);

      return updated;
    } catch (error) {
      setProfileError(getErrorMessage(error));

      throw error;
    } finally {
      setSavingCustomerUpdate(false);
    }
  }

  // Create interaction
  async function saveInteraction(
    input: CreateInteractionRequest,
  ): Promise<Interaction> {
    if (!selectedCustomer) {
      throw new Error("No customer is selected.");
    }

    setSavingInteraction(true);

    try {
      const created = await createInteraction(
        selectedCustomer.customerId,
        input,
      );

      // Put the new interaction at the top.
      setInteractions((current) => [created, ...current]);

      setShowInteractionForm(false);

      return created;
    } finally {
      setSavingInteraction(false);
    }
  }

  // Rendering
  return (
    <div className="app-shell">
      {/* Header */}
      <header className="topbar">
        <div>
          <p className="eyebrow">Northstar CRM</p>

          <h1>Agent workspace</h1>
        </div>
      </header>

      {/* Main workspace */}
      <main className="workspace">
        {/* Customer search/list */}
        <section
          className="panel search-panel"
          aria-labelledby="search-heading"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">Customer lookup</p>

              <h2 id="search-heading">Find a customer</h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCustomerForm(true);
                setShowEditCustomerForm(false);
                setShowInteractionForm(false);
                setProfileError(null);
              }}
            >
              Add customer
            </button>
          </div>

          {/* Search input */}
          <label htmlFor="customer-search">
            Search by name, email, or customer ID
          </label>

          <input
            id="customer-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try Amina or CUS-1001"
            autoComplete="off"
          />

          {/* Loading */}
          {loadingCustomers && <LoadingState message="Loading customers…" />}

          {/* Error */}
          {!loadingCustomers && customerError && (
            <ErrorState
              message={customerError}
              onRetry={() => {
                void loadCustomers();
              }}
            />
          )}

          {/* Empty */}
          {!loadingCustomers && !customerError && customers.length === 0 && (
            <EmptyState
              title="No customers found"
              message="Try a different name, email, or customer ID."
            />
          )}

          {/* Results */}
          {!loadingCustomers && !customerError && customers.length > 0 && (
            <CustomerList
              customers={customers}
              selectedCustomerId={selectedCustomer?.customerId ?? null}
              onSelect={(customerId) => {
                void selectCustomer(customerId);
              }}
            />
          )}
        </section>

        {/* Customer workspace */}
        <section className="profile-column" aria-labelledby="workspace-heading">
          <h2 className="visually-hidden" id="workspace-heading">
            Customer workspace
          </h2>

          {/* Create customer */}
          {showCustomerForm && (
            <CustomerForm
              saving={savingCustomer}
              onCancel={() => {
                setShowCustomerForm(false);
              }}
              onSaved={saveCustomer}
            />
          )}

          {/* Profile loading */}
          {!showCustomerForm && loadingProfile && (
            <div className="panel">
              <LoadingState message="Loading customer profile…" />
            </div>
          )}

          {/* Profile error */}
          {!showCustomerForm && !loadingProfile && profileError && (
            <div className="panel">
              <ErrorState
                message={profileError}
                onRetry={() => {
                  if (selectedCustomer) {
                    void selectCustomer(selectedCustomer.customerId);
                  }
                }}
              />
            </div>
          )}

          {/* Nothing selected */}
          {!showCustomerForm &&
            !loadingProfile &&
            !profileError &&
            !selectedCustomer && (
              <div className="panel profile-placeholder">
                <p className="eyebrow">Customer profile</p>

                <h2>Select a customer</h2>

                <p>
                  Choose a customer to view the profile and interaction history.
                </p>
              </div>
            )}

          {/* Selected customer profile */}
          {!showCustomerForm &&
            !loadingProfile &&
            !profileError &&
            selectedCustomer && (
              <>
                {/* ==================================================
                                    Edit customer
                  ================================================== */}
                {showEditCustomerForm && (
                  <CustomerEditForm
                    customer={selectedCustomer}
                    saving={savingCustomerUpdate}
                    onCancel={() => {
                      setShowEditCustomerForm(false);
                    }}
                    onSaved={saveCustomerUpdate}
                  />
                )}

                {/* ==================================================
                                    Customer profile
                  ================================================== */}
                {!showEditCustomerForm && (
                  <>
                    <CustomerProfile
                      customer={selectedCustomer}
                      interactions={interactions}
                      onEditCustomer={() => {
                        setShowEditCustomerForm(true);

                        setShowInteractionForm(false);

                        setProfileError(null);
                      }}
                      onAddInteraction={() => {
                        setShowInteractionForm(true);

                        setShowEditCustomerForm(false);
                      }}
                    />

                    {/* ==================================================
                                            Add interaction form
                      ================================================== */}
                    {showInteractionForm && (
                      <InteractionForm
                        saving={savingInteraction}
                        onCancel={() => {
                          setShowInteractionForm(false);
                        }}
                        onSaved={saveInteraction}
                      />
                    )}
                  </>
                )}
              </>
            )}
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        Training environment · Synthetic customer data only
      </footer>
    </div>
  );
}

// Error normalization
function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
