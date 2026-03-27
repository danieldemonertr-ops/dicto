"use client";

import { useEffect } from "react";

// Chama o check-in diário silenciosamente ao abrir o dashboard
export function DailyCheckin() {
  useEffect(() => {
    fetch("/api/daily-checkin", { method: "POST" }).catch(() => {});
  }, []);
  return null;
}
