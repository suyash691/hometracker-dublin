import { render, screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";

// Mock React's use() to resolve promises synchronously in tests
const originalReact = jest.requireActual("react");
jest.spyOn(originalReact, "use").mockImplementation((p: unknown) => {
  if (p instanceof Promise) {
    // For our test params, return the resolved value synchronously
    let result: unknown;
    (p as Promise<unknown>).then(v => { result = v; });
    return result || { id: "h1" };
  }
  return p;
});

import HouseDetail from "@/app/houses/[id]/page";

jest.mock("next/link", () => ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>);
jest.mock("@/components/house-detail/SurveyTab", () => () => <div data-testid="survey-tab">Survey</div>);
jest.mock("@/components/house-detail/SnaggingTab", () => () => <div data-testid="snagging-tab">Snagging</div>);
jest.mock("@/components/house-detail/SellerTab", () => () => <div data-testid="seller-tab">Seller</div>);
jest.mock("@/components/house-detail/ComplianceTab", () => () => <div data-testid="compliance-tab">Compliance</div>);
jest.mock("@/components/house-detail/JournalTab", () => () => <div data-testid="journal-tab">Journal</div>);
jest.mock("@/components/house-detail/NeighbourhoodTab", () => () => <div data-testid="neighbourhood-tab">Neighbourhood</div>);

const baseHouse = {
  id: "h1", address: "42 Phibsborough Rd", neighbourhood: "Phibsborough", eircode: "D07",
  askingPrice: 425000, currentBid: 440000, status: "bidding", bedrooms: 3, bathrooms: 1,
  propertyType: "terraced", ber: "C2", isNewBuild: false, squareMetres: 95,
  notes: "Nice garden", pros: JSON.stringify(["South-facing"]), cons: JSON.stringify(["Needs kitchen"]),
  media: [], bids: [{ id: "b1", amount: 440000, bidDate: new Date().toISOString(), source: "manual", isOurs: true }],
  actionItems: [], renovationEstimates: [], viewingChecklists: [],
  totalCostEstimate: null, conveyancing: null, apartmentDetails: null, defectiveBlocks: null,
  biddingStrategy: null, sellerIntel: null, newBuildCompliance: null, surveyFindings: [], snagItems: [],
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(baseHouse) } as Response)) as jest.Mock;

beforeEach(() => {
  (global.fetch as jest.Mock).mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve(baseHouse) } as Response));
});

const mkParams = () => Promise.resolve({ id: "h1" });

describe("House Detail Page", () => {
  it("renders address and stats", async () => {
    render(<HouseDetail params={mkParams()} />);
    await waitFor(() => expect(screen.getByText("42 Phibsborough Rd")).toBeInTheDocument());
    expect(screen.getByText("€425,000")).toBeInTheDocument();
    expect(screen.getByText("3 / 1")).toBeInTheDocument();
    expect(screen.getByText("C2")).toBeInTheDocument();
  });

  it("shows default tabs for non-apartment non-new-build", async () => {
    render(<HouseDetail params={mkParams()} />);
    await waitFor(() => expect(screen.getByText("details")).toBeInTheDocument());
    expect(screen.getByText("bids")).toBeInTheDocument();
    expect(screen.getByText("costs")).toBeInTheDocument();
    expect(screen.getByText("neighbourhood")).toBeInTheDocument();
    expect(screen.getByText("survey")).toBeInTheDocument();
    expect(screen.getByText("journal")).toBeInTheDocument();
  });

  it("shows seller tab when status is bidding", async () => {
    render(<HouseDetail params={mkParams()} />);
    await waitFor(() => expect(screen.getByText("seller")).toBeInTheDocument());
  });

  it("does NOT show legal tab when status is bidding", async () => {
    render(<HouseDetail params={mkParams()} />);
    await waitFor(() => expect(screen.getByText("details")).toBeInTheDocument());
    expect(screen.queryByText("legal")).not.toBeInTheDocument();
  });

  it("does NOT show snagging/compliance tabs for non-new-build", async () => {
    render(<HouseDetail params={mkParams()} />);
    await waitFor(() => expect(screen.getByText("details")).toBeInTheDocument());
    expect(screen.queryByText("snagging")).not.toBeInTheDocument();
    expect(screen.queryByText("compliance")).not.toBeInTheDocument();
  });

  it("does NOT show apartment tab for non-apartment", async () => {
    render(<HouseDetail params={mkParams()} />);
    await waitFor(() => expect(screen.getByText("details")).toBeInTheDocument());
    expect(screen.queryByText("apartment")).not.toBeInTheDocument();
  });

  it("shows legal tab for sale_agreed status", async () => {
    (global.fetch as jest.Mock).mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ ...baseHouse, status: "sale_agreed" }) } as Response));
    render(<HouseDetail params={mkParams()} />);
    await waitFor(() => expect(screen.getByText("legal")).toBeInTheDocument());
  });

  it("shows apartment tab for apartment type", async () => {
    (global.fetch as jest.Mock).mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ ...baseHouse, propertyType: "apartment" }) } as Response));
    render(<HouseDetail params={mkParams()} />);
    await waitFor(() => expect(screen.getByText("apartment")).toBeInTheDocument());
  });

  it("shows snagging + compliance tabs for new builds", async () => {
    (global.fetch as jest.Mock).mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ ...baseHouse, isNewBuild: true, status: "sale_agreed" }) } as Response));
    render(<HouseDetail params={mkParams()} />);
    await waitFor(() => expect(screen.getByText("snagging")).toBeInTheDocument());
    expect(screen.getByText("compliance")).toBeInTheDocument();
  });

  it("shows pros and cons", async () => {
    render(<HouseDetail params={mkParams()} />);
    await waitFor(() => expect(screen.getByText(/South-facing/)).toBeInTheDocument());
    expect(screen.getByText(/Needs kitchen/)).toBeInTheDocument();
  });

  it("shows bid in bids list", async () => {
    render(<HouseDetail params={mkParams()} />);
    await waitFor(() => expect(screen.getByText("€440,000")).toBeInTheDocument());
  });
});
