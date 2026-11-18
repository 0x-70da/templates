import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <h1 className="mb-4 text-3xl font-bold">Next.js Full-Stack Template</h1>
      <p className="mb-6 max-w-lg text-muted-foreground">
        Next.js App Router, Server Actions, Drizzle ORM v1, PostgreSQL, Better Auth, and shadcn Base
        UI.
      </p>
      <Link href="/test">
        <Button size="lg">Explore Test Domain</Button>
      </Link>
    </main>
  );
}
