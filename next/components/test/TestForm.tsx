"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { testSchema, type TestInput } from "@/validation/test.validation";
import { createTestAction } from "@/actions/test/createTest.action";
import { Button } from "@/components/ui/button";

export function TestForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TestInput>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      test: "",
    },
  });

  async function onSubmit(data: TestInput) {
    try {
      await createTestAction(data);
      reset();
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Failed to submit",
      });
    }
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      className="space-y-4 rounded-lg border p-4 shadow-sm"
    >
      <h3 className="text-lg font-semibold">Add New Test</h3>
      <div>
        <label htmlFor="test-input" className="mb-1 block text-sm font-medium">
          Test Value
        </label>
        <input
          id="test-input"
          {...register("test")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Enter test value..."
        />
        {errors.test && <p className="mt-1 text-xs text-destructive">{errors.test.message}</p>}
      </div>

      {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Submit"}
      </Button>
    </form>
  );
}
