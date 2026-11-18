import type { Test } from "@/types/test.types";

export interface TestCardProps {
  data: Test;
}

export function TestCard({ data }: TestCardProps) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h2 className="text-lg font-semibold">{data.test}</h2>
      <p className="text-muted-foreground text-sm">ID: {data.id}</p>
    </div>
  );
}
