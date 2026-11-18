import { Link } from "react-router-dom";
import { Button } from "@workspace/ui/components/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <h1 className="mb-2 text-4xl font-bold">404</h1>
      <p className="text-muted-foreground mb-6">The requested page does not exist.</p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
