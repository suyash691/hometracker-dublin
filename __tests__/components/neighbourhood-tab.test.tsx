import { render, screen, waitFor } from "@testing-library/react";
import NeighbourhoodTab from "@/components/house-detail/NeighbourhoodTab";

const mockData = {
  amenities: [{ id: "a1", name: "Tesco Express", distanceMetres: 350, walkingMinutes: 4, walkable: true, status: "walkable", amenity: { icon: "🛒", name: "Tesco", maxWalkingMetres: 1000 } }],
  commute: [{ id: "c1", workplaceLabel: "Sarah's workplace", mode: "walking", distanceMetres: 2800, durationMinutes: 35 }],
  transit: { hasWalkableTransit: true },
};

global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockData) } as Response)) as jest.Mock;

describe("NeighbourhoodTab", () => {
  it("renders amenities", async () => {
    render(<NeighbourhoodTab houseId="h1" />);
    await waitFor(() => expect(screen.getByText("Tesco Express")).toBeInTheDocument());
  });
  it("shows walkable indicator", async () => {
    render(<NeighbourhoodTab houseId="h1" />);
    await waitFor(() => expect(screen.getByText("✓")).toBeInTheDocument());
  });
  it("shows commute", async () => {
    render(<NeighbourhoodTab houseId="h1" />);
    await waitFor(() => expect(screen.getByText(/Sarah's workplace/)).toBeInTheDocument());
  });
  it("shows refresh button", () => {
    render(<NeighbourhoodTab houseId="h1" />);
    expect(screen.getByRole("button", { name: /Refresh/ })).toBeInTheDocument();
  });
});
