import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <h1 className="mb-4 text-3xl font-bold">Next.js Microservice Client</h1>
      <p className="mb-6 max-w-lg text-muted-foreground">
        Independent Next.js 16 frontend communicating with an Express 5 backend via explicit
        contracts.
      </p>
      <Link href="/test">
        <Button size="lg">Explore Test Domain</Button>
      </Link>
    </main>
  );
}
