import { useEffect, useRef, useState } from "react";

// Client-only Mermaid renderer. Mermaid is dynamically imported to keep it out of the SSR bundle.
export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mmd-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, securityLevel: "loose", theme: "default" });
        const { svg } = await mermaid.render(idRef.current, chart);
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return (
      <pre className="rounded border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
        Mermaid error: {error}
        {"\n\n"}
        {chart}
      </pre>
    );
  }
  return <div ref={ref} className="my-4 overflow-x-auto" />;
}
