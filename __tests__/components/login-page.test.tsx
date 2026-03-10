import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/login/page";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));

global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ user: "sarah" }) }) as jest.Mock;

describe("Login Page", () => {
  it("renders login form", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });
  it("shows HomeTracker branding", () => {
    render(<LoginPage />);
    expect(screen.getByText(/HomeTracker/)).toBeInTheDocument();
  });
});
