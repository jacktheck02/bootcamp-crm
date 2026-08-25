import { render, screen } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import { StatusBadge } from "../components/StatusBadge";

describe("StatusBadge", () => {
  it.each([
    ["PROSPECT", "Prospect"],
    ["ACTIVE", "Active"],
    ["SUSPENDED", "Suspended"],
    ["CLOSED", "Closed"],
  ] as const)("renders %s as %s", (status, expected) => {
    render(<StatusBadge status={status} />);

    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
