import type { Test } from "@workspace/types";
import { testSchema } from "@workspace/validation";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";
import { Button } from "@workspace/ui/components/button";
import { TestCard } from "@/components/test/TestCard";
import { getTest } from "@/requests/test/getTest";
import { useTestStore } from "@/stores/test/test.store";

export async function loader(): Promise<{ test: Test | null }> {
  try {
    const res = await getTest();
    return { test: res.data ?? null };
  } catch {
    return { test: null };
  }
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const rawTest = formData.get("test");

  const result = testSchema.safeParse({ test: rawTest });
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid input" };
  }

  return { success: true, item: { id: String(Date.now()), test: result.data.test } };
}

export default function TestRoute() {
  const { test } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { count, increment, reset } = useTestStore();

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container mx-auto max-w-xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Test Domain (React Router v7)</h1>
        <Link to="/">
          <Button variant="outline" size="sm">
            Back Home
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Loader Data (Server Fetch)</h2>
        {test ? (
          <TestCard data={test} />
        ) : (
          <p className="text-muted-foreground text-sm">No initial test data loaded.</p>
        )}
      </div>

      <div className="mb-8 rounded-lg border p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Route Action Form</h2>
        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="test-input" className="mb-1 block text-sm font-medium">
              Test Value
            </label>
            <input
              id="test-input"
              name="test"
              type="text"
              placeholder="Enter test value..."
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>
          {actionData?.error && (
            <p className="text-destructive text-sm">{actionData.error}</p>
          )}
          {actionData?.success && (
            <p className="text-sm text-green-600">Action submitted successfully!</p>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit via Action"}
          </Button>
        </Form>
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
