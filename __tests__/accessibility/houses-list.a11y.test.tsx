import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import HousesPage from "@/app/houses/page";
import { setupFetchMock } from "../helpers/a11y-helpers";
jest.mock("next/link", () => ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>);
beforeEach(() => setupFetchMock());
describe("Houses List Accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<HousesPage />);
    
    expect(await axe(container)).toHaveNoViolations();
  });
});
