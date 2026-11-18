import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function HomePage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center p-8 text-center">
      <h1 className="mb-4 text-3xl font-bold">React SPA Template</h1>
      <p className="text-muted-foreground mb-6">
        A clean, robust Vite SPA with React Router, TanStack Query, Zustand, and shadcn Base UI.
      </p>
      <div className="flex gap-4">
        <Link to="/test">
          <Button>Go to Test Page</Button>
        </Link>
      </div>
    </div>
  );
}
