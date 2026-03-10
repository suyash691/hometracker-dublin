import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/login/page";
import { setViewport, VIEWPORTS } from "../helpers/viewport";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe("Login — Responsive", () => {
  afterEach(() => setViewport(VIEWPORTS.desktop));

  describe("Mobile (375px)", () => {
    beforeEach(() => setViewport(VIEWPORTS.mobile));

    it("form is visible and usable", () => {
      render(<LoginPage />);
      expect(screen.getByPlaceholderText("Your name")).toBeVisible();
      expect(screen.getByText("Sign In")).toBeVisible();
    });

    it("form has max-width constraint for readability", () => {
      const { container } = render(<LoginPage />);
      const form = container.querySelector("form");
      expect(form?.className).toContain("max-w-sm");
    });
  });
});
