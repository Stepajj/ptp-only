import type { HistoryResponse } from "@/features/history/model/history.types";

import { HistoryFilters } from "./HistoryFilters";
import { HistoryList } from "./HistoryList";
import { HistorySummary } from "./HistorySummary";
import styles from "./HistoryPage.module.css";

interface HistoryPageProps {
  data: HistoryResponse;
}

export function HistoryPage({
  data,
}: HistoryPageProps) {
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