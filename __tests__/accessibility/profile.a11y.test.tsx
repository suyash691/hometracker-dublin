import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import ProfilePage from "@/app/profile/page";
import { setupFetchMock } from "../helpers/a11y-helpers";

beforeEach(() => setupFetchMock());

describe("Profile Accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<ProfilePage />);
    
    await new Promise(r => setTimeout(r, 50)); const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
