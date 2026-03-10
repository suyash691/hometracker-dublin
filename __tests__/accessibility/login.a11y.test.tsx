import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import LoginPage from "@/app/login/page";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe("Login Accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
