import { graphqlClient } from "@/lib/graphql";
import type { Test } from "@workspace/types";

const GET_TEST_QUERY = /* GraphQL */ `
  query GetTest($id: ID!) {
    getTest(id: $id) {
      id
      test
    }
  }
`;

interface GetTestResponse {
  getTest: Test | null;
}

export async function getTest(id: string): Promise<Test> {
  const data = await graphqlClient.request<GetTestResponse>(GET_TEST_QUERY, { id });
  if (!data.getTest) {
    throw new Error("Failed to fetch test data");
  }
  return data.getTest;
}
