"use client";

import { MorphingSquare } from "./morphing-square";

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = "Gerando com IA..." }: LoadingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(247,247,242,0.95)" }}
    >
      <MorphingSquare message={message} color="#5DE08A" messagePlacement="bottom" />
    </div>
  );
}
