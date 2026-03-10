import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import Dashboard from "@/app/page";
import { setupFetchMock } from "../helpers/a11y-helpers";

jest.mock("next/link", () => ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>);
beforeEach(() => setupFetchMock());

describe("Dashboard Accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<Dashboard />);
    // Wait for async renders
    await new Promise(r => setTimeout(r, 100));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
