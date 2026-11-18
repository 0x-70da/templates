import type { EventMap } from "@workspace/types";
import type { createLogger } from "@workspace/service-kit";

export function createTestCreatedSubscriber(logger: ReturnType<typeof createLogger>) {
  return async (event: EventMap["test.created"]) => {
    logger.info({ event }, "example only — delete when copying this service");
  };
}
