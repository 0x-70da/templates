import { randomUUID } from "node:crypto";
import { Queue, UnrecoverableError, Worker, type Job } from "bullmq";
import type { EventMap } from "@workspace/types";
import { eventSubscribers } from "@workspace/types";
import { eventSchemas } from "@workspace/validation";
import { getRequestContext } from "./context.js";
import { createRedisConnection } from "./redis.js";

type EventEnvelope<K extends keyof EventMap> = {
  id: string;
  type: K;
  occurredAt: string;
  requestId?: string;
  data: EventMap[K];
};

export function connectEvents(options: { redisUrl: string; serviceName: string }) {
  const connection = createRedisConnection(options.redisUrl);
  const queues = new Map<string, Queue>();
  const handlers = new Map<keyof EventMap, (data: unknown) => Promise<void>>();
  let worker: Worker | undefined;
  const queueFor = (name: string) => {
    const existing = queues.get(name);
    if (existing) return existing;
    const queue = new Queue(`events.${name}`, { connection });
    queues.set(name, queue);
    return queue;
  };
  return {
    async publish<K extends keyof EventMap>(type: K, data: EventMap[K]) {
      const parsed = eventSchemas[type].parse(data);
      const envelope: EventEnvelope<K> = {
        id: randomUUID(),
        type,
        occurredAt: new Date().toISOString(),
        requestId: getRequestContext()?.requestId,
        data: parsed,
      };
      await Promise.all(
        eventSubscribers[type].map((subscriber) =>
          queueFor(subscriber).add(type, envelope, {
            jobId: envelope.id,
            attempts: 5,
            backoff: { type: "exponential", delay: 1000 },
            removeOnComplete: { count: 1000 },
            removeOnFail: { age: 7 * 24 * 60 * 60, count: 5000 },
          }),
        ),
      );
      return envelope;
    },
    subscribe<K extends keyof EventMap>(type: K, handler: (data: EventMap[K]) => Promise<void>) {
      handlers.set(type, async (data) => handler(data as EventMap[K]));
    },
    async start() {
      worker = new Worker(
        `events.${options.serviceName}`,
        async (job: Job<EventEnvelope<keyof EventMap>>) => {
          const schema = eventSchemas[job.name as keyof EventMap];
          const parsed = schema.safeParse(job.data.data);
          if (!parsed.success) throw new UnrecoverableError("Invalid event payload");
          const handler = handlers.get(job.name as keyof EventMap);
          if (handler) await handler(parsed.data);
        },
        { connection, concurrency: Number(process.env.EVENTS_CONCURRENCY ?? 5) },
      );
    },
    async isHealthy() {
      return (await connection.ping()) === "PONG";
    },
    async close() {
      await worker?.close();
      await Promise.all([...queues.values()].map((queue) => queue.close()));
      await connection.quit();
    },
  };
}
