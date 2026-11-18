import { render, screen } from "@testing-library/react-native";
import { TestCard } from "@/components/test/TestCard";

describe("TestCard", () => {
  it("renders test details correctly", () => {
    render(<TestCard data={{ id: "42", test: "Mobile Unit Test" }} />);

    expect(screen.getByText("Mobile Unit Test")).toBeTruthy();
    expect(screen.getByText("ID: 42")).toBeTruthy();
  });
});
