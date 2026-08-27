import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Login } from "../components/LoginState";
import * as auth from "../security/auth";

describe("Login component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("calls onSuccess when login succeeds", async () => {
    const mockLogin = vi.spyOn(auth, "login").mockResolvedValue({
      username: "test",
      role: "ADMIN",
      token: "lab.test.ADMIN.hash",
    } as any);

    const onSuccess = vi.fn();

    render(<Login onSuccess={onSuccess} />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Username/i), "admin1");
    await user.type(screen.getByLabelText(/Password/i), "admin1");

    await user.click(screen.getByRole("button", { name: /Sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin1", "admin1");
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("shows an error when login fails", async () => {
    const mockLogin = vi.spyOn(auth, "login").mockRejectedValue(new Error("Invalid credentials"));

    const onSuccess = vi.fn();

    render(<Login onSuccess={onSuccess} />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Username/i), "admin1");
    await user.type(screen.getByLabelText(/Password/i), "agent1");

    await user.click(screen.getByRole("button", { name: /Sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid credentials");

    expect(onSuccess).not.toHaveBeenCalled();
  });
});