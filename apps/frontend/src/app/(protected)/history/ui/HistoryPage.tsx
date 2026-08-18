"use client";

import { useEffect, useState } from "react";

import { getHistory } from "@/features/history/api/history.api";
import type { HistoryResponse } from "@/features/history/model/history.types";

import { HistoryFilters } from "./HistoryFilters";
import { HistoryList } from "./HistoryList";
import { HistorySummary } from "./HistorySummary";
import styles from "./HistoryPage.module.css";

export function HistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      void getHistory().then(setData).catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Не удалось загрузить историю");
      });
    });
  }, []);

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

      <HistoryFilters />

      <HistoryList items={data.items} />
    </main>
  );
}
