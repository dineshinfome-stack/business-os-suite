import { createFileRoute, Link } from "@tanstack/react-router";
import { APP_NAME } from "@/constants/app";

export const Route = createFileRoute("/403")({
  head: () => ({
    meta: [
      { title: `Forbidden — ${APP_NAME}` },
      { name: "description", content: "You don't have permission to view this page." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForbiddenPage,
});

function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">403</h1>
        <h2 className="mt-4 text-xl font-semibold">Forbidden</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You don't have permission to view this page.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
