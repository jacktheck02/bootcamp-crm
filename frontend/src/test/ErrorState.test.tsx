import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { describe, expect, it, vi } from "vitest";

import { ErrorState } from "../components/ErrorState";

describe("ErrorState", () => {
  it("displays the error", () => {
    render(<ErrorState message="Unable to load customers." />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to load customers.",
    );
  });

  it("retries when requested", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <ErrorState message="Unable to load customers." onRetry={onRetry} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /retry/i,
      }),
    );

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
