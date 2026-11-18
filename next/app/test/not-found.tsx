import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TestNotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center p-6 text-center">
      <h2 className="mb-2 text-2xl font-bold">Test Item Not Found</h2>
      <p className="mb-4 text-sm text-muted-foreground">The test record could not be found.</p>
      <Link href="/test">
        <Button>Back to Test</Button>
      </Link>
    </div>
  );
}
