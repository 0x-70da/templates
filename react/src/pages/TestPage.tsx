import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getTest } from "@/requests/test/getTest";
import { TestCard } from "@/components/test/TestCard";
import { TestSkeleton } from "@/components/test/TestSkeleton";
import { Button } from "@/components/ui/button";
import { useTestStore } from "@/stores/test/test.store";

export function TestPage() {
  const { count, increment, reset } = useTestStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["test", "1"],
    queryFn: () => getTest("1"),
  });

  return (
    <div className="container mx-auto max-w-xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Test Domain</h1>
        <Link to="/">
          <Button variant="outline" size="sm">
            Back
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Server State (TanStack Query)</h2>
        {isLoading && <TestSkeleton />}
        {error && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm">
            Failed to load server data: {error.message}
          </div>
        )}
        {data && <TestCard data={data} />}
      </div>

      <div className="rounded-lg border p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Client State (Zustand + Immer)</h2>
        <p className="text-muted-foreground mb-4 text-sm">Count: {count}</p>
        <div className="flex gap-2">
          <Button onClick={increment} size="sm">
            Increment
          </Button>
          <Button onClick={reset} variant="secondary" size="sm">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
