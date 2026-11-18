import { Suspense } from "react";
import Link from "next/link";
import { TestSection } from "./sections/TestSection";
import { TestSkeleton } from "@/components/test/TestSkeleton";
import { TestForm } from "@/components/test/TestForm";
import { Button } from "@/components/ui/button";

export default function TestPage() {
  return (
    <main className="container mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Test Domain</h1>
        <Link href="/">
          <Button variant="outline" size="sm">
            Home
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Server Component with Suspense</h2>
        <Suspense fallback={<TestSkeleton />}>
          <TestSection />
        </Suspense>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Server Action Form (RHF + Zod)</h2>
        <TestForm />
      </div>
    </main>
  );
}
