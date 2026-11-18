import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestComponent } from "@/components/test/TestComponent";

describe("TestComponent", () => {
  it("renders the test data correctly", () => {
    render(<TestComponent data={{ id: "1", test: "Sample Value" }} />);

    expect(screen.getByRole("heading", { name: "Sample Value" })).toBeInTheDocument();
    expect(screen.getByText("ID: 1")).toBeInTheDocument();
  });
});
