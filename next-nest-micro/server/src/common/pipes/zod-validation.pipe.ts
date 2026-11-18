import { type PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import type { ZodSchema, ZodIssue } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const messages = result.error.issues
        .map((e: ZodIssue) => `${e.path.join(".") || "value"}: ${e.message}`)
        .join(", ");
      throw new BadRequestException(messages);
    }
    return result.data;
  }
}
