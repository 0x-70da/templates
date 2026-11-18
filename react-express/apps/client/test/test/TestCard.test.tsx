import { render, screen } from "@testing-library/react";
import type { Test } from "@workspace/types";
import { describe, expect, it } from "vitest";
import { TestCard } from "@/components/test/TestCard";

describe("TestCard", () => {
  it("renders test item details", () => {
    const mockData: Test = {
      id: "1",
      test: "Sample test value",
    };

    render(<TestCard data={mockData} />);

    expect(screen.getByText("Sample test value")).toBeInTheDocument();
    expect(screen.getByText("ID: 1")).toBeInTheDocument();
  });
});
