import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <h2 className="mb-2 text-4xl font-bold">404</h2>
      <p className="mb-4 text-muted-foreground">Could not find requested resource.</p>
      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
