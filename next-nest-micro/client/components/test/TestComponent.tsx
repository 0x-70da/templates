import type { TestData } from "@/contracts/test.types";

export interface TestComponentProps {
  data: TestData;
}

export function TestComponent({ data }: TestComponentProps) {
  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold">{data.message}</h2>
      <p className="text-sm text-muted-foreground">ID: {data.id}</p>
    </div>
  );
}
