import { trpcCaller } from "@/lib/trpc/server";
import { TestComponent } from "@/components/test/TestComponent";

export async function TestSection() {
  const data = await trpcCaller.test.getTest.query({ id: "1" });

  return (
    <section>
      <TestComponent data={data} />
    </section>
  );
}
