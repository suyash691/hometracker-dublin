import { render, screen } from "@testing-library/react";
import SellerTab from "@/components/house-detail/SellerTab";
describe("SellerTab", () => {
  it("renders questionnaire", () => {
    render(<SellerTab houseId="h1" intel={null} reload={jest.fn()} />);
    expect(screen.getByText("Seller Intelligence")).toBeInTheDocument();
    expect(screen.getByText(/chain/)).toBeInTheDocument();
  });
  it("shows save button", () => {
    render(<SellerTab houseId="h1" intel={null} reload={jest.fn()} />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
