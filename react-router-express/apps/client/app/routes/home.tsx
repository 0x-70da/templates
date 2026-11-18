import { Link } from "react-router";
import { Button } from "@workspace/ui/components/button";

export function meta() {
  return [
    { title: "React Router + Express Monorepo" },
    { name: "description", content: "React Router v7 Framework Mode with Express 5" },
  ];
}

export default function Home() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center p-8 text-center">
      <h1 className="mb-4 text-3xl font-bold">React Router v7 + Express Monorepo</h1>
      <p className="text-muted-foreground mb-6">
        Full-stack React Router v7 Framework Mode paired with Express 5 REST API.
      </p>
      <div className="flex gap-4">
        <Link to="/test">
          <Button>Go to Test Page</Button>
        </Link>
      </div>
    </div>
  );
}
