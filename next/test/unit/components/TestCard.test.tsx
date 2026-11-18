import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestCard } from "@/components/test/TestCard";

describe("TestCard", () => {
  it("renders the test item name and id", () => {
    render(<TestCard data={{ id: "10", test: "Card Title" }} />);

    expect(screen.getByRole("heading", { name: "Card Title" })).toBeInTheDocument();
    expect(screen.getByText("ID: 10")).toBeInTheDocument();
  });
});
