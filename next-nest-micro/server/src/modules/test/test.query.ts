import { Injectable } from "@nestjs/common";
import { nullToUndefined } from "../../lib/nullToUndefined";

export type TestRow = {
  id: string;
  name: string;
};

@Injectable()
export class TestQuery {
  async findTestById(id: string): Promise<TestRow | undefined> {
    if (id === "not-found") {
      return undefined;
    }
    const row: TestRow = { id, name: `Sample test record ${id}` };
    return nullToUndefined(row);
  }
}
