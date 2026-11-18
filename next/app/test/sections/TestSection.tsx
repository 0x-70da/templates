import { getTestService } from "@/services/test/getTest.service";
import { TestCard } from "@/components/test/TestCard";

export async function TestSection() {
  const data = await getTestService("1");

  return (
    <section>
      <TestCard data={data} />
    </section>
  );
}
