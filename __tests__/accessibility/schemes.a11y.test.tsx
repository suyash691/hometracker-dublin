import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import SchemesPage from "@/app/schemes/page";
import { setupFetchMock } from "../helpers/a11y-helpers";
beforeEach(() => setupFetchMock());
describe("Schemes Accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<SchemesPage />);
    await new Promise(r => setTimeout(r, 100));
    expect(await axe(container)).toHaveNoViolations();
  });
});
