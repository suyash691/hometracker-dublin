import { render, screen, waitFor } from "@testing-library/react";
import HousesPage from "@/app/houses/page";

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>;
});

const mockHouses = [
  {
    id: "h1", address: "42 Phibsborough Rd", status: "viewing_scheduled",
    askingPrice: 375000, currentBid: 380000, neighbourhood: "Phibsborough",
    bedrooms: 3, bathrooms: 2, propertyType: "terraced", ber: "B2",
    media: [], bids: [], actionItems: [], renovationEstimates: [], viewingChecklists: [],
  },
];

global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(mockHouses) } as Response)
) as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("HousesPage", () => {
  it("renders house cards with details", async () => {
    render(<HousesPage />);
    await waitFor(() => {
      expect(screen.getByText("42 Phibsborough Rd")).toBeInTheDocument();
      expect(screen.getByText("€375,000")).toBeInTheDocument();
      expect(screen.getByText("Bid: €380,000")).toBeInTheDocument();
      expect(screen.getByText("viewing scheduled")).toBeInTheDocument();
    });
  });

  it("shows house metadata", async () => {
    render(<HousesPage />);
    await waitFor(() => {
      expect(screen.getAllByText(/Phibsborough/).length).toBeGreaterThan(0);
      expect(screen.getByText(/3 bed/)).toBeInTheDocument();
      expect(screen.getByText(/BER B2/)).toBeInTheDocument();
    });
  });

  it("shows empty state when no houses", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve([]),
    });
    render(<HousesPage />);
    await waitFor(() => {
      expect(screen.getByText(/No houses yet/)).toBeInTheDocument();
    });
  });
});
