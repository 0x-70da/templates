import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { TestPage } from "@/pages/TestPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RouteErrorBoundary } from "@/components/error/RouteErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/test",
    element: <TestPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
