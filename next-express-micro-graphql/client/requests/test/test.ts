import { graphqlClient } from "@/lib/graphql";
import type { TestData } from "@/contracts/test.types";

const GET_TEST_QUERY = /* GraphQL */ `
  query GetTest($id: ID!) {
    getTest(id: $id) {
      id
      test
    }
  }
`;

interface GetTestResponse {
  getTest: TestData | null;
}

export async function getTest(id: string): Promise<TestData> {
  const data = await graphqlClient.request<GetTestResponse>(GET_TEST_QUERY, { id });
  if (!data.getTest) {
    throw new Error("Failed to fetch test data");
  }
  return data.getTest;
}
