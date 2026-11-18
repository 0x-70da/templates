import type { Test } from "@workspace/types";

export interface TestComponentProps {
  data: Test;
}

export function TestComponent({ data }: TestComponentProps) {
  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold">{data.test}</h2>
      <p className="text-sm text-muted-foreground">ID: {data.id}</p>
    </div>
  );
}
