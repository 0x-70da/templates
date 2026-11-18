import { getTest } from "@/requests/test/test";
import { TestComponent } from "@/components/test/TestComponent";

export async function TestSection() {
  const data = await getTest("1");

  return (
    <section>
      <TestComponent data={data} />
    </section>
  );
}
