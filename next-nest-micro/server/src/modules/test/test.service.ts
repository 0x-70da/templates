import { Injectable, BadRequestException, NotFoundException, Inject } from "@nestjs/common";
import { TestQuery, type TestRow } from "./test.query";
import type { TestData } from "../../contracts/test.types";

@Injectable()
export class TestService {
  constructor(@Inject(TestQuery) private readonly testQuery: TestQuery) {}

  async getTest(id: string): Promise<TestData> {
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

  private formatResponse(item: TestRow): TestData {
    return {
      id: item.id,
      message: item.name,
    };
  }
}
