import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import MortgagePage from "@/app/mortgage/page";
import { setupFetchMock } from "../helpers/a11y-helpers";
beforeEach(() => setupFetchMock());
describe("Mortgage Accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<MortgagePage />);
    await new Promise(r => setTimeout(r, 100));
    expect(await axe(container)).toHaveNoViolations();
  });
});
