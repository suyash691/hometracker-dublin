import { render, screen, waitFor } from "@testing-library/react";
import { setViewport, VIEWPORTS } from "../helpers/viewport";

jest.mock("@/components/house-detail/SurveyTab", () => () => <div>Survey</div>);
jest.mock("@/components/house-detail/SnaggingTab", () => () => <div>Snagging</div>);
jest.mock("@/components/house-detail/SellerTab", () => () => <div>Seller</div>);
jest.mock("@/components/house-detail/ComplianceTab", () => () => <div>Compliance</div>);
jest.mock("@/components/house-detail/JournalTab", () => () => <div>Journal</div>);
jest.mock("@/components/house-detail/NeighbourhoodTab", () => () => <div>Neighbourhood</div>);

const originalReact = jest.requireActual("react");
jest.spyOn(originalReact, "use").mockImplementation((p: unknown) => (p instanceof Promise ? { id: "h1" } : p));

import HouseDetail from "@/app/houses/[id]/page";

const house = {
  id: "h1", address: "42 Phibs", status: "bidding", askingPrice: 425000, bedrooms: 3, bathrooms: 1,
  propertyType: "terraced", ber: "C2", isNewBuild: false, squareMetres: 95, pros: "[]", cons: "[]",
  media: [], bids: [], actionItems: [], renovationEstimates: [], viewingChecklists: [],
  totalCostEstimate: null, conveyancing: null, apartmentDetails: null, defectiveBlocks: null,
  biddingStrategy: null, sellerIntel: null, newBuildCompliance: null, surveyFindings: [], snagItems: [],
};
global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(house) } as Response)) as jest.Mock;

describe("House Detail — Responsive", () => {
  afterEach(() => setViewport(VIEWPORTS.desktop));

  describe("Mobile (375px)", () => {
    beforeEach(() => setViewport(VIEWPORTS.mobile));
    it("tabs are scrollable", async () => {
      const { container } = render(<HouseDetail params={Promise.resolve({ id: "h1" })} />);
      await waitFor(() => expect(screen.getByText("details")).toBeInTheDocument());
      const tabBar = container.querySelector(".overflow-x-auto");
      expect(tabBar).not.toBeNull();
    });
    it("stat cards use 2-column grid", async () => {
      const { container } = render(<HouseDetail params={Promise.resolve({ id: "h1" })} />);
      await waitFor(() => expect(screen.getByText("€425,000")).toBeInTheDocument());
      const grid = container.querySelector(".grid-cols-2");
      expect(grid).not.toBeNull();
    });
    it("all tabs visible via scroll", async () => {
      render(<HouseDetail params={Promise.resolve({ id: "h1" })} />);
      await waitFor(() => {
        for (const tab of ["details", "bids", "checklist", "estimates", "media", "costs", "neighbourhood", "survey", "journal"]) {
          expect(screen.getByText(tab)).toBeInTheDocument();
        }
      });
    });
  });
});
