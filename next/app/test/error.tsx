"use client";

import { Button } from "@/components/ui/button";

export default function TestError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center p-6 text-center">
      <h2 className="mb-2 text-xl font-bold">Error loading test data</h2>
      <p className="mb-4 text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={() => reset()}>Retry</Button>
    </div>
  );
}
