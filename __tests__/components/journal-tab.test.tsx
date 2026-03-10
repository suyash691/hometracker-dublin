import { render, screen, waitFor } from "@testing-library/react";
import JournalTab from "@/components/house-detail/JournalTab";
global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([
  { id: "j1", type: "viewing_reaction", gutRating: 4, content: "Loved the garden", createdAt: new Date().toISOString() },
]) } as Response)) as jest.Mock;
describe("JournalTab", () => {
  it("renders entries", async () => {
    render(<JournalTab houseId="h1" address="42 Phibs" />);
    await waitFor(() => expect(screen.getByText("Loved the garden")).toBeInTheDocument());
  });
  it("shows star rating", async () => {
    render(<JournalTab houseId="h1" address="42 Phibs" />);
    await waitFor(() => expect(screen.getByText("★★★★☆")).toBeInTheDocument());
  });
  it("shows gut feeling input", () => {
    render(<JournalTab houseId="h1" address="42 Phibs" />);
    expect(screen.getByText("Gut feeling:")).toBeInTheDocument();
  });
});
