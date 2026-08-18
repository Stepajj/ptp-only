import type { HistorySummary as HistorySummaryData } from "@/features/history/model/history.types";

import { HistorySummaryCard } from "./HistorySummaryCard";
import styles from "./HistorySummary.module.css";

interface HistorySummaryProps {
  summary: HistorySummaryData;
}

function formatRubles(value: number) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

export function HistorySummary({
  summary,
}: HistorySummaryProps) {
  return (
    <section className={styles.summary}>
      <HistorySummaryCard
        title="Принято за 7 дней"
        value={formatRubles(
          summary.receivedAmount,
        )}
        variant="dark"
      />

      <HistorySummaryCard
        title="Завершено заявок"
        value={summary.completedOrders.toString()}
      />

      <HistorySummaryCard
        title="Выдано от +7%"
        value={summary.bonusAmount === null ? "—" : `+${formatRubles(summary.bonusAmount)}`}
      />
    </section>
  );
}
