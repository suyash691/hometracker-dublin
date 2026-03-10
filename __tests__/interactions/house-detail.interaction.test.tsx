import { render, screen, waitFor, fireEvent } from "@testing-library/react";

const originalReact = jest.requireActual("react");
jest.spyOn(originalReact, "use").mockImplementation((p: unknown) => (p instanceof Promise ? { id: "h1" } : p));

jest.mock("@/components/house-detail/SurveyTab", () => () => <div data-testid="survey-content">Survey Content</div>);
jest.mock("@/components/house-detail/SnaggingTab", () => () => <div>Snagging</div>);
jest.mock("@/components/house-detail/SellerTab", () => () => <div data-testid="seller-content">Seller Content</div>);
jest.mock("@/components/house-detail/ComplianceTab", () => () => <div>Compliance</div>);
jest.mock("@/components/house-detail/JournalTab", () => () => <div data-testid="journal-content">Journal Content</div>);
jest.mock("@/components/house-detail/NeighbourhoodTab", () => () => <div data-testid="neighbourhood-content">Neighbourhood Content</div>);

import HouseDetail from "@/app/houses/[id]/page";

const house = {
  id: "h1", address: "42 Phibs", status: "bidding", askingPrice: 425000, bedrooms: 3, bathrooms: 1,
  propertyType: "terraced", ber: "C2", isNewBuild: false, squareMetres: 95, pros: "[]", cons: "[]",
  media: [], bids: [], actionItems: [], renovationEstimates: [], viewingChecklists: [],
  totalCostEstimate: null, conveyancing: null, apartmentDetails: null, defectiveBlocks: null,
  biddingStrategy: null, sellerIntel: null, newBuildCompliance: null, surveyFindings: [], snagItems: [],
};
global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(house) } as Response)) as jest.Mock;

describe("House Detail — Interactions", () => {
  it("clicking tab switches content", async () => {
    render(<HouseDetail params={Promise.resolve({ id: "h1" })} />);
    await waitFor(() => expect(screen.getByText("details")).toBeInTheDocument());

    // Click survey tab
    fireEvent.click(screen.getByText("survey"));
    await waitFor(() => expect(screen.getByTestId("survey-content")).toBeInTheDocument());

    // Click journal tab
    fireEvent.click(screen.getByText("journal"));
    await waitFor(() => expect(screen.getByTestId("journal-content")).toBeInTheDocument());

    // Click neighbourhood tab
    fireEvent.click(screen.getByText("neighbourhood"));
    await waitFor(() => expect(screen.getByTestId("neighbourhood-content")).toBeInTheDocument());
  });

  it("clicking seller tab shows seller content", async () => {
    render(<HouseDetail params={Promise.resolve({ id: "h1" })} />);
    await waitFor(() => expect(screen.getByText("seller")).toBeInTheDocument());
    fireEvent.click(screen.getByText("seller"));
    await waitFor(() => expect(screen.getByTestId("seller-content")).toBeInTheDocument());
  });

  it("status dropdown triggers API call", async () => {
    render(<HouseDetail params={Promise.resolve({ id: "h1" })} />);
    await waitFor(() => expect(screen.getByDisplayValue("bidding")).toBeInTheDocument());
    fireEvent.change(screen.getByDisplayValue("bidding"), { target: { value: "viewed" } });
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/api/houses/h1"), expect.objectContaining({ method: "PUT" })));
  });
});
