import { render, screen } from "@testing-library/react";
import ComplianceTab from "@/components/house-detail/ComplianceTab";
describe("ComplianceTab", () => {
  it("renders HomeBond form", () => {
    render(<ComplianceTab houseId="h1" data={null} reload={jest.fn()} />);
    expect(screen.getByText("HomeBond / BCAR Compliance")).toBeInTheDocument();
  });
  it("shows warranty warning", () => {
    render(<ComplianceTab houseId="h1" data={null} reload={jest.fn()} />);
    expect(screen.getByText(/structural defects only/)).toBeInTheDocument();
  });
});
