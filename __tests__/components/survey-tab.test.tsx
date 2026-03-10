import { render, screen } from "@testing-library/react";
import SurveyTab from "@/components/house-detail/SurveyTab";
describe("SurveyTab", () => {
  it("renders findings", () => {
    render(<SurveyTab houseId="h1" findings={[{ id: "f1", houseId: "h1", category: "structural", location: "attic", description: "Sagging beam", action: "renegotiate" }]} reload={jest.fn()} />);
    expect(screen.getByText("Sagging beam")).toBeInTheDocument();
  });
  it("shows structural warning", () => {
    render(<SurveyTab houseId="h1" findings={[{ id: "f1", houseId: "h1", category: "structural", location: "attic", description: "Crack", action: "accept" }]} reload={jest.fn()} />);
    expect(screen.getByText(/renegotiating/)).toBeInTheDocument();
  });
  it("shows add form", () => {
    render(<SurveyTab houseId="h1" findings={[]} reload={jest.fn()} />);
    expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
  });
});
