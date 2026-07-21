import { createFileRoute, Link } from "@tanstack/react-router";
import { APP_NAME } from "@/constants/app";

export const Route = createFileRoute("/500")({
  head: () => ({
    meta: [
      { title: `Server error — ${APP_NAME}` },
      { name: "description", content: "Something went wrong on our end." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ServerErrorPage,
});

function ServerErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">500</h1>
        <h2 className="mt-4 text-xl font-semibold">Server error</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. Please try again.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
