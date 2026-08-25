import { render, screen } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import { EmptyState } from "../components/EmptyState";

describe("EmptyState", () => {
  it("displays title and message", () => {
    render(
      <EmptyState
        title="No customers found"
        message="Try a different search."
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "No customers found",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Try a different search.")).toBeInTheDocument();
  });
});
