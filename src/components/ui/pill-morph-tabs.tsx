"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

export interface PillTab {
  value: string;
  label: React.ReactNode;
  panel?: React.ReactNode;
}

interface PillMorphTabsProps {
  items: PillTab[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  /** Background color for the container strip */
  bg?: string;
  /** Color of the active pill */
  pillColor?: string;
  /** Text color when active */
  activeTextColor?: string;
  /** Text color when inactive */
  inactiveTextColor?: string;
}

export function PillMorphTabs({
  items,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  bg = "#FFFFFF",
  pillColor = "#5DE08A",
  activeTextColor = "#111312",
  inactiveTextColor = "#6B7280",
}: PillMorphTabsProps) {
  const first = items[0]?.value ?? "tab-0";
  const [internalValue, setInternalValue] = React.useState<string>(
    controlledValue ?? defaultValue ?? first
  );

  const value = controlledValue ?? internalValue;

  function handleChange(v: string) {
    setInternalValue(v);
    onValueChange?.(v);
  }

  const listRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = React.useState<{ left: number; width: number } | null>(null);

  const measure = React.useCallback(() => {
    const list = listRef.current;
    const activeEl = triggerRefs.current[value];
    if (!list || !activeEl) { setIndicator(null); return; }
    const listRect = list.getBoundingClientRect();
    const tRect = activeEl.getBoundingClientRect();
    setIndicator({
      left: tRect.left - listRect.left + list.scrollLeft,
      width: tRect.width,
    });
  }, [value]);

  React.useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (listRef.current) ro.observe(listRef.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [measure]);

  return (
    <div className={className}>
      <Tabs value={value} onValueChange={handleChange}>
        {/* Tab bar */}
        <div
          ref={listRef}
          className="relative rounded-full p-1"
          style={{ background: bg, border: "1px solid #E5E7EB" }}
        >
          {/* Animated pill */}
          {indicator && (
            <motion.div
              layout
              initial={false}
              animate={{ left: indicator.left, width: indicator.width }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="absolute top-1 bottom-1 rounded-full pointer-events-none"
              style={{ background: pillColor, left: indicator.left, width: indicator.width }}
            />
          )}

          <TabsList className="relative flex">
            {items.map((it) => {
              const isActive = it.value === value;
              return (
                <TabsTrigger
                  key={it.value}
                  value={it.value}
                  ref={(el: HTMLButtonElement | null) => { triggerRefs.current[it.value] = el; }}
                  className="relative z-10 flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors outline-none"
                  style={{ color: isActive ? activeTextColor : inactiveTextColor }}
                >
                  {it.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Panels */}
        {items.map((it) => (
          <TabsContent key={it.value} value={it.value}>
            {it.panel ?? null}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
