import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function RouteErrorBoundary() {
  const error = useRouteError();

  let errorMessage = "An unexpected error occurred.";
  if (isRouteErrorResponse(error)) {
    errorMessage = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground mb-4">{errorMessage}</p>
      <Button onClick={() => window.location.reload()}>Retry</Button>
    </div>
  );
}
