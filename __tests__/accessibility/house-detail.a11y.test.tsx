import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import HouseDetail from "@/app/houses/[id]/page";
import { setupFetchMock } from "../helpers/a11y-helpers";
jest.mock("@/components/house-detail/SurveyTab", () => () => <div>Survey</div>);
jest.mock("@/components/house-detail/SnaggingTab", () => () => <div>Snagging</div>);
jest.mock("@/components/house-detail/SellerTab", () => () => <div>Seller</div>);
jest.mock("@/components/house-detail/ComplianceTab", () => () => <div>Compliance</div>);
jest.mock("@/components/house-detail/JournalTab", () => () => <div>Journal</div>);
jest.mock("@/components/house-detail/NeighbourhoodTab", () => () => <div>Neighbourhood</div>);
beforeEach(() => {
  setupFetchMock();
  (global.fetch as jest.Mock).mockImplementation((url: string) => {
    if (url.includes("/api/houses/") && !url.includes("/")) return Promise.resolve({ ok: true, json: () => Promise.resolve({
      id: "h1", address: "42 Phibs", status: "bidding", askingPrice: 425000, bedrooms: 3, bathrooms: 1, propertyType: "terraced", ber: "C2",
      isNewBuild: false, squareMetres: 95, pros: "[]", cons: "[]", media: [], bids: [], actionItems: [], renovationEstimates: [],
      viewingChecklists: [], totalCostEstimate: null, conveyancing: null, apartmentDetails: null, defectiveBlocks: null,
      biddingStrategy: null, sellerIntel: null, newBuildCompliance: null, surveyFindings: [], snagItems: [],
    }) } as Response);
    return Promise.resolve({ ok: true, json: () => Promise.resolve(null) } as Response);
  });
});
describe("House Detail Accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<HouseDetail params={Promise.resolve({ id: "h1" })} />);
    
    expect(await axe(container)).toHaveNoViolations();
  });
});
