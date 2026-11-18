import { Suspense } from "react";
import { TestSection } from "./sections/TestSection";
import { TestSkeleton } from "@/components/test/TestSkeleton";

export default function TestPage() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="mb-4 text-2xl font-bold">Test Page</h1>
      <Suspense fallback={<TestSkeleton />}>
        <TestSection />
      </Suspense>
    </main>
  );
}
