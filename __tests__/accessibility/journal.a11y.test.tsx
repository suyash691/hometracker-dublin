import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import JournalPage from "@/app/journal/page";
import { setupFetchMock } from "../helpers/a11y-helpers";

beforeEach(() => setupFetchMock());

describe("Journal Accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<JournalPage />);
    await new Promise(r => setTimeout(r, 100));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
