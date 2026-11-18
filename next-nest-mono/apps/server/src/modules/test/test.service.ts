import { Injectable, BadRequestException, NotFoundException, Inject } from "@nestjs/common";
import { TestQuery, type TestRow } from "./test.query";
import type { Test } from "@workspace/types";

@Injectable()
export class TestService {
  constructor(@Inject(TestQuery) private readonly testQuery: TestQuery) {}

  async getTest(id: string): Promise<Test> {
    this.assertValidId(id);
    const item = await this.fetchItem(id);
    return this.formatResponse(item);
  }

  private assertValidId(id: string): void {
    if (!id || id === "invalid") {
      throw new BadRequestException("Invalid test ID");
    }
  }

  private async fetchItem(id: string): Promise<TestRow> {
    const item = await this.testQuery.findTestById(id);
    if (!item) {
      throw new NotFoundException("Test item not found");
    }
    return item;
  }

  private formatResponse(item: TestRow): Test {
    return {
      id: item.id,
      test: item.name,
    };
  }
}
