"use client";

import { useEffect, useMemo, useState } from "react";

import { getHistory } from "@/features/history/api/history.api";
import type { HistoryResponse } from "@/features/history/model/history.types";
import type { HistoryPeriod, HistoryStatus } from "@/features/history/model/history.types";

import { HistoryFilters } from "./HistoryFilters";
import { HistoryList } from "./HistoryList";
import { HistorySummary } from "./HistorySummary";
import styles from "./HistoryPage.module.css";

export function HistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<HistoryPeriod>("7d");
  const [requisite, setRequisite] = useState("all");
  const [status, setStatus] = useState<HistoryStatus | "all">("completed");
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    queueMicrotask(() => setNow(Date.now()));
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void getHistory().then((response) => setData(response)).catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Не удалось загрузить историю");
      });
    });
  }, []);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    if (now === null) return [];
    const periodMs = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : null;
    return data.items.filter((item) => {
      const dateMatches = periodMs === null || now - new Date(item.createdAt).getTime() <= periodMs * 24 * 60 * 60 * 1000;
      const requisiteMatches = requisite === "all" || item.paymentMethod.toLowerCase() === (requisite === "sbp" ? "сбп" : "карта");
      const statusMatches = status === "all" || item.status === status;
      return dateMatches && requisiteMatches && statusMatches;
    });
  }, [data, now, period, requisite, status]);

  if (error) {
    return <main className={styles.page}>{error}</main>;
  }

  if (!data) {
    return <main className={styles.page}>Загрузка истории...</main>;
  }

  return (
    <main className={styles.page}>
      <HistorySummary
        summary={data.summary}
      />

      <HistoryFilters period={period} requisite={requisite} status={status} onPeriodChange={setPeriod} onRequisiteChange={setRequisite} onStatusChange={setStatus} />

      <HistoryList items={filteredItems} />
    </main>
  );
}
