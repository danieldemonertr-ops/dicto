"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface MorphingSquareProps {
  message?: string;
  messagePlacement?: "top" | "bottom" | "left" | "right";
  color?: string;
}

export function MorphingSquare({
  message,
  messagePlacement = "bottom",
  color = "#5DE08A",
  className,
  ...props
}: HTMLMotionProps<"div"> & MorphingSquareProps) {
  const isRow = messagePlacement === "left" || messagePlacement === "right";
  const isReverse = messagePlacement === "top" || messagePlacement === "left";

  return (
    <div
      className="flex items-center justify-center gap-3"
      style={{
        flexDirection: isRow ? (isReverse ? "row-reverse" : "row") : (isReverse ? "column-reverse" : "column"),
      }}
    >
      <motion.div
        className={className}
        style={{ width: 40, height: 40, background: color, borderRadius: "6%" }}
        animate={{
          borderRadius: ["6%", "50%", "6%"],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        {...props}
      />
      {message && (
        <p className="text-sm" style={{ color: "#6B7280" }}>
          {message}
        </p>
      )}
    </div>
  );
}
