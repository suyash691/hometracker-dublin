import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import ActionsPage from "@/app/actions/page";
import { setupFetchMock } from "../helpers/a11y-helpers";
jest.mock("next/link", () => ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>);
beforeEach(() => setupFetchMock());
describe("Actions Accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<ActionsPage />);
    
    expect(await axe(container)).toHaveNoViolations();
  });
});
