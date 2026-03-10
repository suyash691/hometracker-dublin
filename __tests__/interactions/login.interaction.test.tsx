import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ user: "sarah" }) } as Response)) as jest.Mock;

describe("Login — Interactions", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("submitting form calls login API", async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("Your name"), { target: { value: "sarah" } });
    fireEvent.click(screen.getByText("Sign In"));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/api/auth/login"), expect.anything()));
  });

  it("successful login redirects to /", async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("Your name"), { target: { value: "sarah" } });
    fireEvent.click(screen.getByText("Sign In"));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  it("failed login shows error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, text: () => Promise.resolve("Invalid") });
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("Your name"), { target: { value: "bad" } });
    fireEvent.click(screen.getByText("Sign In"));
    await waitFor(() => expect(screen.getByText("Invalid credentials")).toBeInTheDocument());
  });
});
