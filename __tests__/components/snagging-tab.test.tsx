import { render, screen } from "@testing-library/react";
import SnaggingTab from "@/components/house-detail/SnaggingTab";
describe("SnaggingTab", () => {
  it("shows seed button when empty", () => {
    render(<SnaggingTab houseId="h1" snags={[]} reload={jest.fn()} />);
    expect(screen.getByText("Load Default Snag List")).toBeInTheDocument();
  });
  it("renders snags grouped by room", () => {
    render(<SnaggingTab houseId="h1" snags={[
      { id: "s1", houseId: "h1", room: "Kitchen", category: "cosmetic", description: "Paint chip", status: "identified", priority: "low" },
      { id: "s2", houseId: "h1", room: "Kitchen", category: "functional", description: "Drawer stuck", status: "fixed", priority: "medium" },
    ]} reload={jest.fn()} />);
    expect(screen.getByText("Kitchen")).toBeInTheDocument();
    expect(screen.getByText("Paint chip")).toBeInTheDocument();
  });
  it("shows progress bar", () => {
    render(<SnaggingTab houseId="h1" snags={[
      { id: "s1", houseId: "h1", room: "Kitchen", category: "cosmetic", description: "Chip", status: "fixed", priority: "low" },
      { id: "s2", houseId: "h1", room: "Kitchen", category: "cosmetic", description: "Mark", status: "identified", priority: "low" },
    ]} reload={jest.fn()} />);
    expect(screen.getByText("1/2 resolved")).toBeInTheDocument();
  });
});
