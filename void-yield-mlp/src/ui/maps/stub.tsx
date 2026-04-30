// Placeholder for renderers that haven't been built yet. Each renderer
// gets its own file so the spectrum is shippable iteratively.

import type { MapRendererProps } from "./registry";

export function StubRenderer({ label }: { label: string }) {
  return (
    <div
      style={{
        height: 380,
        border: "1px dashed var(--line)",
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-dim)",
        fontFamily: "var(--mono)",
        fontSize: 12,
        background: "var(--bg-deep)",
      }}
    >
      [{label}] — not yet implemented
    </div>
  );
}

export function makeStub(label: string) {
  return function Stub(_props: MapRendererProps) {
    return <StubRenderer label={label} />;
  };
}
