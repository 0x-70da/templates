import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestCard } from "@/components/test/TestCard";

describe("TestCard", () => {
  it("renders data correctly", () => {
    render(<TestCard data={{ id: "1", test: "Sample Item" }} />);

    expect(screen.getByRole("heading", { name: "Sample Item" })).toBeInTheDocument();
    expect(screen.getByText("ID: 1")).toBeInTheDocument();
  });
});
